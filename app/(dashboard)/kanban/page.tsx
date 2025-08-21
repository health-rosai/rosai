'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Company, StatusCode } from '@/types/database'
import StatusKanban from '@/components/features/status-kanban'
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
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching companies:', error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error('Error:', error)
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ステータスカンバン</h1>
        <p className="text-gray-600">ドラッグ&ドロップでステータスを変更できます</p>
      </div>

      <StatusKanban
        companies={companies}
        onStatusChange={handleStatusChange}
        onCompanyClick={handleCompanyClick}
      />
    </div>
  )
}