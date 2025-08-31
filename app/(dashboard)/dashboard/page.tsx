'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    completedCompanies: 0,
    averageProcessingDays: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 企業データを取得（最新5件）
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (companiesError) {
        console.error('Error fetching companies:', companiesError.message || companiesError)
        console.error('Error details:', JSON.stringify(companiesError, null, 2))
      } else {
        setCompanies(companiesData || [])
      }

      // 統計データを取得
      const { count: totalCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      const { count: activeCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .in('phase', ['営業', '提案', '契約', '健診・判定', '労災二次健診'])

      const { count: completedCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('phase', '完了')

      setStats({
        totalCompanies: totalCount || 0,
        activeCompanies: activeCount || 0,
        completedCompanies: completedCount || 0,
        averageProcessingDays: 3.2 // ダミー値
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (phase: string) => {
    switch (phase) {
      case '営業':
      case '提案':
        return 'bg-green-100 text-green-800'
      case '契約':
      case '健診・判定':
      case '労災二次健診':
        return 'bg-yellow-100 text-yellow-800'
      case '請求':
        return 'bg-blue-100 text-blue-800'
      case '完了':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '未設定'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">システムの概要と最新の統計情報</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <span className="text-2xl">🏢</span>
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">登録企業数</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <span className="text-2xl">📈</span>
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">進行中の案件</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeCompanies}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <span className="text-2xl">✅</span>
            </div>
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">完了案件</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completedCompanies}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <span className="text-2xl">⏱️</span>
            </div>
            <span className="text-sm text-red-600 font-medium">-18%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">平均処理時間</p>
          <p className="text-3xl font-bold text-gray-900">{stats.averageProcessingDays}日</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Link href="/companies/new">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            ➕ 新規企業登録
          </button>
        </Link>
        <Link href="/reports">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            📊 レポート生成
          </button>
        </Link>
        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          📄 データエクスポート
        </button>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近の活動</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  企業名
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  更新日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/companies/${company.id}`} className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors">
                        {company.name || '企業名未設定'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(company.phase || '')}`}>
                        {company.phase || '未設定'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {company.contact_person || '未設定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(company.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/companies/${company.id}`}>
                        <button className="text-purple-600 hover:text-purple-900 font-medium text-sm">
                          詳細
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}