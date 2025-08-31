'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon?: ReactNode
  className?: string
  color?: 'blue' | 'green' | 'purple' | 'red' | 'amber' | 'indigo'
}

const colorVariants = {
  blue: 'from-blue-600 to-indigo-600',
  green: 'from-emerald-600 to-green-600',
  purple: 'from-purple-600 to-pink-600',
  red: 'from-red-600 to-orange-600',
  amber: 'from-amber-600 to-yellow-600',
  indigo: 'from-indigo-600 to-blue-600',
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  className,
  color = 'blue',
}: StatsCardProps) {
  const gradientColor = colorVariants[color]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-5',
        gradientColor
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br text-white',
            gradientColor
          )}>
            {icon}
          </div>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={cn(
            'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
            gradientColor
          )}>
            {value}
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className={cn(
        'absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-gradient-to-br opacity-10',
        gradientColor
      )} />
      <div className={cn(
        'absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br opacity-5',
        gradientColor
      )} />
    </div>
  )
}