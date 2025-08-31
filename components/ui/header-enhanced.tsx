'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PremiumButton } from './premium-button'
import { Badge } from './badge'
import { MotionWrapper, HoverScale } from './motion'
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  Zap,
  Command,
  Home,
  Building2,
  Filter,
  Calendar,
  Globe,
  ChevronRight,
  X
} from 'lucide-react'

interface HeaderEnhancedProps {
  className?: string
}

interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: Date
  type: 'info' | 'warning' | 'error'
  isRead: boolean
}

export function HeaderEnhanced({ className }: HeaderEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const supabase = createClient()

  // Sample notifications
  useEffect(() => {
    const sampleNotifications: NotificationItem[] = [
      {
        id: '1',
        title: '期限アラート',
        message: '3社の健診期限が1週間以内に迫っています',
        timestamp: new Date(Date.now() - 1800000),
        type: 'warning',
        isRead: false
      },
      {
        id: '2',
        title: '新規登録',
        message: 'ABC株式会社が登録されました',
        timestamp: new Date(Date.now() - 3600000),
        type: 'info',
        isRead: false
      },
      {
        id: '3',
        title: 'システム更新',
        message: 'データベースが正常に更新されました',
        timestamp: new Date(Date.now() - 7200000),
        type: 'info',
        isRead: true
      }
    ]
    setNotifications(sampleNotifications)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ name: string; href: string; icon?: React.ReactNode }> = [
      { name: 'ホーム', href: '/dashboard', icon: <Home className="h-3 w-3" /> }
    ]
    
    let currentPath = ''
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      
      const breadcrumbMap: Record<string, { name: string; icon?: React.ReactNode }> = {
        '/dashboard': { name: 'ダッシュボード', icon: <Home className="h-3 w-3" /> },
        '/companies': { name: '企業管理', icon: <Building2 className="h-3 w-3" /> },
        '/kanban': { name: 'ステータス管理' },
        '/reports': { name: 'レポート' },
        '/admin': { name: '管理者' },
        '/faqs': { name: 'FAQ管理' }
      }
      
      const breadcrumb = breadcrumbMap[currentPath]
      if (breadcrumb && currentPath !== '/dashboard') {
        breadcrumbs.push({
          name: breadcrumb.name,
          href: currentPath,
          icon: breadcrumb.icon
        })
      }
    })
    
    return breadcrumbs
  }

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  const handleLogout = async () => {
    if (process.env.NODE_ENV === 'development') {
      await fetch('/api/dev-login', { method: 'DELETE' })
      window.location.href = '/login'
    } else {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }

  const searchResults = [
    { title: 'ABC株式会社', type: '企業', href: '/companies/1' },
    { title: 'XYZ健診センター', type: '企業', href: '/companies/2' },
    { title: '月次レポート', type: 'レポート', href: '/reports' },
    { title: 'ステータス管理', type: 'ページ', href: '/kanban' }
  ].filter(item => 
    searchQuery && item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MotionWrapper variant="slideUp">
      <header className={`sticky top-0 z-50 glass-nav backdrop-blur-xl ${className}`}>
        <div className="flex items-center h-16 px-6">
          {/* Left Section - Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <nav className="flex items-center gap-2 text-sm">
              {generateBreadcrumbs().map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <Link
                    href={crumb.href}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-muted/50 ${
                      index === generateBreadcrumbs().length - 1
                        ? 'text-foreground font-medium'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {crumb.icon && crumb.icon}
                    <span>{crumb.name}</span>
                  </Link>
                  {index < generateBreadcrumbs().length - 1 && (
                    <ChevronRight className="h-3 w-3 text-foreground-tertiary" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Center Section - Global Search */}
          <div className="flex-1 max-w-xl mx-8" ref={searchRef}>
            <div className="relative">
              <div className={`relative flex items-center transition-all duration-300 ${
                showSearch ? 'bg-card shadow-lg border-primary/20' : 'bg-muted/30'
              } rounded-xl border border-border/30`}>
                <Search className="h-4 w-4 text-foreground-secondary ml-4" />
                <input
                  type="text"
                  placeholder="企業名、ステータス、機能を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-3 text-foreground-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div className="flex items-center gap-1 pr-3 text-xs text-foreground-tertiary">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showSearch && (
                <MotionWrapper variant="fade">
                  <div className="absolute top-full mt-2 w-full bg-card border border-border/30 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    {searchQuery ? (
                      <>
                        {searchResults.length > 0 ? (
                          <div className="p-2 max-h-80 overflow-y-auto">
                            <div className="text-xs font-medium text-foreground-secondary mb-2 px-3 py-1">
                              検索結果 ({searchResults.length})
                            </div>
                            {searchResults.map((result, index) => (
                              <Link
                                key={index}
                                href={result.href}
                                onClick={() => {
                                  setShowSearch(false)
                                  setSearchQuery('')
                                }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">{result.title}</div>
                                  <div className="text-xs text-foreground-secondary">{result.type}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-foreground-secondary">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">検索結果が見つかりませんでした</div>
                            <div className="text-xs mt-1">別のキーワードをお試しください</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4">
                        <div className="text-xs font-medium text-foreground-secondary mb-3">クイックアクセス</div>
                        <div className="space-y-1">
                          {[
                            { name: '新規企業登録', icon: <Building2 className="h-4 w-4" />, href: '/companies/new' },
                            { name: 'ステータス管理', icon: <Filter className="h-4 w-4" />, href: '/kanban' },
                            { name: 'レポート生成', icon: <Calendar className="h-4 w-4" />, href: '/reports' }
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setShowSearch(false)}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="p-1 rounded text-foreground-secondary">
                                {item.icon}
                              </div>
                              <span className="text-sm text-foreground">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </MotionWrapper>
              )}
            </div>
          </div>

          {/* Right Section - Actions and Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <HoverScale scale={1.05}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-muted/50 transition-colors"
                title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </HoverScale>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <HoverScale scale={1.05}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-muted/50 transition-colors"
                  title="通知"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </button>
              </HoverScale>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <MotionWrapper variant="scale">
                  <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border/30 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    <div className="p-4 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">通知</h3>
                        <span className="text-xs text-foreground-secondary">
                          {unreadNotifications}件の未読
                        </span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <Bell className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">
                                {notification.title}
                              </div>
                              <div className="text-xs text-foreground-secondary mt-1">
                                {notification.message}
                              </div>
                              <div className="text-xs text-foreground-tertiary mt-2">
                                {new Date(notification.timestamp).toLocaleString('ja-JP', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-border/30">
                      <PremiumButton variant="ghost" size="sm" className="w-full">
                        すべての通知を表示
                      </PremiumButton>
                    </div>
                  </div>
                </MotionWrapper>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <HoverScale scale={1.05}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent-emerald/20 flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-semibold text-primary">
                      {(profile?.full_name || user?.email || 'U')?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-foreground-secondary" />
                </button>
              </HoverScale>

              {/* Profile Dropdown */}
              {showProfile && (
                <MotionWrapper variant="scale">
                  <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border/30 rounded-xl shadow-xl backdrop-blur-xl z-50">
                    <div className="p-4 border-b border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent-emerald/20 flex items-center justify-center border border-primary/20">
                          <span className="text-lg font-semibold text-primary">
                            {(profile?.full_name || user?.email || 'U')?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {profile?.full_name || user?.email || 'テストユーザー'}
                          </div>
                          <div className="text-xs text-foreground-secondary">
                            {profile?.role || 'スタッフ'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      {[
                        { icon: <User className="h-4 w-4" />, label: 'プロフィール設定' },
                        { icon: <Settings className="h-4 w-4" />, label: '設定' },
                        { icon: <HelpCircle className="h-4 w-4" />, label: 'ヘルプ' },
                        { icon: <Zap className="h-4 w-4" />, label: 'ショートカット' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="text-foreground-secondary">
                            {item.icon}
                          </div>
                          <span className="text-sm text-foreground">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border/30">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">ログアウト</span>
                      </button>
                    </div>
                  </div>
                </MotionWrapper>
              )}
            </div>
          </div>
        </div>
      </header>
    </MotionWrapper>
  )
}