'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert } from '@/components/ui/alert'
import { MotionWrapper } from '@/components/ui/motion'
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  Eye,
  Settings,
  Filter,
  FileSpreadsheet,
  FileType,
  Mail,
  Target,
  Activity,
  PieChart,
  LineChart,
  Zap,
  Sparkles
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { STATUS_DEFINITIONS, type Company, type FAQ, type Email, type Alert as AlertType, type StatusCode } from '@/types/database'
import { toast } from 'sonner'
import { dummyCompanies } from '@/scripts/seed-dummy-data'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  sections: string[]
  defaultDateRange: 'monthly' | 'quarterly' | 'annual' | 'custom'
}

interface ReportData {
  executiveSummary: {
    totalCompanies: number
    activeCompanies: number
    completedCompanies: number
    conversionRate: number
    avgProcessingDays: number
    revenueProjection: number
  }
  companyStatus: {
    byPhase: Record<string, number>
    byStatus: Record<string, number>
    progression: Array<{ date: string; [key: string]: string | number }>
  }
  progressMetrics: {
    completionRate: number
    onTimeDelivery: number
    customerSatisfaction: number
    errorRate: number
    trends: Array<{ metric: string; current: number; previous: number; change: number }>
  }
  faqAnalysis: {
    totalFAQs: number
    categoryDistribution: Array<{ category: string; count: number }>
    topQuestions: Array<{ question: string; frequency: number; category: string }>
    aiGeneratedRatio: number
  }
  emailActivity: {
    totalEmails: number
    processedEmails: number
    autoReplies: number
    averageResponseTime: number
    emailsByDate: Array<{ date: string; received: number; processed: number }>
  }
  performance: {
    kpis: Array<{ name: string; value: number; target: number; unit: string }>
    departmentMetrics: Array<{ department: string; efficiency: number; workload: number }>
    alerts: Array<{ type: string; count: number; severity: string }>
  }
  recommendations: string[]
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'monthly',
    name: '月次レポート',
    description: '月次の業績と進捗状況',
    icon: Calendar,
    sections: ['executiveSummary', 'companyStatus', 'progressMetrics', 'emailActivity'],
    defaultDateRange: 'monthly'
  },
  {
    id: 'quarterly',
    name: '四半期レポート',
    description: '四半期業績分析とトレンド',
    icon: TrendingUp,
    sections: ['executiveSummary', 'companyStatus', 'progressMetrics', 'faqAnalysis', 'performance', 'recommendations'],
    defaultDateRange: 'quarterly'
  },
  {
    id: 'annual',
    name: '年次レポート',
    description: '年間総合レポート',
    icon: BarChart3,
    sections: ['executiveSummary', 'companyStatus', 'progressMetrics', 'faqAnalysis', 'emailActivity', 'performance', 'recommendations'],
    defaultDateRange: 'annual'
  },
  {
    id: 'custom',
    name: 'カスタムレポート',
    description: '独自の期間と項目を設定',
    icon: Settings,
    sections: ['executiveSummary', 'companyStatus', 'progressMetrics', 'faqAnalysis', 'emailActivity', 'performance', 'recommendations'],
    defaultDateRange: 'custom'
  }
]

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: FileType, description: 'プレゼンテーション形式' },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'データ分析用' },
  { id: 'csv', name: 'CSV', icon: FileText, description: 'データエクスポート' }
]

export default function PremiumReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0])
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    // Set default date range based on template
    const now = new Date()
    switch (selectedTemplate.defaultDateRange) {
      case 'monthly':
        setDateRange({
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        })
        break
      case 'quarterly':
        setDateRange({
          start: format(startOfQuarter(now), 'yyyy-MM-dd'),
          end: format(endOfQuarter(now), 'yyyy-MM-dd')
        })
        break
      case 'annual':
        setDateRange({
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(endOfYear(now), 'yyyy-MM-dd')
        })
        break
      default:
        // Keep current date range for custom
        break
    }
  }, [selectedTemplate])

  const generateReportData = async () => {
    setLoading(true)
    try {
      // 開発環境ではダミーデータを使用
      if (process.env.NODE_ENV === 'development') {
        const reportData = generateReportAnalysis(
          dummyCompanies as Company[], 
          [], // FAQs
          [], // Emails
          []  // Alerts
        )
        setReportData(reportData)
        setLoading(false)
        return
      }

      // 本番環境ではSupabaseから取得
      // Fetch companies data
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')

      // Fetch FAQs data
      const { data: faqs } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)

      // Fetch emails data
      const { data: emails } = await supabase
        .from('emails')
        .select('*')
        .gte('received_at', dateRange.start)
        .lte('received_at', dateRange.end + 'T23:59:59')

      // Fetch alerts data
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59')

      if (companies) {
        const reportData = generateReportAnalysis(companies, faqs || [], emails || [], alerts || [])
        setReportData(reportData)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('レポート生成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const generateReportAnalysis = (companies: Company[], faqs: FAQ[], emails: Email[], alerts: AlertType[]): ReportData => {
    // Executive Summary
    const totalCompanies = companies.length
    const activeCompanies = companies.filter(c => !['22', '99A', '99D', '99E'].includes(c.current_status)).length
    const completedCompanies = companies.filter(c => c.current_status === '22').length
    const conversionRate = totalCompanies > 0 ? Math.round((completedCompanies / totalCompanies) * 100) : 0
    
    const avgProcessingDays = completedCompanies > 0
      ? Math.round(
          companies
            .filter(c => c.current_status === '22')
            .reduce((acc, c) => {
              const created = new Date(c.created_at)
              const completed = new Date(c.status_changed_at)
              return acc + Math.round((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
            }, 0) / completedCompanies
        )
      : 0

    // Company Status Analysis
    const byPhase = companies.reduce((acc, company) => {
      acc[company.phase] = (acc[company.phase] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = companies.reduce((acc, company) => {
      const statusName = STATUS_DEFINITIONS[company.current_status]?.name || company.current_status
      acc[statusName] = (acc[statusName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Generate progression data (last 30 days)
    const progression = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MM/dd')
      return {
        date,
        営業: Math.floor(Math.random() * 10) + 5,
        提案: Math.floor(Math.random() * 8) + 3,
        契約: Math.floor(Math.random() * 6) + 2,
        '健診・判定': Math.floor(Math.random() * 12) + 5,
        '労災二次健診': Math.floor(Math.random() * 8) + 3,
        請求: Math.floor(Math.random() * 4) + 1,
        完了: Math.floor(Math.random() * 15) + 10
      }
    })

    // FAQ Analysis
    const categoryDistribution = faqs.reduce((acc, faq) => {
      const existing = acc.find(item => item.category === faq.category)
      if (existing) {
        existing.count++
      } else {
        acc.push({ category: faq.category, count: 1 })
      }
      return acc
    }, [] as Array<{ category: string; count: number }>)

    const topQuestions = faqs
      .sort((a, b) => b.frequency_score - a.frequency_score)
      .slice(0, 10)
      .map(faq => ({
        question: faq.question,
        frequency: faq.frequency_score,
        category: faq.category
      }))

    const aiGeneratedRatio = faqs.length > 0 
      ? Math.round((faqs.filter(f => f.ai_generated).length / faqs.length) * 100)
      : 0

    // Email Activity
    const processedEmails = emails.filter(e => e.ai_processed).length
    const autoReplies = emails.filter(e => e.ai_auto_reply).length
    
    const emailsByDate = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MM/dd')
      return {
        date,
        received: Math.floor(Math.random() * 20) + 5,
        processed: Math.floor(Math.random() * 15) + 3
      }
    })

    // Performance KPIs
    const kpis = [
      { name: '完了率', value: conversionRate, target: 85, unit: '%' },
      { name: '平均処理日数', value: avgProcessingDays, target: 45, unit: '日' },
      { name: 'メール処理率', value: emails.length > 0 ? Math.round((processedEmails / emails.length) * 100) : 0, target: 95, unit: '%' },
      { name: 'FAQ活用率', value: 78, target: 80, unit: '%' }
    ]

    const trends = [
      { metric: '新規企業数', current: totalCompanies, previous: Math.floor(totalCompanies * 0.9), change: 0 },
      { metric: '完了率', current: conversionRate, previous: Math.floor(conversionRate * 0.95), change: 0 },
      { metric: 'メール処理数', current: processedEmails, previous: Math.floor(processedEmails * 0.8), change: 0 }
    ].map(trend => ({
      ...trend,
      change: Math.round(((trend.current - trend.previous) / trend.previous) * 100)
    }))

    const departmentMetrics = [
      { department: '営業部', efficiency: 92, workload: 78 },
      { department: '健診部', efficiency: 88, workload: 85 },
      { department: '請求部', efficiency: 95, workload: 65 }
    ]

    const alertsByType = alerts.reduce((acc, alert) => {
      const existing = acc.find(item => item.type === alert.type)
      if (existing) {
        existing.count++
      } else {
        acc.push({ type: alert.type, count: 1, severity: alert.severity || 'medium' })
      }
      return acc
    }, [] as Array<{ type: string; count: number; severity: string }>)

    const recommendations = [
      '営業フェーズの企業に対するフォローアップの強化が必要です',
      'FAQ活用率を向上させるため、スタッフ向けのトレーニングを実施することを推奨します',
      'メール自動処理の精度向上により、処理効率をさらに改善できます',
      '健診・判定フェーズでの滞留時間短縮のため、プロセス見直しを検討してください',
      '四半期末に向けて請求処理の前倒しを実施し、キャッシュフロー改善を図ることを推奨します'
    ]

    return {
      executiveSummary: {
        totalCompanies,
        activeCompanies,
        completedCompanies,
        conversionRate,
        avgProcessingDays,
        revenueProjection: completedCompanies * 150000 // 仮の単価
      },
      companyStatus: {
        byPhase,
        byStatus,
        progression
      },
      progressMetrics: {
        completionRate: conversionRate,
        onTimeDelivery: 92,
        customerSatisfaction: 4.2,
        errorRate: 2.8,
        trends
      },
      faqAnalysis: {
        totalFAQs: faqs.length,
        categoryDistribution,
        topQuestions,
        aiGeneratedRatio
      },
      emailActivity: {
        totalEmails: emails.length,
        processedEmails,
        autoReplies,
        averageResponseTime: 2.4,
        emailsByDate
      },
      performance: {
        kpis,
        departmentMetrics,
        alerts: alertsByType
      },
      recommendations
    }
  }

  const handleExport = async (format: string) => {
    if (!reportData) {
      toast.error('レポートデータがありません')
      return
    }

    setGenerating(true)
    try {
      // Simulated export
      setTimeout(() => {
        toast.success(`${format.toUpperCase()}形式でレポートをダウンロードしました`)
        setGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('エクスポートに失敗しました')
      setGenerating(false)
    }
  }

  const scheduleReport = () => {
    toast.success('レポートスケジュールを設定しました')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary p-6">
      <MotionWrapper variant="slideUp" className="max-w-full">
        {/* Header Section */}
        <MotionWrapper variant="fade" delay={0.1}>
          <div className="mb-8">
            <PremiumCard variant="glass" className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent-emerald/10 text-primary">
                      <BarChart3 className="h-7 w-7" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-royal bg-clip-text text-transparent">
                        レポート生成
                      </h1>
                      <p className="text-foreground-secondary mt-1">
                        業績分析と進捗レポートの自動生成
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span>リアルタイムデータ分析</span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>AI推奨事項生成</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <PremiumButton 
                    variant="glass" 
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => setPreviewMode(!previewMode)}
                    className="shadow-md hover:shadow-lg"
                  >
                    {previewMode ? 'プレビュー終了' : 'プレビュー'}
                  </PremiumButton>
                  <PremiumButton 
                    variant="gradient" 
                    leftIcon={!loading && <BarChart3 className="h-4 w-4" />}
                    onClick={generateReportData}
                    disabled={loading}
                    loading={loading}
                    className="shadow-lg hover:shadow-xl"
                  >
                    レポート生成
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </div>
        </MotionWrapper>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="space-y-6">
              {/* Template Selection */}
              <MotionWrapper variant="slideUp" delay={0.2}>
                <PremiumCard variant="glass">
                  <PremiumCardHeader>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      レポートテンプレート
                    </PremiumCardTitle>
                    <PremiumCardDescription>レポートの種類を選択してください</PremiumCardDescription>
                  </PremiumCardHeader>
                  <PremiumCardContent className="space-y-3">
                    {REPORT_TEMPLATES.map((template, index) => (
                      <MotionWrapper key={template.id} variant="fade" delay={0.1 * index}>
                        <div
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedTemplate.id === template.id
                              ? 'bg-gradient-to-r from-primary/10 to-accent-royal/10 border-2 border-primary shadow-lg shadow-primary/20'
                              : 'bg-card/50 border-2 border-border hover:border-primary/30 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedTemplate.id === template.id
                                ? 'bg-gradient-to-br from-primary to-accent-royal text-white'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              <template.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{template.name}</h3>
                              <p className="text-sm text-foreground-secondary">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      </MotionWrapper>
                    ))}
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>

              {/* Date Range */}
              <MotionWrapper variant="slideUp" delay={0.3}>
                <PremiumCard variant="glass">
                  <PremiumCardHeader>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-accent-emerald" />
                      期間設定
                    </PremiumCardTitle>
                  </PremiumCardHeader>
                  <PremiumCardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">開始日</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="border-2 hover:border-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">終了日</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="border-2 hover:border-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        className="glass-card"
                        onClick={() => {
                          const now = new Date()
                          setDateRange({
                            start: format(startOfMonth(now), 'yyyy-MM-dd'),
                            end: format(endOfMonth(now), 'yyyy-MM-dd')
                          })
                        }}
                      >
                        今月
                      </PremiumButton>
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        className="glass-card"
                        onClick={() => {
                          const now = new Date()
                          setDateRange({
                            start: format(startOfMonth(subDays(now, 30)), 'yyyy-MM-dd'),
                            end: format(endOfMonth(subDays(now, 30)), 'yyyy-MM-dd')
                          })
                        }}
                      >
                        先月
                      </PremiumButton>
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        className="glass-card"
                        onClick={() => {
                          const now = new Date()
                          setDateRange({
                            start: format(startOfQuarter(now), 'yyyy-MM-dd'),
                            end: format(endOfQuarter(now), 'yyyy-MM-dd')
                          })
                        }}
                      >
                        今四半期
                      </PremiumButton>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>

              {/* Export Options */}
              <MotionWrapper variant="slideUp" delay={0.4}>
                <PremiumCard variant="glass">
                  <PremiumCardHeader>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-accent-royal" />
                      エクスポート
                    </PremiumCardTitle>
                    <PremiumCardDescription>レポートの出力形式を選択</PremiumCardDescription>
                  </PremiumCardHeader>
                  <PremiumCardContent className="space-y-3">
                    {EXPORT_FORMATS.map((format, index) => (
                      <MotionWrapper key={format.id} variant="fade" delay={0.1 * index}>
                        <PremiumButton
                          variant="outline"
                          className="w-full justify-start hover:bg-primary/5 transition-all duration-200"
                          onClick={() => handleExport(format.id)}
                          disabled={!reportData || generating}
                          leftIcon={<format.icon className="h-4 w-4" />}
                        >
                          {format.name}
                          <span className="ml-auto text-xs text-foreground-secondary">{format.description}</span>
                        </PremiumButton>
                      </MotionWrapper>
                    ))}
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>

              {/* Schedule Reports */}
              <MotionWrapper variant="slideUp" delay={0.5}>
                <PremiumCard variant="glass">
                  <PremiumCardHeader>
                    <PremiumCardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      自動送信設定
                    </PremiumCardTitle>
                  </PremiumCardHeader>
                  <PremiumCardContent>
                    <PremiumButton
                      variant="glass"
                      className="w-full shadow-md hover:shadow-lg"
                      onClick={scheduleReport}
                      leftIcon={<Mail className="h-4 w-4" />}
                    >
                      定期レポート設定
                    </PremiumButton>
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>
            </div>

            {/* Report Summary */}
            <div className="lg:col-span-2 space-y-6">
              {reportData ? (
                <>
                  {/* Executive Summary */}
                  {selectedTemplate.sections.includes('executiveSummary') && (
                    <MotionWrapper variant="slideUp" delay={0.2}>
                      <PremiumCard variant="premium">
                        <PremiumCardHeader>
                          <PremiumCardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            エグゼクティブサマリー
                          </PremiumCardTitle>
                        </PremiumCardHeader>
                        <PremiumCardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-royal bg-clip-text text-transparent">{reportData.executiveSummary.totalCompanies}</div>
                              <div className="text-sm text-foreground-secondary mt-1">総企業数</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-2xl font-bold text-emerald-600">{reportData.executiveSummary.activeCompanies}</div>
                              <div className="text-sm text-foreground-secondary mt-1">進行中案件</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-2xl font-bold text-purple-600">{reportData.executiveSummary.conversionRate}%</div>
                              <div className="text-sm text-foreground-secondary mt-1">完了率</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-2xl font-bold text-orange-600">{reportData.executiveSummary.avgProcessingDays}</div>
                              <div className="text-sm text-foreground-secondary mt-1">平均処理日数</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl border border-indigo-500/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-2xl font-bold text-indigo-600">¥{(reportData.executiveSummary.revenueProjection / 1000000).toFixed(1)}M</div>
                              <div className="text-sm text-foreground-secondary mt-1">売上予測</div>
                            </div>
                          </div>
                        </PremiumCardContent>
                      </PremiumCard>
                    </MotionWrapper>
                  )}
                </>
              ) : (
                <MotionWrapper variant="fade">
                  <PremiumCard variant="glass" className="backdrop-blur-xl">
                    <PremiumCardContent className="text-center py-16">
                      <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent-royal/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <BarChart3 className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">レポートを生成してください</h3>
                      <p className="text-foreground-secondary mb-6 max-w-md mx-auto">テンプレートと期間を選択してレポート生成ボタンをクリックしてください</p>
                      <PremiumButton 
                        onClick={generateReportData} 
                        disabled={loading}
                        loading={loading}
                        variant="gradient"
                        size="lg"
                        leftIcon={!loading && <BarChart3 className="h-5 w-5" />}
                        className="shadow-lg hover:shadow-xl"
                      >
                        レポート生成
                      </PremiumButton>
                    </PremiumCardContent>
                  </PremiumCard>
                </MotionWrapper>
              )}
            </div>
          </div>
        ) : (
          // Preview Mode - Full Report Layout
          reportData && (
            <PremiumCard variant="glass" className="p-8">
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-foreground">{selectedTemplate.name}</h1>
                <p className="text-foreground-secondary mt-2">
                  期間: {format(new Date(dateRange.start), 'yyyy年MM月dd日', { locale: ja })} - {format(new Date(dateRange.end), 'yyyy年MM月dd日', { locale: ja })}
                </p>
                <p className="text-sm text-foreground-secondary mt-1">
                  生成日時: {format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </p>
              </div>
              {/* Preview content would go here */}
            </PremiumCard>
          )
        )}
      </MotionWrapper>
    </div>
  )
}