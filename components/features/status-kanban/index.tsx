'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { Company, STATUS_DEFINITIONS, StatusCode } from '@/types/database'
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/components/ui/premium-card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Building2, Clock, AlertCircle, User, Plus, TrendingUp } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: StatusCode
  companies: Company[]
  onCompanyClick: (company: Company) => void
}

interface KanbanCardProps {
  company: Company
  onClick: () => void
}

// ドラッグ可能なカード - プレミアムデザイン
function KanbanCard({ company, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const daysSinceUpdate = differenceInDays(new Date(), new Date(company.status_changed_at))
  const isStagnant = daysSinceUpdate > 30
  const isUrgent = daysSinceUpdate > 60

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <PremiumCard 
        variant={isDragging ? "glow" : "interactive"}
        className={cn(
          "mb-4 transition-all duration-300 hover:shadow-lg",
          isUrgent && "border-red-300 bg-red-50/50",
          isStagnant && !isUrgent && "border-amber-300 bg-amber-50/50",
          isDragging && "shadow-2xl scale-110 rotate-1 ring-4 ring-primary/20",
          !isDragging && "hover:scale-105 hover:-translate-y-1"
        )}
        size="sm"
      >
        <PremiumCardContent>
          <div className="space-y-3">
            {/* Header with status indicator */}
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-base text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {company.name}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {isUrgent && (
                  <div className="p-1 rounded-full bg-red-100 animate-pulse">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  </div>
                )}
                {isStagnant && !isUrgent && (
                  <div className="p-1 rounded-full bg-amber-100">
                    <Clock className="h-3 w-3 text-amber-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Company code */}
            {company.code && (
              <div className="px-3 py-1.5 bg-muted/70 rounded-lg border border-border/50">
                <p className="text-sm font-mono font-medium text-foreground-secondary">{company.code}</p>
              </div>
            )}
            
            {/* Contact person */}
            {company.contact_person && (
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-medium">{company.contact_person}</span>
              </div>
            )}
            
            {/* Time info */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                <Clock className="h-3 w-3" />
                <span>{daysSinceUpdate}日前</span>
              </div>
              {daysSinceUpdate > 7 && (
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isUrgent && "bg-red-100 text-red-700",
                  isStagnant && !isUrgent && "bg-amber-100 text-amber-700"
                )}>
                  {isUrgent ? "要注意" : "停滞中"}
                </div>
              )}
            </div>
          </div>
        </PremiumCardContent>
      </PremiumCard>
    </div>
  )
}

// カンバンの列 - プレミアムデザイン
function KanbanColumn({ status, companies, onCompanyClick }: KanbanColumnProps) {
  const statusDef = STATUS_DEFINITIONS[status]
  
  const getPhaseGradient = (phase: string) => {
    switch (phase) {
      case '営業': return 'from-blue-50/50 to-blue-100/30'
      case '提案': return 'from-purple-50/50 to-purple-100/30'
      case '契約': return 'from-emerald-50/50 to-emerald-100/30'
      case '健診・判定': return 'from-amber-50/50 to-amber-100/30'
      case '労災二次健診': return 'from-orange-50/50 to-orange-100/30'
      case '請求': return 'from-pink-50/50 to-pink-100/30'
      case '完了': return 'from-gray-50/50 to-gray-100/30'
      case '特殊': return 'from-red-50/50 to-red-100/30'
      default: return 'from-gray-50/50 to-gray-100/30'
    }
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case '営業': return '🎯'
      case '提案': return '📋'
      case '契約': return '✅'
      case '健診・判定': return '🏥'
      case '労災二次健診': return '🔬'
      case '請求': return '💰'
      case '完了': return '✨'
      case '特殊': return '⚠️'
      default: return '📁'
    }
  }

  const urgentCount = companies.filter(c => differenceInDays(new Date(), new Date(c.status_changed_at)) > 60).length
  const stagnantCount = companies.filter(c => {
    const days = differenceInDays(new Date(), new Date(c.status_changed_at))
    return days > 30 && days <= 60
  }).length

  return (
    <div className="flex-shrink-0" style={{ width: '360px' }}>
      <PremiumCard 
        variant="glass" 
        className={cn(
          "h-full bg-gradient-to-br border-border/30 backdrop-blur-sm",
          getPhaseGradient(statusDef.phase)
        )}
      >
        <PremiumCardHeader>
          <div className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center gap-3">
              <div className="text-lg">{getPhaseIcon(statusDef.phase)}</div>
              <div className="flex-1">
                <PremiumCardTitle className="text-base font-bold text-foreground">
                  {statusDef.name}
                </PremiumCardTitle>
                <Badge variant="secondary" className="text-xs mt-1 font-mono">
                  {status}
                </Badge>
              </div>
            </div>
            
            {/* Column Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-foreground-secondary" />
                  <span className="font-semibold text-foreground">{companies.length}</span>
                  <span className="text-foreground-secondary">社</span>
                </div>
                {urgentCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-medium">{urgentCount}</span>
                  </div>
                )}
                {stagnantCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{stagnantCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PremiumCardHeader>
        
        <PremiumCardContent className="pt-2">
          <ScrollArea className="h-[calc(100vh-280px)] pr-3">
            <SortableContext
              items={companies.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="space-y-2">
                {companies.length === 0 && (
                  <div className="text-center py-8 text-foreground-tertiary">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-sm">このステータスに企業はありません</p>
                  </div>
                )}
                {companies.map((company) => (
                  <KanbanCard
                    key={company.id}
                    company={company}
                    onClick={() => onCompanyClick(company)}
                  />
                ))}
                
                {/* Empty state */}
                {companies.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">{getPhaseIcon(statusDef.phase)}</div>
                    <p className="text-sm text-foreground-secondary">
                      企業がありません
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </ScrollArea>
        </PremiumCardContent>
      </PremiumCard>
    </div>
  )
}

interface StatusKanbanProps {
  companies: Company[]
  onStatusChange?: (companyId: string, newStatus: StatusCode) => Promise<void>
  onCompanyClick?: (company: Company) => void
}

export default function StatusKanban({ 
  companies, 
  onStatusChange,
  onCompanyClick 
}: StatusKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [companiesByStatus, setCompaniesByStatus] = useState<Record<StatusCode, Company[]>>({} as any)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    // ステータスごとに企業を分類
    const grouped = Object.keys(STATUS_DEFINITIONS).reduce((acc, status) => {
      acc[status as StatusCode] = companies.filter(c => c.current_status === status)
      return acc
    }, {} as Record<StatusCode, Company[]>)
    
    setCompaniesByStatus(grouped)
  }, [companies])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    // ドラッグされた企業を特定
    const draggedCompany = companies.find(c => c.id === active.id)
    if (!draggedCompany) return

    // 新しいステータスを特定（over.idがステータスコード）
    const newStatus = Object.keys(STATUS_DEFINITIONS).find(status => {
      const companiesInStatus = companiesByStatus[status as StatusCode] || []
      return companiesInStatus.some(c => c.id === over.id)
    }) as StatusCode

    if (!newStatus || newStatus === draggedCompany.current_status) return

    // ステータス更新
    if (onStatusChange) {
      try {
        await onStatusChange(draggedCompany.id, newStatus)
        toast.success(`${draggedCompany.name}のステータスを更新しました`)
      } catch (error) {
        toast.error('ステータスの更新に失敗しました')
      }
    }
  }

  const activeCompany = companies.find(c => c.id === activeId)

  // フェーズごとにグループ化
  const phases = ['営業', '提案', '契約', '健診・判定', '労災二次健診', '請求', '完了', '特殊']
  const statusesByPhase = phases.map(phase => ({
    phase,
    statuses: Object.entries(STATUS_DEFINITIONS)
      .filter(([_, def]) => def.phase === phase)
      .map(([code]) => code as StatusCode)
  }))

  const getPhaseEmoji = (phase: string) => {
    switch (phase) {
      case '営業': return '🎯'
      case '提案': return '📋'
      case '契約': return '✅'
      case '健診・判定': return '🏥'
      case '労災二次健診': return '🔬'
      case '請求': return '💰'
      case '完了': return '✨'
      case '特殊': return '⚠️'
      default: return '📁'
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* シンプルなカンバン表示 - フェーズごとに分けない */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {Object.keys(STATUS_DEFINITIONS).map(status => (
              <KanbanColumn
                key={status}
                status={status as StatusCode}
                companies={companiesByStatus[status as StatusCode] || []}
                onCompanyClick={onCompanyClick || (() => {})}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {/* ドラッグ中のオーバーレイ */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeCompany && (
          <div className="opacity-90 transform rotate-3">
            <PremiumCard variant="glow" className="shadow-2xl border-2 border-primary">
              <PremiumCardContent>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{activeCompany.name}</h4>
                  {activeCompany.code && (
                    <p className="text-sm font-mono text-foreground-secondary">{activeCompany.code}</p>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}