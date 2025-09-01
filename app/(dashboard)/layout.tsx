'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const menuItems = [
  { name: 'ダッシュボード', href: '/dashboard', emoji: '📊' },
  { name: '企業管理', href: '/companies', emoji: '🏢' },
  { name: 'ステータス管理', href: '/kanban', emoji: '📋' },
  { name: 'ガントチャート', href: '/gantt', emoji: '📅' },
  { name: 'レポート', href: '/reports', emoji: '📈' },
  { name: 'メール管理', href: '/admin/email-import', emoji: '✉️' },
  { name: 'AIアシスタント', href: '/ai-assistant', emoji: '🤖' },
  { name: 'AI分析', href: '/ai-analysis', emoji: '🔍' },
  { name: '設定', href: '/settings', emoji: '⚙️' },
  { name: 'ヘルプ', href: '/help', emoji: '📚' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">労災二次健診システム</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors relative">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
            <span className="text-sm font-medium text-gray-700">管理者</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}>
          <div className="p-4">
            <h2 className={`text-sm font-bold text-gray-600 mb-4 ${collapsed ? 'hidden' : 'block'}`}>
              メニュー
            </h2>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.name : ''}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}