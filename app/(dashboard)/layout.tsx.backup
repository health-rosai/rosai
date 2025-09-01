'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface MenuItem {
  name: string
  href: string
  emoji: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: 'メインメニュー',
    items: [
      { name: 'ダッシュボード', href: '/dashboard', emoji: '📊' },
      { name: '企業管理', href: '/companies', emoji: '🏢' },
      { name: 'ステータス管理', href: '/kanban', emoji: '📋' },
      { name: 'ガントチャート', href: '/gantt', emoji: '📅' },
      { name: 'レポート', href: '/reports', emoji: '📈' },
      { name: 'メール管理', href: '/admin/email-import', emoji: '✉️' },
    ],
  },
  {
    title: 'AI機能',
    items: [
      { name: 'AIアシスタント', href: '/ai-assistant', emoji: '🤖' },
      { name: 'AI分析', href: '/ai-analysis', emoji: '🔍' },
    ],
  },
  {
    title: 'システム',
    items: [
      { name: '設定', href: '/settings', emoji: '⚙️' },
      { name: 'ヘルプ', href: '/help', emoji: '📚' },
    ],
  },
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
        <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-4">
            {menuSections && menuSections.length > 0 ? (
              menuSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    {!collapsed && (
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                        {section.title}
                      </h3>
                    )}
                    <nav className="space-y-1">
                      {section.items && section.items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                              ${isActive 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }
                              ${collapsed ? 'justify-center' : ''}
                            `}
                            title={collapsed ? item.name : ''}
                          >
                            <span className="flex-shrink-0 text-lg">
                              {item.emoji}
                            </span>
                            {!collapsed && (
                              <span className="text-sm font-medium">{item.name}</span>
                            )}
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
              ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              メニューが読み込まれていません
            </div>
          )}
          </div>

          {/* AI Assistant Card */}
          {!collapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" className="text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">AIアシスタント</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  業務効率化のためのAI支援
                </p>
                <button className="w-full px-3 py-2 text-xs font-medium text-purple-700 bg-white/80 backdrop-blur border border-purple-300 rounded-lg hover:bg-white transition-colors">
                  詳細を見る
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}