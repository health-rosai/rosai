'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Company, STATUS_DEFINITIONS, StatusCode } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CompanyFormProps {
  company?: Company
  mode: 'create' | 'edit'
}

export default function CompanyForm({ company, mode }: CompanyFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: company?.name || '',
    code: company?.code || '',
    current_status: company?.current_status || '01',
    contact_person: company?.contact_person || '',
    contact_email: company?.contact_email || '',
    contact_phone: company?.contact_phone || '',
    support_level: company?.support_level || 'referral_only',
    explanation_method: company?.explanation_method || 'online',
    needs_explanation: company?.needs_explanation || false,
    notes: company?.notes || '',
    agency_id: company?.agency_id || null,
    assigned_staff_id: company?.assigned_staff_id || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'create') {
        // フォームデータから必要なフィールドのみを抽出
        const insertData = {
          name: formData.name,
          code: formData.code || null,
          current_status: formData.current_status,
          contact_person: formData.contact_person || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          support_level: formData.support_level,
          explanation_method: formData.explanation_method,
          needs_explanation: formData.needs_explanation,
          notes: formData.notes || null,
          agency_id: formData.agency_id,
          assigned_staff_id: formData.assigned_staff_id,
        }

        const { data, error } = await supabase
          .from('companies')
          .insert([insertData])
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            full: JSON.stringify(error, null, 2)
          })
          throw error
        }

        toast.success('企業を登録しました')
        router.push(`/companies/${data.id}`)
      } else if (mode === 'edit' && company) {
        const { error } = await supabase
          .from('companies')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', company.id)

        if (error) throw error

        // ステータスが変更された場合は履歴を記録
        if (formData.current_status !== company.current_status) {
          await supabase
            .from('status_histories')
            .insert({
              company_id: company.id,
              from_status: company.current_status,
              to_status: formData.current_status,
              change_reason: '手動更新'
            })
        }

        toast.success('企業情報を更新しました')
        router.push(`/companies/${company.id}`)
      }
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error?.message || 'エラーが発生しました'
      toast.error(`エラー: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>企業の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">企業名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="株式会社サンプル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">企業コード</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="COMP001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              value={formData.current_status}
              onChange={(e) => setFormData({ ...formData, current_status: e.target.value as StatusCode })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(STATUS_DEFINITIONS).map(([code, def]) => (
                <option key={code} value={code}>
                  {def.name} - {def.description}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>連絡先情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">担当者名</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="山田太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">メールアドレス</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="yamada@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">電話番号</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="03-1234-5678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>サポート設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="support_level">サポートレベル</Label>
              <select
                id="support_level"
                value={formData.support_level}
                onChange={(e) => setFormData({ ...formData, support_level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="referral_only">紹介のみ</option>
                <option value="partial">部分サポート</option>
                <option value="full">フルサポート</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="explanation_method">説明方法</Label>
              <select
                id="explanation_method"
                value={formData.explanation_method}
                onChange={(e) => setFormData({ ...formData, explanation_method: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online">オンライン</option>
                <option value="visit">訪問</option>
                <option value="document">資料送付</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="needs_explanation"
              checked={formData.needs_explanation}
              onChange={(e) => setFormData({ ...formData, needs_explanation: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="needs_explanation">説明が必要</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メモ</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="企業に関するメモを入力..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? '登録' : '更新'}
        </Button>
      </div>
    </form>
  )
}