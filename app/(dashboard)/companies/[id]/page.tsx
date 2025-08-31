'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchCompanyData(params.id as string)
    }
  }, [params.id])

  const fetchCompanyData = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Supabaseから企業データを取得
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching company:', error)
        setError('企業データの取得に失敗しました')
        return
      }

      setCompany(data)
    } catch (err) {
      console.error('Error:', err)
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
    <div className="p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name || '企業名未設定'}</h1>
            {company.code && (
              <p className="text-sm text-gray-500">企業コード: {company.code}</p>
            )}
          </div>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          編集
        </button>
      </div>

      {/* メイン情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ステータス情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス情報</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">フェーズ</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(company.phase || '')}`}>
                {company.phase || '未設定'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">現在のステータス</p>
              <p className="text-lg font-medium">{company.current_status || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">最終更新</p>
              <p className="text-sm">{formatDateTime(company.status_changed_at)}</p>
            </div>
          </div>
        </div>

        {/* 連絡先情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">担当者</p>
              <p className="font-medium">{company.contact_person || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">メールアドレス</p>
              <p className="font-medium text-blue-600">{company.contact_email || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">電話番号</p>
              <p className="font-medium">{company.contact_phone || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* サポート情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">サポート情報</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">サポートレベル</p>
              <p className="font-medium">{getSupportLevelLabel(company.support_level || '')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">説明方法</p>
              <p className="font-medium">{getExplanationMethodLabel(company.explanation_method || '')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">登録日</p>
              <p className="font-medium">{formatDate(company.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 追加情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 企業情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">住所</p>
              <p className="font-medium">{company.address || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ウェブサイト</p>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                  {company.website}
                </a>
              ) : (
                <p className="font-medium">未設定</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">業種</p>
              <p className="font-medium">{company.industry || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* 健診情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">健診情報</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">対象者数</p>
              <p className="font-medium">{company.target_count || 0} 名</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">受診済み数</p>
              <p className="font-medium">{company.completed_count || 0} 名</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">進捗率</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    style={{ width: `${company.target_count ? (company.completed_count || 0) / company.target_count * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {company.target_count ? Math.round((company.completed_count || 0) / company.target_count * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メモセクション */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">メモ</h2>
        <div className="whitespace-pre-wrap text-gray-700">
          {company.notes || '（メモはありません）'}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          ステータス変更
        </button>
        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          メール送信
        </button>
        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          レポート生成
        </button>
      </div>
    </div>
  )
}