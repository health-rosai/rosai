'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    completedCompanies: 0,
    averageProcessingDays: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 企業データを取得（最新5件）
      const response = await fetch('/api/companies?limit=5&sort_by=updated_at&sort_order=desc')
      const result = await response.json()

      if (response.ok && result.data) {
        setCompanies(result.data)
        
        // 統計データを簡易計算（本来はAPIで統計専用エンドポイントを作るべき）
        const totalCount = result.pagination?.total || result.data.length
        const activeCount = result.data.filter((c: any) => 
          ['営業', '提案', '契約', '健診・判定', '労災二次健診'].includes(c.phase)
        ).length
        const completedCount = result.data.filter((c: any) => c.phase === '完了').length
        
        setStats({
          totalCompanies: totalCount,
          activeCompanies: activeCount,
          completedCompanies: completedCount,
          averageProcessingDays: 3.2 // ダミー値
        })
      } else {
        console.error('Error fetching companies:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (phase: string) => {
    switch (phase) {
      case '営業':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case '提案':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case '契約':
        return 'bg-green-50 text-green-700 border-green-200'
      case '健診・判定':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case '労災二次健診':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case '請求':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      case '完了':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    const statusNum = status?.replace(/[A-Z]/g, '')
    if (statusNum <= '05') return '📋'
    if (statusNum <= '10') return '📝'
    if (statusNum <= '15') return '🏥'
    if (statusNum <= '20') return '💰'
    return '✅'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '未設定'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">労災二次健診管理システムの概要</p>
        </div>

        {/* 統計カード - 横並び */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">登録企業数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCompanies}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                  <span className="text-xs text-gray-400 ml-2">先月比</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">進行中</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeCompanies}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 font-medium">+8%</span>
                  <span className="text-xs text-gray-400 ml-2">先月比</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">完了案件</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedCompanies}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 font-medium">+15%</span>
                  <span className="text-xs text-gray-400 ml-2">先月比</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">平均処理</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.averageProcessingDays}<span className="text-lg text-gray-500 ml-1">日</span></p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-red-600 font-medium">-18%</span>
                  <span className="text-xs text-gray-400 ml-2">改善</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：最近の活動 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">最近の活動</h2>
                  <Link href="/companies" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    すべて見る →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <div key={company.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            {company.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <Link href={`/companies/${company.id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                              {company.name || '企業名未設定'}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">{company.contact_person || '担当者未設定'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{formatDate(company.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(company.phase || '')}`}>
                            <span className="mr-1">{getStatusIcon(company.current_status)}</span>
                            {company.phase || '未設定'}
                          </span>
                          <Link href={`/companies/${company.id}`}>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-500">データがありません</p>
                    <Link href="/companies/new">
                      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        新規企業を登録
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右側：クイックアクション & 通知 */}
          <div className="space-y-6">
            {/* クイックアクション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <Link href="/companies/new" className="block">
                  <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-between group">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">➕</span>
                      <span className="font-medium text-gray-700">新規企業登録</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <Link href="/reports" className="block">
                  <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center justify-between group">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">📊</span>
                      <span className="font-medium text-gray-700">レポート生成</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors flex items-center justify-between group">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📧</span>
                    <span className="font-medium text-gray-700">メール一括送信</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ステータス別サマリー */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス別</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">営業中</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">提案中</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">健診中</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">完了</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">2</span>
                </div>
              </div>
            </div>

            {/* 今日のタスク */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">今日のタスク</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3 rounded" />
                  <div>
                    <p className="text-sm font-medium">ABC製造の提案書作成</p>
                    <p className="text-xs opacity-75 mt-1">期限: 17:00</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3 rounded" />
                  <div>
                    <p className="text-sm font-medium">グローバル商事へフォローアップ</p>
                    <p className="text-xs opacity-75 mt-1">期限: 15:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}