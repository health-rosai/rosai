'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  PremiumCard, 
  PremiumCardContent, 
  PremiumCardDescription, 
  PremiumCardHeader, 
  PremiumCardTitle 
} from './premium-card'
import { PremiumButton } from './premium-button'
import { Badge } from './badge'
import { ScrollArea } from './scroll-area'
import { MotionWrapper, StaggerList, StaggerItem, HoverScale } from './motion'
import {
  Activity,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Plus,
  Sparkles,
  Zap,
  AlertCircle,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Settings,
  ArrowRight
} from 'lucide-react'

interface RightSidebarProps {
  className?: string
}

interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: Date
  type: 'info' | 'success' | 'warning' | 'error'
  icon: React.ReactNode
}

interface TaskItem {
  id: string
  title: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
}

interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: Date
  type: 'info' | 'warning' | 'error'
  isRead: boolean
}

export function RightSidebar({ className }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks' | 'notifications'>('activity')

  // Sample data - can be replaced with real data
  const activities: ActivityItem[] = [
    {
      id: '1',
      title: '新規企業登録',
      description: 'ABC株式会社が登録されました',
      timestamp: new Date(),
      type: 'success',
      icon: <Plus className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'ステータス更新',
      description: 'XYZ会社が健診完了に変更',
      timestamp: new Date(Date.now() - 3600000),
      type: 'info',
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'アラート発生',
      description: '期限が近い企業があります',
      timestamp: new Date(Date.now() - 7200000),
      type: 'warning',
      icon: <AlertCircle className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'レポート生成',
      description: '月次レポートが生成されました',
      timestamp: new Date(Date.now() - 10800000),
      type: 'success',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      id: '5',
      title: 'システム更新',
      description: 'データベースが更新されました',
      timestamp: new Date(Date.now() - 14400000),
      type: 'info',
      icon: <Settings className="h-4 w-4" />
    }
  ]

  const tasks: TaskItem[] = [
    {
      id: '1',
      title: '健診期限確認',
      dueDate: new Date(Date.now() + 86400000),
      priority: 'high',
      status: 'pending'
    },
    {
      id: '2',
      title: '月次レポート作成',
      dueDate: new Date(Date.now() + 172800000),
      priority: 'medium',
      status: 'in_progress'
    },
    {
      id: '3',
      title: 'データバックアップ',
      dueDate: new Date(Date.now() + 259200000),
      priority: 'low',
      status: 'pending'
    },
    {
      id: '4',
      title: 'システムメンテナンス',
      dueDate: new Date(Date.now() + 345600000),
      priority: 'medium',
      status: 'pending'
    }
  ]

  const notifications: NotificationItem[] = [
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
      title: 'システム通知',
      message: 'データバックアップが完了しました',
      timestamp: new Date(Date.now() - 3600000),
      type: 'info',
      isRead: false
    },
    {
      id: '3',
      title: '新機能リリース',
      message: 'AI分析機能が追加されました',
      timestamp: new Date(Date.now() - 7200000),
      type: 'info',
      isRead: true
    }
  ]

  const stats = [
    { label: '今日の新規登録', value: '3', icon: <Plus className="h-4 w-4" />, color: 'text-blue-600' },
    { label: '完了済みタスク', value: '12', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
    { label: '要注意アラート', value: '5', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600' },
    { label: 'アクティブユーザー', value: '8', icon: <Users className="h-4 w-4" />, color: 'text-purple-600' }
  ]

  const quickActions = [
    { label: '新規企業登録', icon: <Plus className="h-4 w-4" />, color: 'bg-blue-500' },
    { label: 'レポート生成', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-green-500' },
    { label: 'アラート確認', icon: <Bell className="h-4 w-4" />, color: 'bg-orange-500' },
    { label: '設定', icon: <Settings className="h-4 w-4" />, color: 'bg-gray-500' }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-orange-600 bg-orange-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case 'in_progress': return <Clock className="h-3 w-3 text-blue-600" />
      default: return <Circle className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <MotionWrapper variant="slideUp" className="h-full">
      <div className="flex flex-col h-full bg-gradient-to-b from-background via-background-secondary/30 to-background-tertiary/20 border-l border-border/30">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-border/30 bg-gradient-to-r from-background/80 to-background-secondary/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent-emerald/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                活動センター
              </h2>
              <p className="text-xs text-foreground-tertiary">
                リアルタイム更新
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
            {[
              { id: 'activity', label: 'アクティビティ', icon: <Activity className="h-3 w-3" /> },
              { id: 'tasks', label: 'タスク', icon: <Calendar className="h-3 w-3" /> },
              { id: 'notifications', label: '通知', icon: <Bell className="h-3 w-3" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex-shrink-0 p-4">
          <MotionWrapper variant="fade" delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              <StaggerList>
                {stats.map((stat, index) => (
                  <StaggerItem key={stat.label}>
                    <HoverScale scale={1.05}>
                      <div className="p-3 rounded-lg bg-card/50 border border-border/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <div className={`${stat.color}`}>
                            {stat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-foreground-tertiary truncate">{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    </HoverScale>
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          </MotionWrapper>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {activeTab === 'activity' && (
                <MotionWrapper variant="fade" delay={0.2}>
                  <PremiumCard variant="glass" size="sm">
                    <PremiumCardHeader>
                      <div className="flex items-center justify-between">
                        <PremiumCardTitle className="text-sm">最新のアクティビティ</PremiumCardTitle>
                        <PremiumButton variant="ghost" size="sm" leftIcon={<Filter className="h-3 w-3" />}>
                          フィルター
                        </PremiumButton>
                      </div>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <StaggerList className="space-y-3">
                        {activities.map((activity) => (
                          <StaggerItem key={activity.id}>
                            <HoverScale scale={1.02}>
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                                <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                                  {activity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    {activity.title}
                                  </div>
                                  <div className="text-xs text-foreground-secondary mt-1">
                                    {activity.description}
                                  </div>
                                  <div className="text-xs text-foreground-tertiary mt-2">
                                    {format(activity.timestamp, 'HH:mm', { locale: ja })}
                                  </div>
                                </div>
                              </div>
                            </HoverScale>
                          </StaggerItem>
                        ))}
                      </StaggerList>
                    </PremiumCardContent>
                  </PremiumCard>
                </MotionWrapper>
              )}

              {activeTab === 'tasks' && (
                <MotionWrapper variant="fade" delay={0.2}>
                  <PremiumCard variant="glass" size="sm">
                    <PremiumCardHeader>
                      <div className="flex items-center justify-between">
                        <PremiumCardTitle className="text-sm">今日のタスク</PremiumCardTitle>
                        <PremiumButton variant="ghost" size="sm" leftIcon={<Plus className="h-3 w-3" />}>
                          追加
                        </PremiumButton>
                      </div>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <StaggerList className="space-y-3">
                        {tasks.map((task) => (
                          <StaggerItem key={task.id}>
                            <HoverScale scale={1.02}>
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                                <div className="pt-1">
                                  {getStatusIcon(task.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                      {task.title}
                                    </span>
                                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-foreground-tertiary">
                                    期限: {format(task.dueDate, 'MM/dd HH:mm', { locale: ja })}
                                  </div>
                                </div>
                              </div>
                            </HoverScale>
                          </StaggerItem>
                        ))}
                      </StaggerList>
                    </PremiumCardContent>
                  </PremiumCard>
                </MotionWrapper>
              )}

              {activeTab === 'notifications' && (
                <MotionWrapper variant="fade" delay={0.2}>
                  <PremiumCard variant="glass" size="sm">
                    <PremiumCardHeader>
                      <div className="flex items-center justify-between">
                        <PremiumCardTitle className="text-sm">通知センター</PremiumCardTitle>
                        <PremiumButton variant="ghost" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
                          全て表示
                        </PremiumButton>
                      </div>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <StaggerList className="space-y-3">
                        {notifications.map((notification) => (
                          <StaggerItem key={notification.id}>
                            <HoverScale scale={1.02}>
                              <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${
                                notification.isRead ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10'
                              }`}>
                                <div className={`p-2 rounded-lg ${getTypeColor(notification.type)} flex-shrink-0`}>
                                  <Bell className="h-3 w-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    {notification.title}
                                  </div>
                                  <div className="text-xs text-foreground-secondary mt-1">
                                    {notification.message}
                                  </div>
                                  <div className="text-xs text-foreground-tertiary mt-2">
                                    {format(notification.timestamp, 'MM/dd HH:mm', { locale: ja })}
                                  </div>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </HoverScale>
                          </StaggerItem>
                        ))}
                      </StaggerList>
                    </PremiumCardContent>
                  </PremiumCard>
                </MotionWrapper>
              )}

              {/* Quick Actions */}
              <MotionWrapper variant="fade" delay={0.3}>
                <PremiumCard variant="premium" size="sm">
                  <PremiumCardHeader>
                    <PremiumCardTitle className="text-sm">クイックアクション</PremiumCardTitle>
                    <PremiumCardDescription className="text-xs">
                      よく使用する機能への素早いアクセス
                    </PremiumCardDescription>
                  </PremiumCardHeader>
                  <PremiumCardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <StaggerList>
                        {quickActions.map((action) => (
                          <StaggerItem key={action.label}>
                            <HoverScale scale={1.05}>
                              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                  {action.icon}
                                </div>
                                <span className="text-xs font-medium text-foreground-secondary group-hover:text-foreground">
                                  {action.label}
                                </span>
                              </button>
                            </HoverScale>
                          </StaggerItem>
                        ))}
                      </StaggerList>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>

              {/* Performance Insights */}
              <MotionWrapper variant="fade" delay={0.4}>
                <PremiumCard variant="floating" size="sm">
                  <PremiumCardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <PremiumCardTitle className="text-sm">パフォーマンス</PremiumCardTitle>
                        <PremiumCardDescription className="text-xs">今月の進捗</PremiumCardDescription>
                      </div>
                    </div>
                  </PremiumCardHeader>
                  <PremiumCardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground-secondary">完了率</span>
                        <span className="text-sm font-semibold text-green-600">+12.3%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-[78%]" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-foreground-tertiary">
                        <span>78/100</span>
                        <span>目標達成まで22</span>
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </MotionWrapper>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border/30 bg-gradient-to-r from-background/50 to-background-secondary/50">
          <PremiumButton
            variant="outline"
            size="sm"
            className="w-full"
            leftIcon={<ArrowRight className="h-3 w-3" />}
          >
            全ての活動を表示
          </PremiumButton>
        </div>
      </div>
    </MotionWrapper>
  )
}

// Helper component for Circle icon (not available in lucide-react)
function Circle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}