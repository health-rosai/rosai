'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const premiumCardVariants = cva(
  'relative rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'hover:shadow-lg hover:-translate-y-1 hover:border-border-accent',
        glass: 'glass-card hover:shadow-xl hover:-translate-y-2',
        premium: 'premium-card-xl hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02]',
        glow: 'premium-card hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30',
        floating: 'premium-card shadow-lg hover:shadow-xl hover:-translate-y-4 hover:scale-[1.03] animate-float',
        interactive: 'premium-card cursor-pointer interactive-hover interactive-press'
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      gradient: {
        none: '',
        subtle: 'bg-gradient-to-br from-card via-background-secondary to-card',
        primary: 'bg-gradient-to-br from-primary/5 via-card to-primary/10',
        emerald: 'bg-gradient-to-br from-emerald-50/50 via-card to-emerald-100/30',
        purple: 'bg-gradient-to-br from-purple-50/50 via-card to-purple-100/30',
        amber: 'bg-gradient-to-br from-amber-50/50 via-card to-amber-100/30'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      gradient: 'none'
    }
  }
)

export interface PremiumCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumCardVariants> {
  shimmer?: boolean
  children?: React.ReactNode
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, size, gradient, shimmer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          premiumCardVariants({ variant, size, gradient }),
          shimmer && 'animate-shimmer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PremiumCard.displayName = 'PremiumCard'

const PremiumCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2', className)}
    {...props}
  />
))
PremiumCardHeader.displayName = 'PremiumCardHeader'

const PremiumCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
))
PremiumCardTitle.displayName = 'PremiumCardTitle'

const PremiumCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-foreground-secondary leading-relaxed', className)}
    {...props}
  />
))
PremiumCardDescription.displayName = 'PremiumCardDescription'

const PremiumCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-2', className)} {...props} />
))
PremiumCardContent.displayName = 'PremiumCardContent'

const PremiumCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
PremiumCardFooter.displayName = 'PremiumCardFooter'

// Specialized Cards for Different Use Cases
interface StatsCardProps extends PremiumCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red'
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, icon, trend, trendValue, color = 'blue', className, ...props }, ref) => {
    const colorClasses = {
      blue: 'from-blue-50/50 to-blue-100/30 border-blue-200/30',
      green: 'from-emerald-50/50 to-emerald-100/30 border-emerald-200/30',
      purple: 'from-purple-50/50 to-purple-100/30 border-purple-200/30',
      amber: 'from-amber-50/50 to-amber-100/30 border-amber-200/30',
      red: 'from-red-50/50 to-red-100/30 border-red-200/30'
    }

    const iconColorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-emerald-600 bg-emerald-100',
      purple: 'text-purple-600 bg-purple-100',
      amber: 'text-amber-600 bg-amber-100',
      red: 'text-red-600 bg-red-100'
    }

    const trendClasses = {
      up: 'text-emerald-600',
      down: 'text-red-600',
      neutral: 'text-foreground-secondary'
    }

    return (
      <PremiumCard
        ref={ref}
        variant="glow"
        className={cn(
          'bg-gradient-to-br',
          colorClasses[color],
          className
        )}
        {...props}
      >
        <PremiumCardHeader>
          <div className="flex items-center justify-between">
            <PremiumCardTitle className="text-sm font-medium text-foreground-secondary">
              {title}
            </PremiumCardTitle>
            {icon && (
              <div className={cn(
                'p-2 rounded-lg',
                iconColorClasses[color]
              )}>
                {icon}
              </div>
            )}
          </div>
        </PremiumCardHeader>
        <PremiumCardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm font-medium',
                trendClasses[trend]
              )}>
                {trend === 'up' && '+'}
                {trend === 'down' && ''}
                {trendValue}
              </span>
              <span className="text-xs text-foreground-tertiary ml-2">前月比</span>
            </div>
          )}
        </PremiumCardContent>
      </PremiumCard>
    )
  }
)
StatsCard.displayName = 'StatsCard'

interface FeatureCardProps extends PremiumCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  badge?: string
  action?: React.ReactNode
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, badge, action, className, ...props }, ref) => (
    <PremiumCard
      ref={ref}
      variant="interactive"
      className={cn('group', className)}
      {...props}
    >
      <PremiumCardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {icon}
              </div>
            )}
            <div>
              <PremiumCardTitle className="group-hover:text-primary transition-colors">
                {title}
              </PremiumCardTitle>
              {badge && (
                <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent>
        <PremiumCardDescription>{description}</PremiumCardDescription>
      </PremiumCardContent>
      {action && (
        <PremiumCardFooter>
          {action}
        </PremiumCardFooter>
      )}
    </PremiumCard>
  )
)
FeatureCard.displayName = 'FeatureCard'

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardFooter,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  StatsCard,
  FeatureCard
}