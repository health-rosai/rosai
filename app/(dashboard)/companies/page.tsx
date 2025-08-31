'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Company, STATUS_DEFINITIONS, StatusCode } from '@/types/database'
import { dummyCompanies } from '@/scripts/seed-dummy-data'
import { 
  PremiumCard, 
  PremiumCardContent, 
  PremiumCardDescription, 
  PremiumCardHeader, 
  PremiumCardTitle,
  StatsCard,
  FeatureCard
} from '@/components/ui/premium-card'
import { PremiumButton, CTAButton, IconButton } from '@/components/ui/premium-button'
import { Input } from '@/components/ui/input'
import { MotionWrapper, StaggerList, StaggerItem, HoverScale, LoadingSpinner } from '@/components/ui/motion'
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
  ChevronRight,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  MapPin
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary flex items-center justify-center">
        <MotionWrapper variant="fade">
          <div className="text-center space-y-4">
            <LoadingSpinner size={48} className="text-primary mx-auto" />
            <div className="text-lg font-medium text-foreground-secondary">
              企業データを読み込み中...
            </div>
          </div>
        </MotionWrapper>
      </div>
    )
  }

  const phases = ['営業', '提案', '契約', '健診・判定', '労災二次健診', '請求', '完了', '特殊']

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      {/* Premium Hero Section */}
      <MotionWrapper variant="slideUp" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent-emerald/5" />
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <MotionWrapper variant="fade" delay={0.1}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent-emerald/10 border border-primary/20">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent-emerald bg-clip-text text-transparent">
                        企業管理
                      </h1>
                      <p className="text-lg text-foreground-secondary mt-1">
                        全 {filteredCompanies.length} 社の企業情報を管理
                      </p>
                    </div>
                  </div>
                </MotionWrapper>

                <MotionWrapper variant="fade" delay={0.2}>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Activity className="h-4 w-4" />
                      リアルタイム管理
                    </span>
                    <span className="text-sm text-foreground-tertiary">
                      最終更新: {format(new Date(), 'HH:mm', { locale: ja })}
                    </span>
                  </div>
                </MotionWrapper>
              </div>

              <MotionWrapper variant="fade" delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <PremiumButton 
                    variant="outline" 
                    onClick={exportCSV}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    CSV出力
                  </PremiumButton>
                  <Link href="/companies/new">
                    <CTAButton leftIcon={<Plus className="h-4 w-4" />}>
                      新規企業登録
                    </CTAButton>
                  </Link>
                </div>
              </MotionWrapper>
            </div>
          </div>
        </div>
      </MotionWrapper>

      {/* Premium Stats Overview */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <MotionWrapper variant="slideUp" delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="総企業数"
                value={companies.length}
                icon={<Building2 className="h-5 w-5" />}
                color="blue"
                variant="premium"
              />
              <StatsCard
                title="アクティブ企業"
                value={companies.filter(c => !['99A', '99D', '99E'].includes(c.current_status)).length}
                icon={<Activity className="h-5 w-5" />}
                color="green"
                variant="glow"
              />
              <StatsCard
                title="今月更新"
                value={companies.filter(c => {
                  const updated = new Date(c.updated_at);
                  const now = new Date();
                  return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
                }).length}
                icon={<TrendingUp className="h-5 w-5" />}
                color="purple"
                variant="floating"
              />
              <StatsCard
                title="表示中"
                value={filteredCompanies.length}
                icon={<Filter className="h-5 w-5" />}
                color="amber"
                variant="interactive"
              />
            </div>
          </MotionWrapper>

          {/* Premium Filter Section */}
          <MotionWrapper variant="slideUp" delay={0.5}>
            <PremiumCard variant="glass" size="lg" className="mb-8">
              <PremiumCardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent-emerald/10">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <PremiumCardTitle>検索・フィルター</PremiumCardTitle>
                    <PremiumCardDescription>企業データを効率的に検索</PremiumCardDescription>
                  </div>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary h-4 w-4" />
                    <Input
                      placeholder="企業名、コード、担当者で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterPhase}
                      onChange={(e) => setFilterPhase(e.target.value)}
                      className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground"
                    >
                      <option value="all">全フェーズ</option>
                      {phases.map(phase => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground"
                    >
                      <option value="all">全ステータス</option>
                      {Object.entries(STATUS_DEFINITIONS).map(([code, def]) => (
                        <option key={code} value={code}>{def.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </MotionWrapper>

          {/* Premium Companies Table */}
          <MotionWrapper variant="slideUp" delay={0.6}>
            <PremiumCard variant="premium" size="lg">
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <PremiumCardTitle className="text-xl">企業一覧</PremiumCardTitle>
                      <PremiumCardDescription className="text-base">
                        {filteredCompanies.length} 社の詳細情報
                      </PremiumCardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <PremiumButton variant="ghost" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
                      フィルター
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCardHeader>
              
              <PremiumCardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-foreground-secondary">企業名</TableHead>
                        <TableHead className="font-semibold text-foreground-secondary">ステータス</TableHead>
                        <TableHead className="font-semibold text-foreground-secondary">フェーズ</TableHead>
                        <TableHead className="font-semibold text-foreground-secondary">担当者</TableHead>
                        <TableHead className="font-semibold text-foreground-secondary">最終更新</TableHead>
                        <TableHead className="text-right font-semibold text-foreground-secondary">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company, index) => (
                        <TableRow 
                          key={company.id} 
                          className="hover:bg-muted/20 transition-all group border-border/50"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent-emerald/20 flex items-center justify-center border border-primary/20">
                                <span className="text-sm font-semibold text-primary">
                                  {company.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {company.name}
                                </div>
                                {company.code && (
                                  <div className="text-sm text-foreground-tertiary">{company.code}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(company.current_status)} border border-current/20`}>
                              {STATUS_DEFINITIONS[company.current_status]?.name || company.current_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground">
                              {company.phase}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {company.contact_person || '-'}
                              </div>
                              {company.contact_email && (
                                <div className="text-xs text-foreground-tertiary">{company.contact_email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground">
                              {format(new Date(company.updated_at), 'MM/dd', { locale: ja })}
                            </div>
                            <div className="text-xs text-foreground-tertiary">
                              {format(new Date(company.updated_at), 'HH:mm', { locale: ja })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/companies/${company.id}`}>
                                <IconButton 
                                  icon={<Eye className="h-4 w-4" />}
                                  variant="ghost" 
                                  size="sm"
                                  tooltip="詳細表示"
                                />
                              </Link>
                              <IconButton 
                                icon={<Edit className="h-4 w-4" />}
                                variant="outline" 
                                size="sm"
                                tooltip="編集"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Premium Mobile Card View */}
                <div className="md:hidden space-y-4">
                  <StaggerList>
                    {filteredCompanies.map((company) => (
                      <StaggerItem key={company.id}>
                        <PremiumCard variant="interactive" className="group">
                          <PremiumCardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent-emerald/20 flex items-center justify-center border border-primary/20">
                                  <span className="text-lg font-semibold text-primary">
                                    {company.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {company.name}
                                  </h3>
                                  {company.code && (
                                    <p className="text-sm text-foreground-tertiary">{company.code}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/companies/${company.id}`}>
                                  <IconButton 
                                    icon={<Eye className="h-4 w-4" />}
                                    variant="ghost" 
                                    size="sm"
                                  />
                                </Link>
                                <IconButton 
                                  icon={<Edit className="h-4 w-4" />}
                                  variant="outline" 
                                  size="sm"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-foreground-secondary font-medium mb-1">ステータス</p>
                                <Badge className={`${getStatusColor(company.current_status)} border border-current/20`}>
                                  {STATUS_DEFINITIONS[company.current_status]?.name || company.current_status}
                                </Badge>
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground">
                                  {company.phase}
                                </span>
                              </div>
                              <div>
                                <p className="text-foreground-secondary font-medium mb-1">担当者</p>
                                <p className="font-medium text-foreground">{company.contact_person || '-'}</p>
                                {company.contact_email && (
                                  <p className="text-xs text-foreground-tertiary mt-1">{company.contact_email}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-foreground-secondary font-medium mb-1">最終更新</p>
                                <p className="font-medium text-foreground">
                                  {format(new Date(company.updated_at), 'MM/dd HH:mm', { locale: ja })}
                                </p>
                              </div>
                            </div>
                          </PremiumCardContent>
                        </PremiumCard>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </MotionWrapper>
        </div>
      </div>
    </div>
  )
}