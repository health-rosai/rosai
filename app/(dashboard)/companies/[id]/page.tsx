'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCompanyData(params.id as string)
    }
  }, [params.id])

  const fetchCompanyData = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching company with ID:', id)
      
      // APIエンドポイントから企業データを取得
      const response = await fetch(`/api/companies/${id}`)
      const result = await response.json()
      
      console.log('API response:', result)

      if (!response.ok) {
        setError(result.error || '企業データの取得に失敗しました')
        return
      }

      if (!result.data) {
        setError('企業データが見つかりません')
        return
      }

      setCompany(result.data)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (phase: string) => {
    switch (phase) {
      case '営業': return 'bg-blue-100 text-blue-800'
      case '提案': return 'bg-purple-100 text-purple-800'
      case '契約': return 'bg-green-100 text-green-800'
      case '健診・判定': return 'bg-yellow-100 text-yellow-800'
      case '労災二次健診': return 'bg-orange-100 text-orange-800'
      case '請求': return 'bg-pink-100 text-pink-800'
      case '完了': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSupportLevelLabel = (level: string) => {
    switch (level) {
      case 'full': return 'フルサポート'
      case 'partial': return '部分サポート'
      case 'referral_only': return '紹介のみ'
      default: return '未設定'
    }
  }

  const getExplanationMethodLabel = (method: string) => {
    switch (method) {
      case 'online': return 'オンライン'
      case 'visit': return '訪問'
      case 'document': return '資料送付'
      default: return '未設定'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleDateString('ja-JP')
    } catch {
      return '未設定'
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '未設定'
    try {
      return new Date(dateString).toLocaleString('ja-JP')
    } catch {
      return '未設定'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ダッシュボードに戻る
          </button>
        </Link>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">企業が見つかりません</p>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ダッシュボードに戻る
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-white rounded-xl transition-all duration-200 shadow-sm bg-white/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name || '企業名未設定'}</h1>
              <p className="text-sm text-gray-500">企業コード: {company.code || '未設定'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:shadow-md transition-all duration-200 border border-gray-200">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              履歴
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ - 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側メインエリア (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ステータスオーバービュー */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">ステータス概要</h2>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(company.phase || '')}`}>
                {company.phase || '未設定'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-2xl font-bold text-gray-900">{company.current_status || '未設定'}</p>
                <p className="text-xs text-gray-600 mt-1">現在のステータス</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-2xl font-bold text-gray-900">{company.target_count || 0}</p>
                <p className="text-xs text-gray-600 mt-1">対象者数</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-2xl font-bold text-gray-900">{company.completed_count || 0}</p>
                <p className="text-xs text-gray-600 mt-1">受診済み</p>
              </div>
            </div>
            
            {/* 進捗バー */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">健診進捗</span>
                <span className="text-sm font-medium text-gray-900">
                  {company.target_count ? Math.round((company.completed_count || 0) / company.target_count * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${company.target_count ? (company.completed_count || 0) / company.target_count * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 詳細情報タブ */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex gap-6 px-6">
                <button className="py-4 px-1 border-b-2 border-purple-600 text-purple-600 font-medium">
                  企業情報
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                  健診履歴
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                  ドキュメント
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">基本情報</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">住所</span>
                      <span className="text-sm font-medium text-gray-900">{company.address || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">業種</span>
                      <span className="text-sm font-medium text-gray-900">{company.industry || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ウェブサイト</span>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                          リンク
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">未設定</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">サポート設定</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">サポートレベル</span>
                      <span className="text-sm font-medium text-gray-900">{getSupportLevelLabel(company.support_level || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">説明方法</span>
                      <span className="text-sm font-medium text-gray-900">{getExplanationMethodLabel(company.explanation_method || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">最終更新</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(company.status_changed_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* メモセクション */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">メモ・備考</h2>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                編集
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {company.notes || 'メモはまだありません'}
              </p>
            </div>
          </div>
        </div>

        {/* 右側サイドバー (1/3) */}
        <div className="space-y-6">
          {/* 連絡先カード */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">担当者</p>
                  <p className="font-medium text-gray-900">{company.contact_person || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">メール</p>
                  <a href={`mailto:${company.contact_email}`} className="font-medium text-blue-600 hover:underline text-sm">
                    {company.contact_email || '未設定'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">電話</p>
                  <a href={`tel:${company.contact_phone}`} className="font-medium text-gray-900">
                    {company.contact_phone || '未設定'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-xl text-left hover:bg-white/30 transition-all duration-200">
                <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                ステータス変更
              </button>
              <button className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-xl text-left hover:bg-white/30 transition-all duration-200">
                <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                メール送信
              </button>
              <button className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-xl text-left hover:bg-white/30 transition-all duration-200">
                <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6" />
                </svg>
                レポート生成
              </button>
            </div>
          </div>

          {/* タイムライン */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">ステータス更新</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">メール送信</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">健診完了</p>
                  <p className="text-xs text-gray-500">3日前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}