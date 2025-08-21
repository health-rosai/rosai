'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_DEFINITIONS, type Company, type Alert } from '@/types/database'
import { 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  FileText,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  completedThisMonth: number
  pendingAlerts: number
  byPhase: Record<string, number>
  recentActivities: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false })

      // Fetch unresolved alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent activities
      const { data: activitiesData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (companiesData) {
        setCompanies(companiesData)
        
        // Calculate stats
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        
        const byPhase = companiesData.reduce((acc, company) => {
          acc[company.phase] = (acc[company.phase] || 0) + 1
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

        setStats({
          totalCompanies: companiesData.length,
          activeCompanies,
          completedThisMonth,
          pendingAlerts: alertsData?.length || 0,
          byPhase,
          recentActivities: activitiesData || []
        })
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
    },
    {
      title: '進行中案件',
      value: stats?.activeCompanies || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '今月完了',
      value: stats?.completedThisMonth || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '要対応アラート',
      value: stats?.pendingAlerts || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600">労災二次健診進捗管理システム</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              フェーズ別分布
            </CardTitle>
            <CardDescription>各フェーズの企業数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.byPhase || {}).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-sm font-medium">{phase}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}社</span>
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