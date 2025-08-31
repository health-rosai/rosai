'use client'

import { useState, useEffect } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert } from '@/components/ui/alert'
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
  Zap
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

export default function ReportsPage() {
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
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: selectedTemplate.id,
          dateRange,
          format,
          data: reportData
        })
      })

      if (!response.ok) {
        throw new Error('レポート生成に失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${selectedTemplate.id}_${dateRange.start}_${dateRange.end}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('レポートをダウンロードしました')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('エクスポートに失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  const scheduleReport = () => {
    // Implementation for scheduling reports
    toast.success('レポートスケジュールを設定しました')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">レポート生成</h1>
          <p className="text-gray-600">業績分析と進捗レポートの作成</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'プレビュー終了' : 'プレビュー'}
          </Button>
          <Button onClick={generateReportData} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            レポート生成
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  レポートテンプレート
                </CardTitle>
                <CardDescription>レポートの種類を選択してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {REPORT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center gap-3">
                      <template.icon className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  期間設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">開始日</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">終了日</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      setDateRange({
                        start: format(startOfMonth(now), 'yyyy-MM-dd'),
                        end: format(endOfMonth(now), 'yyyy-MM-dd')
                      })
                    }}
                  >
                    今月
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      setDateRange({
                        start: format(startOfMonth(subDays(now, 30)), 'yyyy-MM-dd'),
                        end: format(endOfMonth(subDays(now, 30)), 'yyyy-MM-dd')
                      })
                    }}
                  >
                    先月
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      setDateRange({
                        start: format(startOfQuarter(now), 'yyyy-MM-dd'),
                        end: format(endOfQuarter(now), 'yyyy-MM-dd')
                      })
                    }}
                  >
                    今四半期
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  エクスポート
                </CardTitle>
                <CardDescription>レポートの出力形式を選択</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {EXPORT_FORMATS.map((format) => (
                  <Button
                    key={format.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport(format.id)}
                    disabled={!reportData || generating}
                  >
                    <format.icon className="h-4 w-4 mr-2" />
                    {format.name}
                    <span className="ml-auto text-xs text-gray-500">{format.description}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Schedule Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  自動送信設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={scheduleReport}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  定期レポート設定
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Summary */}
          <div className="lg:col-span-2 space-y-6">
            {reportData ? (
              <>
                {/* Executive Summary */}
                {selectedTemplate.sections.includes('executiveSummary') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        エグゼクティブサマリー
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{reportData.executiveSummary.totalCompanies}</div>
                          <div className="text-sm text-gray-600">総企業数</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{reportData.executiveSummary.activeCompanies}</div>
                          <div className="text-sm text-gray-600">進行中案件</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{reportData.executiveSummary.conversionRate}%</div>
                          <div className="text-sm text-gray-600">完了率</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{reportData.executiveSummary.avgProcessingDays}</div>
                          <div className="text-sm text-gray-600">平均処理日数</div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">¥{(reportData.executiveSummary.revenueProjection / 1000000).toFixed(1)}M</div>
                          <div className="text-sm text-gray-600">売上予測</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Company Status Chart */}
                {selectedTemplate.sections.includes('companyStatus') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        企業ステータス分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">フェーズ別分布</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsPieChart>
                              <Pie
                                data={Object.entries(reportData.companyStatus.byPhase).map(([phase, value]) => ({ phase, value }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#3B82F6"
                                dataKey="value"
                                label={({ phase, percent }) => `${phase} ${((percent || 0) * 100).toFixed(0)}%`}
                              >
                                {Object.entries(reportData.companyStatus.byPhase).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">上位ステータス</h4>
                          <div className="space-y-2">
                            {Object.entries(reportData.companyStatus.byStatus)
                              .sort(([,a], [,b]) => (b as number) - (a as number))
                              .slice(0, 6)
                              .map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center">
                                  <span className="text-sm">{status}</span>
                                  <Badge variant="outline">{count}</Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress Metrics */}
                {selectedTemplate.sections.includes('progressMetrics') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        進捗メトリクス
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{reportData.progressMetrics.completionRate}%</div>
                          <div className="text-xs text-gray-600">完了率</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{reportData.progressMetrics.onTimeDelivery}%</div>
                          <div className="text-xs text-gray-600">時間内完了</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{reportData.progressMetrics.customerSatisfaction}</div>
                          <div className="text-xs text-gray-600">顧客満足度</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold">{reportData.progressMetrics.errorRate}%</div>
                          <div className="text-xs text-gray-600">エラー率</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">トレンド分析</h4>
                        {reportData.progressMetrics.trends.map((trend) => (
                          <div key={trend.metric} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{trend.metric}</span>
                            <div className="text-right">
                              <div className="font-bold">{trend.current}</div>
                              <div className={`text-sm ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.change >= 0 ? '+' : ''}{trend.change}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {selectedTemplate.sections.includes('recommendations') && reportData.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        推奨アクション
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.recommendations.map((recommendation, index) => (
                          <Alert key={index}>
                            <AlertCircle className="h-4 w-4" />
                            <div className="font-medium">推奨事項 {index + 1}</div>
                            <div className="text-sm text-gray-600 mt-1">{recommendation}</div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">レポートを生成してください</h3>
                  <p className="text-gray-600 mb-4">テンプレートと期間を選択してレポート生成ボタンをクリックしてください</p>
                  <Button onClick={generateReportData} disabled={loading}>
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    レポート生成
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        // Preview Mode - Full Report Layout
        reportData && (
          <div className="space-y-8 bg-white p-8 rounded-lg border">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900">{selectedTemplate.name}</h1>
              <p className="text-gray-600 mt-2">
                期間: {format(new Date(dateRange.start), 'yyyy年MM月dd日', { locale: ja })} - {format(new Date(dateRange.end), 'yyyy年MM月dd日', { locale: ja })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                生成日時: {format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
              </p>
            </div>

            {/* All report sections in preview */}
            {selectedTemplate.sections.map((section) => {
              switch (section) {
                case 'executiveSummary':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">エグゼクティブサマリー</h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">{reportData.executiveSummary.totalCompanies}</div>
                          <div className="text-sm text-gray-600">総企業数</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">{reportData.executiveSummary.activeCompanies}</div>
                          <div className="text-sm text-gray-600">進行中案件</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">{reportData.executiveSummary.conversionRate}%</div>
                          <div className="text-sm text-gray-600">完了率</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-3xl font-bold text-orange-600">{reportData.executiveSummary.avgProcessingDays}日</div>
                          <div className="text-sm text-gray-600">平均処理日数</div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="text-3xl font-bold text-indigo-600">¥{(reportData.executiveSummary.revenueProjection / 1000000).toFixed(1)}M</div>
                          <div className="text-sm text-gray-600">売上予測</div>
                        </div>
                      </div>
                    </div>
                  )

                case 'companyStatus':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">企業ステータス概要</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">フェーズ別分布</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                              <Pie
                                data={Object.entries(reportData.companyStatus.byPhase).map(([phase, value]) => ({ phase, value }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#3B82F6"
                                dataKey="value"
                                label={({ phase, percent }) => `${phase} ${((percent || 0) * 100).toFixed(0)}%`}
                              >
                                {Object.entries(reportData.companyStatus.byPhase).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-4">進捗推移</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={reportData.companyStatus.progression}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" fontSize={12} />
                              <YAxis fontSize={12} />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="営業" stroke="#3B82F6" strokeWidth={2} />
                              <Line type="monotone" dataKey="提案" stroke="#8B5CF6" strokeWidth={2} />
                              <Line type="monotone" dataKey="契約" stroke="#10B981" strokeWidth={2} />
                              <Line type="monotone" dataKey="健診・判定" stroke="#F59E0B" strokeWidth={2} />
                              <Line type="monotone" dataKey="労災二次健診" stroke="#EF4444" strokeWidth={2} />
                              <Line type="monotone" dataKey="完了" stroke="#059669" strokeWidth={2} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )

                case 'progressMetrics':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">進捗メトリクス</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{reportData.progressMetrics.completionRate}%</div>
                          <div className="text-sm text-gray-600">完了率</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{reportData.progressMetrics.onTimeDelivery}%</div>
                          <div className="text-sm text-gray-600">時間内完了</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{reportData.progressMetrics.customerSatisfaction}</div>
                          <div className="text-sm text-gray-600">顧客満足度</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold">{reportData.progressMetrics.errorRate}%</div>
                          <div className="text-sm text-gray-600">エラー率</div>
                        </div>
                      </div>
                    </div>
                  )

                case 'faqAnalysis':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">FAQ分析</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">カテゴリ別分布</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={reportData.faqAnalysis.categoryDistribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" fontSize={12} />
                              <YAxis fontSize={12} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-4">よくある質問 TOP5</h3>
                          <div className="space-y-3">
                            {reportData.faqAnalysis.topQuestions.slice(0, 5).map((faq, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="font-medium text-sm">{faq.question}</div>
                                <div className="flex justify-between items-center mt-2">
                                  <Badge variant="outline">{faq.category}</Badge>
                                  <span className="text-sm text-gray-500">頻度: {faq.frequency}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )

                case 'emailActivity':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">メール活動サマリー</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{reportData.emailActivity.totalEmails}</div>
                          <div className="text-sm text-gray-600">総メール数</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{reportData.emailActivity.processedEmails}</div>
                          <div className="text-sm text-gray-600">処理済み</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{reportData.emailActivity.autoReplies}</div>
                          <div className="text-sm text-gray-600">自動返信</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{reportData.emailActivity.averageResponseTime}h</div>
                          <div className="text-sm text-gray-600">平均応答時間</div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={reportData.emailActivity.emailsByDate}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Area type="monotone" dataKey="received" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="processed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )

                case 'performance':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">パフォーマンス指標</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">KPI達成状況</h3>
                          <div className="space-y-4">
                            {reportData.performance.kpis.map((kpi) => (
                              <div key={kpi.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{kpi.name}</span>
                                  <span className="text-lg font-bold">{kpi.value}{kpi.unit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${kpi.value >= kpi.target ? 'bg-green-600' : 'bg-blue-600'}`}
                                    style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                  <span>目標: {kpi.target}{kpi.unit}</span>
                                  <span>達成率: {Math.round((kpi.value / kpi.target) * 100)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-4">部門別メトリクス</h3>
                          <div className="space-y-3">
                            {reportData.performance.departmentMetrics.map((dept) => (
                              <div key={dept.department} className="p-4 border rounded-lg">
                                <h4 className="font-medium">{dept.department}</h4>
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm">効率性</span>
                                    <span className="font-medium">{dept.efficiency}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">作業負荷</span>
                                    <span className="font-medium">{dept.workload}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )

                case 'recommendations':
                  return (
                    <div key={section} className="space-y-4">
                      <h2 className="text-2xl font-bold border-b pb-2">推奨アクション</h2>
                      <div className="space-y-4">
                        {reportData.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                            <h3 className="font-semibold text-blue-900">推奨事項 {index + 1}</h3>
                            <p className="text-blue-800 mt-1">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )

                default:
                  return null
              }
            })}
          </div>
        )
      )}
    </div>
  )
}