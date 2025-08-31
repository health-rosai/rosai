'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const premiumButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary', 
        ghost: 'btn-ghost',
        outline: 'border border-border bg-background hover:bg-muted hover:text-foreground hover:border-border-accent hover:-translate-y-0.5',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md',
        gradient: 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:from-primary-dark hover:to-primary hover:-translate-y-1 shadow-lg hover:shadow-xl',
        glow: 'bg-primary text-primary-foreground hover:bg-primary-dark hover:-translate-y-1 shadow-lg hover:shadow-primary/25 hover:shadow-xl animate-glow',
        glass: 'glass-card text-foreground hover:-translate-y-1 hover:shadow-lg',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 shadow-sm hover:shadow-md',
        warning: 'bg-amber-600 text-white hover:bg-amber-700 hover:-translate-y-0.5 shadow-sm hover:shadow-md'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-6 py-2',
        lg: 'h-12 px-8 py-3 text-base',
        xl: 'h-14 px-10 py-4 text-lg',
        icon: 'h-10 w-10'
      },
      animation: {
        none: '',
        float: 'animate-float',
        shimmer: 'animate-shimmer'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'none'
    }
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          premiumButtonVariants({ variant, size, animation }),
          loading && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    )
  }
)
PremiumButton.displayName = 'PremiumButton'

// Specialized Button Components
interface IconButtonProps extends Omit<PremiumButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  tooltip?: string
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, tooltip, className, size = 'icon', ...props }, ref) => (
    <PremiumButton
      ref={ref}
      size={size}
      className={cn('rounded-full', className)}
      title={tooltip}
      {...props}
    >
      {icon}
    </PremiumButton>
  )
)
IconButton.displayName = 'IconButton'

interface ActionButtonProps extends PremiumButtonProps {
  icon?: React.ReactNode
  description?: string
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, description, children, className, ...props }, ref) => (
    <PremiumButton
      ref={ref}
      variant="secondary"
      className={cn('flex-col h-auto p-6 text-left', className)}
      {...props}
    >
      <div className="flex items-center gap-3 w-full">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold">{children}</div>
          {description && (
            <div className="text-xs text-foreground-secondary mt-1">
              {description}
            </div>
          )}
        </div>
      </div>
    </PremiumButton>
  )
)
ActionButton.displayName = 'ActionButton'

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0',
        orientation === 'vertical' && '[&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:first-child)]:border-l',
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
)
ButtonGroup.displayName = 'ButtonGroup'

// Phase-specific buttons
interface PhaseButtonProps extends Omit<PremiumButtonProps, 'variant'> {
  phase: 1 | 2 | 3 | 4 | 5
}

const PhaseButton = forwardRef<HTMLButtonElement, PhaseButtonProps>(
  ({ phase, className, ...props }, ref) => {
    const phaseClasses = {
      1: 'phase-1 phase-1-hover',
      2: 'phase-2 phase-2-hover', 
      3: 'phase-3 phase-3-hover',
      4: 'phase-4 phase-4-hover',
      5: 'phase-5 phase-5-hover'
    }
    
    return (
      <PremiumButton
        ref={ref}
        variant="ghost"
        className={cn(
          phaseClasses[phase],
          'transition-all duration-200',
          className
        )}
        {...props}
      />
    )
  }
)
PhaseButton.displayName = 'PhaseButton'

// Enhanced CTA Button with special effects
interface CTAButtonProps extends PremiumButtonProps {
  pulse?: boolean
  glow?: boolean
}

const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ pulse, glow, className, children, ...props }, ref) => (
    <PremiumButton
      ref={ref}
      variant="gradient"
      size="lg"
      className={cn(
        'font-bold text-base shadow-xl',
        pulse && 'animate-pulse',
        glow && 'animate-glow',
        'hover:scale-105 transform transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </PremiumButton>
  )
)
CTAButton.displayName = 'CTAButton'

export { 
  PremiumButton, 
  IconButton, 
  ActionButton, 
  ButtonGroup, 
  PhaseButton, 
  CTAButton,
  premiumButtonVariants 
}