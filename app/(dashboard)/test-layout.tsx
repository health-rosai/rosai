'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">メニュー</h2>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded bg-purple-600 text-white"
            >
              📊 ダッシュボード
            </Link>
            <Link
              href="/companies"
              className="block px-4 py-2 rounded hover:bg-gray-100"
            >
              🏢 企業管理
            </Link>
            <Link
              href="/kanban"
              className="block px-4 py-2 rounded hover:bg-gray-100"
            >
              📋 ステータス管理
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}