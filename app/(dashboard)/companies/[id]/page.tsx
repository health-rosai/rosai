'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Company, StatusHistory, STATUS_DEFINITIONS, Alert, StatusCode } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  History,
  FileText,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchCompanyData(params.id as string)
    }
  }, [params.id])

  const fetchCompanyData = async (id: string) => {
    try {
      // 企業情報取得
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) {
        console.error('Error fetching company:', companyError)
        return
      }

      setCompany(companyData)

      // ステータス履歴取得
      const { data: historyData } = await supabase
        .from('status_histories')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

      setStatusHistory(historyData || [])

      // アラート取得
      const { data: alertData } = await supabase
        .from('alerts')
        .select('*')
        .eq('company_id', id)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })

      setAlerts(alertData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">企業が見つかりません</p>
        <Link href="/companies">
          <Button className="mt-4">企業一覧に戻る</Button>
        </Link>
      </div>
    )
  }

  const currentStatusDef = STATUS_DEFINITIONS[company.current_status]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/companies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            {company.code && (
              <p className="text-sm text-gray-500">企業コード: {company.code}</p>
            )}
          </div>
        </div>
        <Link href={`/companies/${company.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </Link>
      </div>

      {/* アラート表示 */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              未解決のアラート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${getSeverityColor(alert.severity || 'medium')}`}>
                  <div className="font-medium">{alert.title}</div>
                  {alert.description && (
                    <div className="text-sm mt-1">{alert.description}</div>
                  )}
                  <div className="text-xs mt-2">
                    {format(new Date(alert.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* メイン情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ステータス情報 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>現在のステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge className={`${getStatusColor(company.current_status)} text-lg px-3 py-1`}>
                  {currentStatusDef?.name || company.current_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">フェーズ</p>
                <p className="text-lg font-medium">{company.phase}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">説明</p>
                <p className="text-sm">{currentStatusDef?.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">最終更新</p>
                <p className="text-sm">
                  {format(new Date(company.status_changed_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本情報 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">担当者</p>
                    <p className="font-medium">{company.contact_person || '未設定'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">メールアドレス</p>
                    <p className="font-medium">{company.contact_email || '未設定'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">電話番号</p>
                    <p className="font-medium">{company.contact_phone || '未設定'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">サポートレベル</p>
                  <p className="font-medium">
                    {company.support_level === 'full' ? 'フルサポート' :
                     company.support_level === 'partial' ? '部分サポート' :
                     company.support_level === 'referral_only' ? '紹介のみ' : '未設定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">説明方法</p>
                  <p className="font-medium">
                    {company.explanation_method === 'online' ? 'オンライン' :
                     company.explanation_method === 'visit' ? '訪問' :
                     company.explanation_method === 'document' ? '資料送付' : '未設定'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">登録日</p>
                  <p className="font-medium">
                    {format(new Date(company.created_at), 'yyyy/MM/dd', { locale: ja })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">ステータス履歴</TabsTrigger>
          <TabsTrigger value="notes">メモ</TabsTrigger>
          <TabsTrigger value="emails">メール</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>ステータス変更履歴</CardTitle>
              <CardDescription>直近10件の変更履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.length > 0 ? (
                  statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <History className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {history.from_status && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {STATUS_DEFINITIONS[history.from_status]?.name || history.from_status}
                              </Badge>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            </>
                          )}
                          <Badge className={`${getStatusColor(history.to_status)} text-xs`}>
                            {STATUS_DEFINITIONS[history.to_status]?.name || history.to_status}
                          </Badge>
                        </div>
                        {history.change_reason && (
                          <p className="text-sm text-gray-600 mt-1">{history.change_reason}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(history.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">履歴がありません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {company.notes || '（メモはありません）'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>メール履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                メール機能は準備中です
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}