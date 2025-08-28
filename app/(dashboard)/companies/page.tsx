'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Company, STATUS_DEFINITIONS, StatusCode } from '@/types/database'
import { dummyCompanies } from '@/scripts/seed-dummy-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Building2,
  Filter,
  Download,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchQuery, filterStatus, filterPhase])

  const fetchCompanies = async () => {
    try {
      // 開発環境ではダミーデータを使用
      if (process.env.NODE_ENV === 'development') {
        setCompanies(dummyCompanies as Company[])
        setLoading(false)
        return
      }

      // 本番環境ではSupabaseから取得
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching companies:', error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = [...companies]

    // 検索フィルタ
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // ステータスフィルタ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company => company.current_status === filterStatus)
    }

    // フェーズフィルタ
    if (filterPhase !== 'all') {
      filtered = filtered.filter(company => company.phase === filterPhase)
    }

    setFilteredCompanies(filtered)
  }

  const getStatusColor = (status: string) => {
    const phase = STATUS_DEFINITIONS[status as StatusCode]?.phase
    switch (phase) {
      case '営業': return 'bg-blue-100 text-blue-800'
      case '提案': return 'bg-purple-100 text-purple-800'
      case '契約': return 'bg-green-100 text-green-800'
      case '健診・判定': return 'bg-yellow-100 text-yellow-800'
      case '労災二次健診': return 'bg-orange-100 text-orange-800'
      case '請求': return 'bg-pink-100 text-pink-800'
      case '完了': return 'bg-gray-100 text-gray-800'
      case '特殊': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportCSV = () => {
    const headers = ['企業名', '企業コード', '現在ステータス', 'フェーズ', '担当者', 'メール', '電話番号', '最終更新']
    const rows = filteredCompanies.map(company => [
      company.name,
      company.code || '',
      STATUS_DEFINITIONS[company.current_status]?.name || company.current_status,
      company.phase,
      company.contact_person || '',
      company.contact_email || '',
      company.contact_phone || '',
      format(new Date(company.updated_at), 'yyyy/MM/dd HH:mm', { locale: ja })
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `企業一覧_${format(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const phases = ['営業', '提案', '契約', '健診・判定', '労災二次健診', '請求', '完了', '特殊']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">企業管理</h1>
          <p className="text-gray-600">全 {filteredCompanies.length} 社</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV出力
          </Button>
          <Link href="/companies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規企業登録
            </Button>
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="企業名、コード、担当者で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全フェーズ</option>
              {phases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              {Object.entries(STATUS_DEFINITIONS).map(([code, def]) => (
                <option key={code} value={code}>{def.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 企業テーブル */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企業名</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>フェーズ</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>最終更新</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.code && (
                          <div className="text-sm text-gray-500">{company.code}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.current_status)}>
                        {STATUS_DEFINITIONS[company.current_status]?.name || company.current_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.phase}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{company.contact_person || '-'}</div>
                        {company.contact_email && (
                          <div className="text-xs text-gray-500">{company.contact_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(company.updated_at), 'MM/dd', { locale: ja })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(company.updated_at), 'HH:mm', { locale: ja })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/companies/${company.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/companies/${company.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}