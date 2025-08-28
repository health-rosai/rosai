'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  Mail,
  FileText,
  LogOut,
  Menu,
  X,
  BarChart3,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: '企業管理', href: '/companies', icon: Building2 },
  { name: 'ステータス進捗管理', href: '/kanban', icon: Layers },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
  { name: 'メール管理', href: '/admin/email-import', icon: Mail },
  { name: 'FAQ管理', href: '/faqs', icon: HelpCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClient()

  const handleLogout = async () => {
    // 開発環境用のログアウト処理
    if (process.env.NODE_ENV === 'development') {
      await fetch('/api/dev-login', { method: 'DELETE' })
      toast.success('ログアウトしました')
      router.push('/login')
      return
    }

    // 本番環境用のSupabaseログアウト
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('ログアウトに失敗しました')
    } else {
      toast.success('ログアウトしました')
      router.push('/login')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-gray-100">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b bg-white border-gray-200">
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">労災二次健診システム</h1>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-5 w-5
                        ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t p-4 bg-white border-gray-200">
            <div className="flex items-center w-full">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-gray-500">{profile?.role || 'スタッフ'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[100] bg-black bg-opacity-50 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-[101] flex w-64 flex-col shadow-xl lg:hidden bg-gray-100">
            {/* Close button */}
            <div className="absolute right-0 top-0 -mr-14 p-1">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b px-4 bg-white border-gray-200">
              <h1 className="text-lg font-bold text-gray-900">労災二次健診システム</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${isActive ? 'text-blue-700' : 'text-gray-400'}
                        `}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
            
            {/* User info & logout */}
            <div className="border-t p-4 bg-white border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user?.email || 'テストユーザー'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.role || 'スタッフ'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-[99] lg:hidden flex items-center h-16 px-4 bg-white border-b border-gray-200">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">労災二次健診システム</h1>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}