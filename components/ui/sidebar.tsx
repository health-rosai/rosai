'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Mail,
  FileText,
  BarChart3,
  Layers,
  HelpCircle,
  Bot,
  Brain,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const menuSections = [
  {
    title: 'メインメニュー',
    items: [
      { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard, emoji: '📊' },
      { name: '企業管理', href: '/companies', icon: Building2, emoji: '🏢' },
      { name: 'ステータス進捗管理', href: '/kanban', icon: Layers, emoji: '📋' },
      { name: 'レポート', href: '/reports', icon: BarChart3, emoji: '📈' },
      { name: 'メール管理', href: '/admin/email-import', icon: Mail, emoji: '✉️' },
      { name: 'FAQ管理', href: '/faqs', icon: HelpCircle, emoji: '❓' },
    ],
  },
  {
    title: 'AI機能',
    items: [
      { name: 'AIアシスタント', href: '/ai-assistant', icon: Bot, emoji: '🤖' },
      { name: '業務効率化AI', href: '/ai-analysis', icon: Brain, emoji: '🔍' },
    ],
  },
  {
    title: 'システム',
    items: [
      { name: '設定', href: '/settings', icon: Settings, emoji: '⚙️' },
      { name: 'ヘルプ', href: '/help', icon: BookOpen, emoji: '📚' },
    ],
  },
]

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full w-full bg-white/95 backdrop-blur-xl border-r border-gray-200/30">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/30 bg-gradient-to-r from-white/80 to-gray-50/80">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                労災二次健診システム
              </h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-all"
          title={collapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-8">
            {!collapsed && (
              <h3 className="px-6 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="px-3 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const isHovered = hoveredItem === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/25 hover:translate-x-1'
                    } ${collapsed ? 'justify-center' : ''}`}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={collapsed ? item.name : ''}
                  >
                    <span className="text-xl mr-3">{item.emoji}</span>
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && isHovered && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* AI Assistant Card (only when not collapsed) */}
      {!collapsed && (
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold text-sm text-gray-700">AIアシスタント</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              業務効率化のためのAI支援機能を活用しましょう
            </p>
            <button className="w-full px-3 py-2 text-xs font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors">
              詳細を見る
            </button>
          </div>
        </div>
      )}
    </div>
  )
}