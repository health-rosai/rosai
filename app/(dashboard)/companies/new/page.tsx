'use client'

import Link from 'next/link'
import CompanyForm from '@/components/features/company-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新規企業登録</h1>
      </div>

      <CompanyForm mode="create" />
    </div>
  )
}