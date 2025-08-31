'use client'

import { useState, useEffect } from 'react'
import { Company, STATUS_DEFINITIONS, StatusCode } from '@/types/database'
import { dummyCompanies } from '@/scripts/seed-dummy-data'

// ステータスの順序定義
const STATUS_ORDER = [
  '01', '02', '03A', '03B', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '99A', '99D', '99E'
] as StatusCode[]

export default function GanttPage() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    // 開発環境ではダミーデータを使用
    if (process.env.NODE_ENV === 'development') {
      setCompanies(dummyCompanies as Company[])
    }
  }, [])

  // 進捗幅を計算（各ステータス100px）
  const getProgressWidth = (status: StatusCode): number => {
    const index = STATUS_ORDER.indexOf(status)
    if (index === -1) return 100
    return (index + 1) * 100
  }

  // フェーズの色を取得
  const getPhaseColor = (status: StatusCode): string => {
    const statusDef = STATUS_DEFINITIONS[status]
    if (!statusDef) return '#808080'
    
    switch (statusDef.phase) {
      case '営業': return '#4A90E2'
      case '提案': return '#9B59B6'
      case '契約': return '#27AE60'
      case '健診・判定': return '#F39C12'
      case '労災二次健診': return '#E67E22'
      case '請求': return '#E91E63'
      case '完了': return '#7F8C8D'
      case '特殊': return '#E74C3C'
      default: return '#95A5A6'
    }
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      {/* タイトル */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C3E50' }}>
          進捗ガントチャート
        </h1>
        <p style={{ color: '#7F8C8D', marginTop: '5px' }}>
          企業ごとの進捗状況 - 全{companies.length}社
        </p>
      </div>

      {/* メインコンテンツ */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', height: '600px' }}>
          {/* 左側：企業名 */}
          <div style={{ 
            width: '250px', 
            borderRight: '2px solid #E0E6ED',
            backgroundColor: '#FAFBFC'
          }}>
            {/* ヘッダー */}
            <div style={{ 
              height: '50px', 
              display: 'flex', 
              alignItems: 'center',
              padding: '0 15px',
              borderBottom: '2px solid #E0E6ED',
              backgroundColor: '#F1F3F5',
              fontWeight: 'bold',
              color: '#2C3E50'
            }}>
              企業名
            </div>
            
            {/* 企業リスト */}
            <div style={{ overflowY: 'auto', height: 'calc(100% - 50px)' }}>
              {companies.map((company, index) => (
                <div 
                  key={company.id}
                  style={{ 
                    height: '60px', 
                    padding: '10px 15px',
                    borderBottom: '1px solid #E0E6ED',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#2C3E50', fontSize: '14px' }}>
                    {company.name}
                  </div>
                  {company.code && (
                    <div style={{ fontSize: '12px', color: '#95A5A6', marginTop: '2px' }}>
                      {company.code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右側：ガントチャート */}
          <div style={{ flex: 1, overflowX: 'auto' }}>
            {/* ステータスヘッダー */}
            <div style={{ 
              height: '50px',
              borderBottom: '2px solid #E0E6ED',
              backgroundColor: '#F1F3F5',
              width: `${STATUS_ORDER.length * 100}px`,
              display: 'flex'
            }}>
              {STATUS_ORDER.map((status) => {
                const statusDef = STATUS_DEFINITIONS[status]
                return (
                  <div 
                    key={status}
                    style={{ 
                      width: '100px',
                      borderRight: '1px solid #DDD',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '5px'
                    }}
                  >
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      color: '#2C3E50',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '90px'
                    }}>
                      {statusDef?.name || status}
                    </div>
                    <div style={{ fontSize: '10px', color: '#95A5A6', marginTop: '2px' }}>
                      {status}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* チャートボディ */}
            <div style={{ 
              overflowY: 'auto', 
              height: 'calc(100% - 50px)',
              width: `${STATUS_ORDER.length * 100}px`
            }}>
              {companies.map((company, index) => {
                const progressWidth = getProgressWidth(company.current_status)
                const color = getPhaseColor(company.current_status)
                const progressPercent = Math.round((STATUS_ORDER.indexOf(company.current_status) + 1) / STATUS_ORDER.length * 100)
                
                return (
                  <div 
                    key={company.id}
                    style={{ 
                      height: '60px',
                      borderBottom: '1px solid #E0E6ED',
                      position: 'relative',
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC'
                    }}
                  >
                    {/* グリッド線 */}
                    <div style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex'
                    }}>
                      {STATUS_ORDER.map((_, idx) => (
                        <div 
                          key={idx}
                          style={{ 
                            width: '100px',
                            borderRight: '1px solid #EEE'
                          }}
                        />
                      ))}
                    </div>

                    {/* 進捗バー */}
                    <div style={{ 
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '30px',
                      width: `${progressWidth}px`,
                      backgroundColor: color,
                      borderRadius: '0 4px 4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '10px',
                      transition: 'all 0.3s ease',
                      opacity: 0.9,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.height = '35px'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                      e.currentTarget.style.height = '30px'
                    }}
                    >
                      <span style={{ 
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px 20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', color: '#2C3E50' }}>フェーズ:</span>
          {['営業', '提案', '契約', '健診・判定', '労災二次健診', '請求', '完了', '特殊'].map(phase => (
            <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '3px',
                backgroundColor: (() => {
                  switch(phase) {
                    case '営業': return '#4A90E2'
                    case '提案': return '#9B59B6'
                    case '契約': return '#27AE60'
                    case '健診・判定': return '#F39C12'
                    case '労災二次健診': return '#E67E22'
                    case '請求': return '#E91E63'
                    case '完了': return '#7F8C8D'
                    case '特殊': return '#E74C3C'
                    default: return '#95A5A6'
                  }
                })()
              }} />
              <span style={{ fontSize: '14px', color: '#5A6C7D' }}>{phase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}