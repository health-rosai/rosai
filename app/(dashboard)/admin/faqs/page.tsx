'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, 
  FileQuestion, CheckCircle, XCircle, TrendingUp 
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  is_published: boolean
  view_count: number
  helpful_count: number
  frequency_score: number
  ai_generated: boolean
  created_at: string
}

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showOnlyPublished, setShowOnlyPublished] = useState(false)

  // デモデータを生成
  useEffect(() => {
    const demoFAQs: FAQ[] = [
      {
        id: '1',
        question: '労災二次健診の対象者は誰ですか？',
        answer: '定期健康診断で血圧、血中脂質、血糖、腹囲の4項目すべてに異常所見があった労働者が対象です。',
        category: '対象者',
        tags: ['基本', '条件', '資格'],
        is_published: true,
        view_count: 234,
        helpful_count: 189,
        frequency_score: 0.95,
        ai_generated: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        question: '二次健診の費用は誰が負担しますか？',
        answer: '労災保険から給付されるため、労働者の自己負担はありません。事業主の負担もありません。',
        category: '費用',
        tags: ['費用', '保険', '給付'],
        is_published: true,
        view_count: 189,
        helpful_count: 156,
        frequency_score: 0.92,
        ai_generated: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        question: '二次健診はいつまでに受診する必要がありますか？',
        answer: '一次健診の結果通知から3ヶ月以内に受診する必要があります。期限を過ぎると労災保険の給付を受けられなくなります。',
        category: '期限',
        tags: ['期限', '手続き', '重要'],
        is_published: true,
        view_count: 167,
        helpful_count: 134,
        frequency_score: 0.88,
        ai_generated: true,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        question: '二次健診の検査項目は何ですか？',
        answer: '空腹時血糖値、HbA1c、血中脂質検査、負荷心電図、頸部エコー検査、微量アルブミン尿検査などが含まれます。',
        category: '検査内容',
        tags: ['検査', '項目', '内容'],
        is_published: false,
        view_count: 89,
        helpful_count: 67,
        frequency_score: 0.75,
        ai_generated: false,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        question: '保健指導は必須ですか？',
        answer: '二次健診の結果、脳・心臓疾患のリスクが高いと判断された場合は、医師による保健指導を受ける必要があります。',
        category: '保健指導',
        tags: ['指導', '必須', 'フォローアップ'],
        is_published: true,
        view_count: 123,
        helpful_count: 98,
        frequency_score: 0.82,
        ai_generated: false,
        created_at: new Date().toISOString()
      }
    ]
    setFaqs(demoFAQs)
  }, [])

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesPublished = !showOnlyPublished || faq.is_published
    return matchesSearch && matchesCategory && matchesPublished
  })

  const categories = ['all', '対象者', '費用', '期限', '検査内容', '保健指導', '手続き', 'その他']

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (selectedFAQ) {
      setFaqs(faqs.map(f => f.id === selectedFAQ.id ? selectedFAQ : f))
      setIsEditing(false)
      setSelectedFAQ(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('このFAQを削除しますか？')) {
      setFaqs(faqs.filter(f => f.id !== id))
    }
  }

  const togglePublish = (id: string) => {
    setFaqs(faqs.map(f => 
      f.id === id ? { ...f, is_published: !f.is_published } : f
    ))
  }

  const handleNew = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      category: 'その他',
      tags: [],
      is_published: false,
      view_count: 0,
      helpful_count: 0,
      frequency_score: 0,
      ai_generated: false,
      created_at: new Date().toISOString()
    }
    setSelectedFAQ(newFAQ)
    setIsEditing(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">FAQ管理</h1>
        <p className="text-muted-foreground">よくある質問の管理と編集</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">FAQ一覧</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* 検索・フィルター */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="質問や回答を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="カテゴリ" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'すべて' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showOnlyPublished ? "default" : "outline"}
                  onClick={() => setShowOnlyPublished(!showOnlyPublished)}
                >
                  {showOnlyPublished ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  公開中のみ
                </Button>
                <Button onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  新規作成
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ一覧 */}
          <div className="grid gap-4">
            {filteredFAQs.map(faq => (
              <Card key={faq.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{faq.question}</h3>
                        {faq.ai_generated && (
                          <Badge variant="secondary" className="text-xs">
                            AI生成
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{faq.answer}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{faq.category}</Badge>
                        <span className="text-muted-foreground">
                          <Eye className="inline h-3 w-3 mr-1" />
                          {faq.view_count}
                        </span>
                        <span className="text-muted-foreground">
                          <CheckCircle className="inline h-3 w-3 mr-1" />
                          {faq.helpful_count}
                        </span>
                        <span className="text-muted-foreground">
                          頻度スコア: {(faq.frequency_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(faq.id)}
                      >
                        {faq.is_published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>総FAQ数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{faqs.length}</p>
                <p className="text-sm text-muted-foreground">
                  公開中: {faqs.filter(f => f.is_published).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>総閲覧数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {faqs.reduce((sum, f) => sum + f.view_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  前月比 +23%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>平均有用性</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {Math.round(
                    faqs.reduce((sum, f) => sum + (f.helpful_count / f.view_count * 100), 0) / faqs.length
                  )}%
                </p>
                <p className="text-sm text-muted-foreground">
                  ユーザー評価
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.filter(c => c !== 'all').map(category => {
                  const count = faqs.filter(f => f.category === category).length
                  const percentage = (count / faqs.length * 100).toFixed(0)
                  return (
                    <div key={category} className="flex items-center gap-2">
                      <span className="w-20 text-sm">{category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{count}件</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FAQ自動生成設定</CardTitle>
              <CardDescription>
                メールから自動的にFAQを生成する設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>生成閾値（メール数）</Label>
                <Input type="number" defaultValue="100" />
                <p className="text-sm text-muted-foreground">
                  この数のメールが蓄積されたら自動生成を実行
                </p>
              </div>
              <div className="space-y-2">
                <Label>最小頻度スコア</Label>
                <Input type="number" step="0.1" defaultValue="0.7" />
                <p className="text-sm text-muted-foreground">
                  このスコア以上のFAQのみを生成
                </p>
              </div>
              <Button>設定を保存</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 編集モーダル */}
      {isEditing && selectedFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>FAQ編集</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>質問</Label>
                <Textarea
                  value={selectedFAQ.question}
                  onChange={(e) => setSelectedFAQ({...selectedFAQ, question: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>回答</Label>
                <Textarea
                  value={selectedFAQ.answer}
                  onChange={(e) => setSelectedFAQ({...selectedFAQ, answer: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Select 
                  value={selectedFAQ.category}
                  onValueChange={(value) => setSelectedFAQ({...selectedFAQ, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSave}>
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}