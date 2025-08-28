'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface FeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: ReactNode
  duration?: number
  onClose?: () => void
  className?: string
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
}

export function FeedbackAlert({ 
  type, 
  title, 
  message, 
  duration = 0, 
  onClose, 
  className 
}: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = iconMap[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'rounded-md border p-4 shadow-sm',
            colorMap[type],
            className
          )}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon className={cn('h-5 w-5', iconColorMap[type])} />
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className="text-sm font-medium">{title}</h3>
              )}
              <div className={cn('text-sm', title ? 'mt-2' : '')}>
                {message}
              </div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      'inline-flex rounded-md p-1.5 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      type === 'success' && 'hover:bg-green-100 focus:ring-green-600',
                      type === 'error' && 'hover:bg-red-100 focus:ring-red-600',
                      type === 'warning' && 'hover:bg-yellow-100 focus:ring-yellow-600',
                      type === 'info' && 'hover:bg-blue-100 focus:ring-blue-600'
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Floating notification component
interface FloatingNotificationProps extends Omit<FeedbackProps, 'onClose'> {
  isVisible: boolean
  onClose: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

const positionMap = {
  'top-right': 'fixed top-4 right-4 z-50',
  'top-left': 'fixed top-4 left-4 z-50',
  'bottom-right': 'fixed bottom-4 right-4 z-50',
  'bottom-left': 'fixed bottom-4 left-4 z-50',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
}

export function FloatingNotification({ 
  isVisible, 
  position = 'top-right', 
  ...props 
}: FloatingNotificationProps) {
  return (
    <div className={positionMap[position]}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm"
          >
            <FeedbackAlert {...props} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Success pulse animation
export function SuccessPulse({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(34, 197, 94, 0)',
          '0 0 0 10px rgba(34, 197, 94, 0.2)',
          '0 0 0 0 rgba(34, 197, 94, 0)'
        ]
      }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

// Loading dots animation
export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const progressColorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className, 
  showValue = false,
  color = 'blue'
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between mb-1">
        {showValue && (
          <motion.span
            className="text-sm font-medium text-gray-700"
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={cn('h-2 rounded-full', progressColorMap[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}