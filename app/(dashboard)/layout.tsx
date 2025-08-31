'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const menuSections = [
  {
    title: 'メインメニュー',
    items: [
      { name: 'ダッシュボード', href: '/dashboard', emoji: '📊' },
      { name: '企業管理', href: '/companies', emoji: '🏢' },
      { name: 'ステータス進捗管理', href: '/kanban', emoji: '📋' },
      { name: 'ガントチャート', href: '/gantt', emoji: '📅' },
      { name: 'レポート', href: '/reports', emoji: '📈' },
      { name: 'メール管理', href: '/admin/email-import', emoji: '✉️' },
      { name: 'FAQ管理', href: '/faqs', emoji: '❓' },
    ],
  },
  {
    title: 'AI機能',
    items: [
      { name: 'AIアシスタント', href: '/ai-assistant', emoji: '🤖' },
      { name: '業務効率化のためのAI支援機能', href: '/ai-analysis', emoji: '🔍' },
    ],
  },
  {
    title: 'システム',
    items: [
      { name: '設定', href: '/settings', emoji: '⚙️' },
      { name: 'ヘルプ', href: '/help', emoji: '📚' },
    ],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <header 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', color: '#333', fontWeight: '600', margin: 0 }}>
            労災二次健診システム
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            Management System
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🔔</span>
            <span>通知</span>
          </button>
          <button 
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>👤</span>
            <span>管理者</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div 
        style={{
          display: 'flex',
          flex: 1,
          margin: '1rem',
          gap: '1rem',
          maxWidth: '1400px',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {/* Sidebar */}
        <aside 
          style={{
            width: '280px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto'
          }}
        >
          {menuSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}>
                {section.title}
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        color: isActive ? 'white' : '#4b5563',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                        transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#4b5563';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>{item.emoji}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}

          {/* AI Assistant Card */}
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f3e7fc 0%, #fce7f3 100%)',
            border: '1px solid #e9d5ff',
            marginTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                AIアシスタント
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              業務効率化のためのAI支援機能を活用しましょう
            </p>
            <button style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#7c3aed',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              詳細を見る
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}