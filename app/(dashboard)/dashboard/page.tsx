'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { dummyCompanies } from '@/scripts/seed-dummy-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_DEFINITIONS, type Company, type Alert, type StatusCode, type Phase } from '@/types/database'
import { 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  FileText,
  BarChart3,
  Activity,
  Target,
  Calendar,
  Zap
} from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  completedThisMonth: number
  pendingAlerts: number
  byPhase: Record<string, number>
  byStatus: Record<string, number>
  recentActivities: any[]
  completionRate: number
  avgProcessingDays: number
}

interface ChartData {
  statusProgression: Array<{ date: string; [key: string]: string | number }>
  companiesByStatus: Array<{ status: string; count: number; phase: string }>
  phaseDistribution: Array<{ phase: string; value: number; color: string }>
  performanceMetrics: Array<{ metric: string; value: number; target: number; change: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Demo data for charts (can be replaced with real data)
  const generateDemoData = (companiesData: Company[]) => {
    // Status progression over time (last 30 days)
    const statusProgression = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MM/dd')
      return {
        date,
        営業: Math.floor(Math.random() * 10) + 5,
        提案: Math.floor(Math.random() * 8) + 3,
        契約: Math.floor(Math.random() * 6) + 2,
        '健診・判定': Math.floor(Math.random() * 12) + 5,
        労災二次健診: Math.floor(Math.random() * 8) + 3,
        請求: Math.floor(Math.random() * 4) + 1,
        完了: Math.floor(Math.random() * 15) + 10
      }
    })

    // Companies by status
    const companiesByStatus = Object.entries(stats?.byStatus || {})
      .map(([status, count]) => ({
        status: STATUS_DEFINITIONS[status as StatusCode]?.name || status,
        count: count as number,
        phase: STATUS_DEFINITIONS[status as StatusCode]?.phase || '特殊'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Phase distribution with colors
    const phaseColors = {
      '営業': '#3B82F6',
      '提案': '#8B5CF6',
      '契約': '#10B981',
      '健診・判定': '#F59E0B',
      '労災二次健診': '#EF4444',
      '請求': '#6366F1',
      '完了': '#059669',
      '特殊': '#6B7280'
    }

    const phaseDistribution = Object.entries(stats?.byPhase || {})
      .map(([phase, value]) => ({
        phase,
        value: value as number,
        color: phaseColors[phase as Phase] || '#6B7280'
      }))

    // Performance metrics
    const performanceMetrics = [
      { metric: '完了率', value: stats?.completionRate || 0, target: 85, change: 2.3 },
      { metric: '平均処理日数', value: stats?.avgProcessingDays || 0, target: 45, change: -3.2 },
      { metric: '月間新規', value: 12, target: 15, change: -1.2 },
      { metric: 'アラート率', value: 8.5, target: 5, change: 1.8 }
    ]

    return {
      statusProgression,
      companiesByStatus,
      phaseDistribution,
      performanceMetrics
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 開発環境ではダミーデータを使用
      let companiesData = null
      if (process.env.NODE_ENV === 'development') {
        companiesData = dummyCompanies
      } else {
        // 本番環境ではSupabaseから取得
        const { data } = await supabase
          .from('companies')
          .select('*')
          .order('updated_at', { ascending: false })
        companiesData = data
      }

      // 開発環境ではモックデータを使用
      const alertsData = process.env.NODE_ENV === 'development' ? [
        {
          id: '1',
          title: '健診期限が近づいています',
          severity: 'high',
          created_at: new Date().toISOString(),
          is_resolved: false
        },
        {
          id: '2',
          title: '未提出の書類があります',
          severity: 'medium',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_resolved: false
        }
      ] : (await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5)).data

      // Fetch recent activities
      const activitiesData = process.env.NODE_ENV === 'development' ? [
        {
          id: '1',
          action: '新規企業を追加しました',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          action: 'ステータスを更新しました',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ] : (await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)).data

      if (companiesData) {
        setCompanies(companiesData)
        
        // Calculate stats
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        
        const byPhase = companiesData.reduce((acc, company) => {
          const phase = company.phase || '営業'
          acc[phase] = (acc[phase] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const byStatus = companiesData.reduce((acc, company) => {
          acc[company.current_status] = (acc[company.current_status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const completedThisMonth = companiesData.filter(company => {
          if (company.current_status !== '22') return false
          const updatedAt = new Date(company.status_changed_at)
          return updatedAt.getMonth() === thisMonth && updatedAt.getFullYear() === thisYear
        }).length

        const activeCompanies = companiesData.filter(
          company => !['22', '99A', '99D', '99E'].includes(company.current_status)
        ).length

        const completedCompanies = companiesData.filter(
          company => company.current_status === '22'
        ).length

        const completionRate = companiesData.length > 0 
          ? Math.round((completedCompanies / companiesData.length) * 100)
          : 0

        // Calculate average processing days for completed companies
        const avgProcessingDays = completedCompanies > 0
          ? Math.round(
              companiesData
                .filter(company => company.current_status === '22')
                .reduce((acc, company) => {
                  const created = new Date(company.created_at)
                  const completed = new Date(company.status_changed_at)
                  const days = Math.round((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
                  return acc + days
                }, 0) / completedCompanies
            )
          : 0

        const statsData = {
          totalCompanies: companiesData.length,
          activeCompanies,
          completedThisMonth,
          pendingAlerts: alertsData?.length || 0,
          byPhase,
          byStatus,
          recentActivities: activitiesData || [],
          completionRate,
          avgProcessingDays
        }

        setStats(statsData)

        // Generate chart data
        const chartsData = generateDemoData(companiesData)
        setChartData(chartsData)
      }

      if (alertsData) {
        setAlerts(alertsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: '総企業数',
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: '進行中案件',
      value: stats?.activeCompanies || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: '今月完了',
      value: stats?.completedThisMonth || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15.3%',
      trend: 'up'
    },
    {
      title: '要対応アラート',
      value: stats?.pendingAlerts || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-5.1%',
      trend: 'down'
    },
    {
      title: '完了率',
      value: `${stats?.completionRate || 0}%`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+2.3%',
      trend: 'up'
    },
    {
      title: '平均処理日数',
      value: `${stats?.avgProcessingDays || 0}日`,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-3.2日',
      trend: 'down'
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600">労災二次健診進捗管理システム</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">前月比</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Progression Line Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ステータス進捗推移（過去30日）
            </CardTitle>
            <CardDescription>フェーズ別の進捗状況の推移</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.statusProgression || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="営業" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="提案" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="契約" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="健診・判定" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="労災二次健診" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="請求" stroke="#6366F1" strokeWidth={2} />
                <Line type="monotone" dataKey="完了" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Companies by Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ステータス別企業数
            </CardTitle>
            <CardDescription>上位10ステータス</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.companiesByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phase Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              フェーズ別分布
            </CardTitle>
            <CardDescription>全体における各フェーズの割合</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.phaseDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ phase, percent }) => `${phase} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(chartData?.phaseDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics & Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              パフォーマンス指標
            </CardTitle>
            <CardDescription>目標値との比較</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(chartData?.performanceMetrics || []).map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">{metric.value}{metric.metric.includes('率') ? '%' : metric.metric.includes('日数') ? '日' : ''}</div>
                      <div className={`text-xs ${metric.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}{metric.metric.includes('率') ? '%' : metric.metric.includes('日数') ? '日' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.value >= metric.target ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>現在: {metric.value}{metric.metric.includes('率') ? '%' : metric.metric.includes('日数') ? '日' : ''}</span>
                    <span>目標: {metric.target}{metric.metric.includes('率') ? '%' : metric.metric.includes('日数') ? '日' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              最新アラート
            </CardTitle>
            <CardDescription>対応が必要な項目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`
                      p-1 rounded
                      ${alert.severity === 'critical' ? 'bg-red-100' : 
                        alert.severity === 'high' ? 'bg-orange-100' :
                        alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'}
                    `}>
                      <AlertCircle className={`
                        h-4 w-4
                        ${alert.severity === 'critical' ? 'text-red-600' : 
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'}
                      `} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(alert.created_at), 'MM月dd日 HH:mm', { locale: ja })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">アラートはありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最近のアクティビティ
            </CardTitle>
            <CardDescription>システムの最新活動</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.recentActivities || []).length > 0 ? (
                (stats?.recentActivities || []).slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="p-1 bg-blue-100 rounded">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.created_at), 'MM月dd日 HH:mm', { locale: ja })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">アクティビティはありません</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近更新された企業
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">企業名</th>
                  <th className="text-left py-2">ステータス</th>
                  <th className="text-left py-2">フェーズ</th>
                  <th className="text-left py-2">最終更新</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 5).map((company) => (
                  <tr key={company.id} className="border-b">
                    <td className="py-2 font-medium">{company.name}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {STATUS_DEFINITIONS[company.current_status]?.name || company.current_status}
                      </span>
                    </td>
                    <td className="py-2">{company.phase}</td>
                    <td className="py-2 text-gray-500">
                      {format(new Date(company.updated_at), 'MM/dd HH:mm', { locale: ja })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}