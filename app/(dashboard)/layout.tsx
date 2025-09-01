'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const menuItems = [
  { name: 'ダッシュボード', href: '/dashboard', emoji: '📊' },
  { name: '企業管理', href: '/companies', emoji: '🏢' },
  { name: 'ステータス管理', href: '/kanban', emoji: '📋' },
  { name: 'ガントチャート', href: '/gantt', emoji: '📅' },
  { name: 'レポート', href: '/reports', emoji: '📈' },
  { name: 'メール管理', href: '/admin/email-import', emoji: '✉️' },
  { name: 'FAQ管理', href: '/faqs', emoji: '❓' },
  { name: 'AIアシスタント', href: '/ai-assistant', emoji: '🤖' },
  { name: 'AI分析', href: '/ai-analysis', emoji: '🔍' },
  { name: '設定', href: '/settings', emoji: '⚙️' },
  { name: 'ヘルプ', href: '/help', emoji: '📚' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hamburger Menu */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              労災二次健診システム
            </h1>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              Management System
            </p>
          </div>
        </div>
        
        {/* Right side of header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications */}
          <button style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }}></span>
          </button>
          
          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              管
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>管理者</span>
          </div>
        </div>
      </header>
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ 
          width: collapsed ? '70px' : '250px',
          backgroundColor: 'white', 
          borderRight: '1px solid #e5e5e5',
          padding: '20px',
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        }}>
          <h3 style={{ 
            fontSize: '12px', 
            color: '#999', 
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: collapsed ? 'none' : 'block'
          }}>
            メインメニュー
          </h3>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ 
                    padding: collapsed ? '10px' : '10px 12px',
                    backgroundColor: isActive ? '#9333ea' : 'transparent',
                    color: isActive ? 'white' : '#374151',
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                  title={collapsed ? item.name : undefined}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.emoji}</span>
                  {!collapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div style={{
                      position: 'absolute',
                      left: '100%',
                      marginLeft: '8px',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'opacity 0.2s',
                      zIndex: 1000
                    }}
                    className="tooltip"
                    >
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* AI Assistant Card */}
          {!collapsed && (
            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'linear-gradient(135deg, #f3e7fc 0%, #fce7f3 100%)',
              borderRadius: '12px',
              border: '1px solid #e9d5ff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>AIアシスタント</span>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                業務効率化のためのAI支援機能を活用しましょう
              </p>
              <button style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                borderRadius: '6px',
                color: '#7c3aed',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.1)'
              }}
              >
                詳細を見る
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: '#f9fafb'
        }}>
          {children}
        </main>
      </div>
      
      {/* Add hover styles for tooltips */}
      <style jsx>{`
        .tooltip {
          opacity: 0 !important;
        }
        a:hover .tooltip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}