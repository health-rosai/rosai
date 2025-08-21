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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Building2, Clock, AlertCircle, User } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface KanbanColumnProps {
  status: StatusCode
  companies: Company[]
  onCompanyClick: (company: Company) => void
}

interface KanbanCardProps {
  company: Company
  onClick: () => void
}

// ドラッグ可能なカード
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
  }

  const daysSinceUpdate = differenceInDays(new Date(), new Date(company.status_changed_at))
  const isStagnant = daysSinceUpdate > 30

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`mb-3 hover:shadow-md transition-shadow ${isStagnant ? 'border-orange-300' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm line-clamp-2">{company.name}</h4>
              {isStagnant && (
                <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              )}
            </div>
            
            {company.code && (
              <p className="text-xs text-gray-500">{company.code}</p>
            )}
            
            {company.contact_person && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{company.contact_person}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{daysSinceUpdate}日前</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// カンバンの列
function KanbanColumn({ status, companies, onCompanyClick }: KanbanColumnProps) {
  const statusDef = STATUS_DEFINITIONS[status]
  
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case '営業': return 'bg-blue-50 border-blue-200'
      case '提案': return 'bg-purple-50 border-purple-200'
      case '契約': return 'bg-green-50 border-green-200'
      case '健診・判定': return 'bg-yellow-50 border-yellow-200'
      case '労災二次健診': return 'bg-orange-50 border-orange-200'
      case '請求': return 'bg-pink-50 border-pink-200'
      case '完了': return 'bg-gray-50 border-gray-200'
      case '特殊': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${getPhaseColor(statusDef.phase)}`}>
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              {statusDef.name}
            </CardTitle>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {status}
              </Badge>
              <span className="text-xs text-gray-500">
                {companies.length}社
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[500px]">
            <SortableContext
              items={companies.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {companies.map((company) => (
                <KanbanCard
                  key={company.id}
                  company={company}
                  onClick={() => onCompanyClick(company)}
                />
              ))}
            </SortableContext>
          </ScrollArea>
        </CardContent>
      </Card>
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
        distance: 8,
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {statusesByPhase.map(({ phase, statuses }) => (
          <div key={phase}>
            <h3 className="text-lg font-semibold mb-3">{phase}フェーズ</h3>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {statuses.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    companies={companiesByStatus[status] || []}
                    onCompanyClick={onCompanyClick || (() => {})}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId && activeCompany ? (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="font-medium">{activeCompany.name}</div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}