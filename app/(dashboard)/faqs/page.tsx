'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FAQ, FAQCategory, FAQStatus } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  CheckCircle,
  Edit,
  Eye,
  Trash2,
  Upload,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<FAQStatus | 'all'>('all')
  const [selectedFAQs, setSelectedFAQs] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('frequency_score', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching FAQs:', error)
        return
      }

      setFaqs(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (faqId: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', faqId)

      if (error) throw error

      toast.success('FAQを承認しました')
      fetchFAQs()
    } catch (error) {
      toast.error('承認に失敗しました')
    }
  }

  const handlePublish = async () => {
    if (selectedFAQs.length === 0) {
      toast.error('公開するFAQを選択してください')
      return
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .update({ status: 'published' })
        .in('id', selectedFAQs)
        .eq('status', 'approved')

      if (error) throw error

      toast.success(`${selectedFAQs.length}件のFAQを公開しました`)
      setSelectedFAQs([])
      fetchFAQs()
    } catch (error) {
      toast.error('公開に失敗しました')
    }
  }

  const handleGenerateFAQs = async () => {
    try {
      const response = await fetch('/api/faqs/generate', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('FAQ生成を開始しました')
        setTimeout(fetchFAQs, 3000)
      } else {
        toast.error('FAQ生成に失敗しました')
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    }
  }

  const getStatusBadge = (status: FAQStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      draft: 'ドラフト',
      reviewing: 'レビュー中',
      approved: '承認済み',
      published: '公開中',
      archived: 'アーカイブ'
    }

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getCategoryBadge = (category: FAQCategory) => {
    const colors = {
      '契約': 'bg-purple-100 text-purple-800',
      '請求': 'bg-pink-100 text-pink-800',
      '健診': 'bg-yellow-100 text-yellow-800',
      '判定': 'bg-orange-100 text-orange-800',
      'サービス全般': 'bg-blue-100 text-blue-800',
      'その他': 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={colors[category]}>
        {category}
      </Badge>
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && faq.status !== selectedStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const categories: FAQCategory[] = ['契約', '請求', '健診', '判定', 'サービス全般', 'その他']
  const statuses: FAQStatus[] = ['draft', 'reviewing', 'approved', 'published', 'archived']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ管理</h1>
          <p className="text-gray-600">全 {filteredFAQs.length} 件</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateFAQs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            FAQ自動生成
          </Button>
          {selectedFAQs.length > 0 && (
            <Button onClick={handlePublish}>
              <Upload className="h-4 w-4 mr-2" />
              選択したFAQを公開 ({selectedFAQs.length})
            </Button>
          )}
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FAQCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全カテゴリ</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as FAQStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* FAQ一覧 */}
      <div className="grid gap-4">
        {filteredFAQs.map((faq) => (
          <Card key={faq.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getCategoryBadge(faq.category)}
                    {getStatusBadge(faq.status)}
                    {faq.ai_generated && (
                      <Badge variant="outline">AI生成</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {faq.status === 'approved' && !selectedFAQs.includes(faq.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFAQs([...selectedFAQs, faq.id])}
                    >
                      選択
                    </Button>
                  )}
                  {selectedFAQs.includes(faq.id) && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setSelectedFAQs(selectedFAQs.filter(id => id !== faq.id))}
                    >
                      選択解除
                    </Button>
                  )}
                  {faq.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(faq.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      承認
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  頻度スコア: {(faq.frequency_score * 100).toFixed(0)}%
                </div>
                <div>
                  信頼度: {(faq.confidence * 100).toFixed(0)}%
                </div>
                <div>
                  ソース数: {faq.source_count}
                </div>
                {faq.usage_count > 0 && (
                  <div>
                    使用回数: {faq.usage_count}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}