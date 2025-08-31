'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Company, StatusCode } from '@/types/database'
import { dummyCompanies } from '@/scripts/seed-dummy-data'
import StatusKanban from '@/components/features/status-kanban'
import { MotionWrapper, LoadingSpinner } from '@/components/ui/motion'
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { Plus, Filter, BarChart3, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function KanbanPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCompanies()
    
    // リアルタイム更新の設定
    const channel = supabase
      .channel('companies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        () => {
          fetchCompanies()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
        console.error('Error fetching companies:', error.message || error)
        toast.error('企業データの取得に失敗しました')
        setCompanies([])
        return
      }

      setCompanies(data || [])
      if (!data || data.length === 0) {
        console.log('No companies found in database')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('予期しないエラーが発生しました')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (companyId: string, newStatus: StatusCode) => {
    try {
      // 楽観的更新
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, current_status: newStatus, status_changed_at: new Date().toISOString() }
          : company
      ))

      // データベース更新
      const { error } = await supabase
        .from('companies')
        .update({
          current_status: newStatus,
          status_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (error) throw error

      // ステータス履歴を記録
      const company = companies.find(c => c.id === companyId)
      if (company) {
        await supabase
          .from('status_histories')
          .insert({
            company_id: companyId,
            from_status: company.current_status,
            to_status: newStatus,
            change_reason: 'カンバンビューからの更新'
          })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('ステータスの更新に失敗しました')
      // エラー時は元に戻す
      fetchCompanies()
    }
  }

  const handleCompanyClick = (company: Company) => {
    router.push(`/companies/${company.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
        <MotionWrapper variant="fade" className="h-full flex items-center justify-center">
          <PremiumCard variant="glass" className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size={48} className="text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg text-foreground">データを読み込み中</h3>
                <p className="text-sm text-foreground-secondary mt-1">かんばんボードを準備しています...</p>
              </div>
            </div>
          </PremiumCard>
        </MotionWrapper>
      </div>
    )
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
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                        ステータスカンバン
                      </h1>
                      <p className="text-foreground-secondary mt-1">
                        ドラッグ&ドロップで簡単にステータスを変更
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>総企業数: <strong className="text-foreground">{companies.length}</strong></span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="text-sm text-foreground-secondary">
                      リアルタイム同期中
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <PremiumButton 
                    variant="ghost" 
                    leftIcon={<Filter className="h-4 w-4" />}
                    className="glass-card"
                  >
                    フィルター
                  </PremiumButton>
                  <PremiumButton 
                    variant="primary" 
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => router.push('/companies/new')}
                    className="shadow-lg hover:shadow-xl"
                  >
                    新規企業
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </div>
        </MotionWrapper>

        {/* Kanban Board */}
        <MotionWrapper variant="slideUp" delay={0.2}>
          <StatusKanban
            companies={companies}
            onStatusChange={handleStatusChange}
            onCompanyClick={handleCompanyClick}
          />
        </MotionWrapper>
      </MotionWrapper>
    </div>
  )
}