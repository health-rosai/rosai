import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ReportRequest {
  template: string
  dateRange: {
    start: string
    end: string
  }
  format: 'pdf' | 'excel' | 'csv'
  data: any
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: any[]
  config: any
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ReportRequest = await request.json()
    const { template, dateRange, format, data } = body

    if (!template || !dateRange || !format || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    switch (format) {
      case 'csv':
        return generateCSVReport(data, template, dateRange)
      case 'excel':
        return generateExcelReport(data, template, dateRange)
      case 'pdf':
        return generatePDFReport(data, template, dateRange)
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

async function generateCSVReport(data: any, template: string, dateRange: any) {
  try {
    let csvContent = `労災二次健診システム - ${getTemplateName(template)}\n`
    csvContent += `期間,${dateRange.start},${dateRange.end}\n`
    csvContent += `生成日時,${new Date().toLocaleString('ja-JP')}\n\n`

    // Executive Summary
    if (data.executiveSummary) {
      csvContent += `エグゼクティブサマリー\n`
      csvContent += `項目,値\n`
      csvContent += `総企業数,${data.executiveSummary.totalCompanies}\n`
      csvContent += `進行中案件,${data.executiveSummary.activeCompanies}\n`
      csvContent += `完了企業数,${data.executiveSummary.completedCompanies}\n`
      csvContent += `完了率,${data.executiveSummary.conversionRate}%\n`
      csvContent += `平均処理日数,${data.executiveSummary.avgProcessingDays}日\n`
      csvContent += `売上予測,${data.executiveSummary.revenueProjection}円\n\n`
    }

    // Company Status by Phase
    if (data.companyStatus?.byPhase) {
      csvContent += `フェーズ別企業数\n`
      csvContent += `フェーズ,企業数\n`
      Object.entries(data.companyStatus.byPhase).forEach(([phase, count]) => {
        csvContent += `${phase},${count}\n`
      })
      csvContent += `\n`
    }

    // Company Status by Status
    if (data.companyStatus?.byStatus) {
      csvContent += `ステータス別企業数\n`
      csvContent += `ステータス,企業数\n`
      Object.entries(data.companyStatus.byStatus).forEach(([status, count]) => {
        csvContent += `${status},${count}\n`
      })
      csvContent += `\n`
    }

    // Progress Metrics
    if (data.progressMetrics) {
      csvContent += `進捗メトリクス\n`
      csvContent += `指標,値\n`
      csvContent += `完了率,${data.progressMetrics.completionRate}%\n`
      csvContent += `時間内完了率,${data.progressMetrics.onTimeDelivery}%\n`
      csvContent += `顧客満足度,${data.progressMetrics.customerSatisfaction}\n`
      csvContent += `エラー率,${data.progressMetrics.errorRate}%\n\n`

      if (data.progressMetrics.trends) {
        csvContent += `トレンド分析\n`
        csvContent += `指標,現在値,前回値,変化率\n`
        data.progressMetrics.trends.forEach((trend: any) => {
          csvContent += `${trend.metric},${trend.current},${trend.previous},${trend.change}%\n`
        })
        csvContent += `\n`
      }
    }

    // FAQ Analysis
    if (data.faqAnalysis) {
      csvContent += `FAQ分析\n`
      csvContent += `総FAQ数,${data.faqAnalysis.totalFAQs}\n`
      csvContent += `AI生成率,${data.faqAnalysis.aiGeneratedRatio}%\n\n`

      if (data.faqAnalysis.categoryDistribution) {
        csvContent += `カテゴリ別分布\n`
        csvContent += `カテゴリ,件数\n`
        data.faqAnalysis.categoryDistribution.forEach((item: any) => {
          csvContent += `${item.category},${item.count}\n`
        })
        csvContent += `\n`
      }

      if (data.faqAnalysis.topQuestions) {
        csvContent += `よくある質問TOP10\n`
        csvContent += `質問,頻度,カテゴリ\n`
        data.faqAnalysis.topQuestions.forEach((faq: any) => {
          csvContent += `"${faq.question}",${faq.frequency},${faq.category}\n`
        })
        csvContent += `\n`
      }
    }

    // Email Activity
    if (data.emailActivity) {
      csvContent += `メール活動\n`
      csvContent += `指標,値\n`
      csvContent += `総メール数,${data.emailActivity.totalEmails}\n`
      csvContent += `処理済みメール数,${data.emailActivity.processedEmails}\n`
      csvContent += `自動返信数,${data.emailActivity.autoReplies}\n`
      csvContent += `平均応答時間,${data.emailActivity.averageResponseTime}時間\n\n`
    }

    // Performance KPIs
    if (data.performance?.kpis) {
      csvContent += `KPI指標\n`
      csvContent += `指標名,現在値,目標値,単位,達成率\n`
      data.performance.kpis.forEach((kpi: any) => {
        const achievementRate = Math.round((kpi.value / kpi.target) * 100)
        csvContent += `${kpi.name},${kpi.value},${kpi.target},${kpi.unit},${achievementRate}%\n`
      })
      csvContent += `\n`
    }

    // Department Metrics
    if (data.performance?.departmentMetrics) {
      csvContent += `部門別メトリクス\n`
      csvContent += `部門,効率性,作業負荷\n`
      data.performance.departmentMetrics.forEach((dept: any) => {
        csvContent += `${dept.department},${dept.efficiency}%,${dept.workload}%\n`
      })
      csvContent += `\n`
    }

    // Recommendations
    if (data.recommendations) {
      csvContent += `推奨アクション\n`
      csvContent += `番号,内容\n`
      data.recommendations.forEach((rec: string, index: number) => {
        csvContent += `${index + 1},"${rec}"\n`
      })
    }

    const encoder = new TextEncoder()
    const csvBytes = encoder.encode('\ufeff' + csvContent) // Add BOM for UTF-8

    return new NextResponse(csvBytes, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="report_${template}_${dateRange.start}_${dateRange.end}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV generation error:', error)
    return NextResponse.json({ error: 'Failed to generate CSV report' }, { status: 500 })
  }
}

async function generateExcelReport(data: any, template: string, dateRange: any) {
  try {
    // For Excel generation, we'll create a simplified version
    // In a real implementation, you would use a library like 'exceljs' or 'xlsx'
    
    const workbookData = {
      worksheets: [
        {
          name: 'サマリー',
          data: generateSummaryData(data)
        },
        {
          name: '企業ステータス',
          data: generateCompanyStatusData(data)
        },
        {
          name: '進捗メトリクス',
          data: generateProgressMetricsData(data)
        },
        {
          name: 'FAQ分析',
          data: generateFAQAnalysisData(data)
        },
        {
          name: 'メール活動',
          data: generateEmailActivityData(data)
        },
        {
          name: 'パフォーマンス',
          data: generatePerformanceData(data)
        }
      ]
    }

    // Convert to Excel format (simplified JSON representation)
    const excelContent = JSON.stringify(workbookData, null, 2)
    const encoder = new TextEncoder()
    const excelBytes = encoder.encode(excelContent)

    return new NextResponse(excelBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="report_${template}_${dateRange.start}_${dateRange.end}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Excel generation error:', error)
    return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 })
  }
}

async function generatePDFReport(data: any, template: string, dateRange: any) {
  try {
    // For PDF generation, we'll create an HTML version that can be converted to PDF
    // In a real implementation, you would use a library like 'puppeteer' or 'jsPDF'
    
    const htmlContent = generateHTMLReport(data, template, dateRange)
    
    const encoder = new TextEncoder()
    const htmlBytes = encoder.encode(htmlContent)

    return new NextResponse(htmlBytes, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="report_${template}_${dateRange.start}_${dateRange.end}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 })
  }
}

function generateHTMLReport(data: any, template: string, dateRange: any): string {
  const templateName = getTemplateName(template)
  const startDate = new Date(dateRange.start).toLocaleDateString('ja-JP')
  const endDate = new Date(dateRange.end).toLocaleDateString('ja-JP')
  const generatedDate = new Date().toLocaleString('ja-JP')

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName} - 労災二次健診システム</title>
    <style>
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1F2937;
            margin: 0;
            font-size: 2em;
        }
        .header .period {
            color: #6B7280;
            margin: 10px 0;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #1F2937;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #3B82F6;
        }
        .metric-label {
            color: #6B7280;
            font-size: 0.9em;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .data-table th,
        .data-table td {
            border: 1px solid #E5E7EB;
            padding: 8px 12px;
            text-align: left;
        }
        .data-table th {
            background-color: #F9FAFB;
            font-weight: bold;
        }
        .data-table tr:nth-child(even) {
            background-color: #F9FAFB;
        }
        .recommendations {
            background-color: #F0F9FF;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendation-item {
            margin-bottom: 10px;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
        }
        @media print {
            body {
                font-size: 12px;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${templateName}</h1>
        <div class="period">期間: ${startDate} - ${endDate}</div>
        <div class="generated">生成日時: ${generatedDate}</div>
    </div>

    ${data.executiveSummary ? `
    <div class="section">
        <h2>エグゼクティブサマリー</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.executiveSummary.totalCompanies}</div>
                <div class="metric-label">総企業数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.executiveSummary.activeCompanies}</div>
                <div class="metric-label">進行中案件</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.executiveSummary.conversionRate}%</div>
                <div class="metric-label">完了率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.executiveSummary.avgProcessingDays}日</div>
                <div class="metric-label">平均処理日数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">¥${(data.executiveSummary.revenueProjection / 1000000).toFixed(1)}M</div>
                <div class="metric-label">売上予測</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${data.companyStatus ? `
    <div class="section">
        <h2>企業ステータス概要</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
                <h3>フェーズ別分布</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>フェーズ</th>
                            <th>企業数</th>
                            <th>割合</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.companyStatus.byPhase || {}).map(([phase, count]) => {
                          const total = Object.values(data.companyStatus.byPhase).reduce((a: number, b: any) => a + b, 0)
                          const percentage = total > 0 ? Math.round((count as number / total) * 100) : 0
                          return `<tr>
                            <td>${phase}</td>
                            <td>${count}</td>
                            <td>${percentage}%</td>
                          </tr>`
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div>
                <h3>上位ステータス</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ステータス</th>
                            <th>企業数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(data.companyStatus.byStatus || {})
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 10)
                          .map(([status, count]) => `<tr>
                            <td>${status}</td>
                            <td>${count}</td>
                          </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    ` : ''}

    ${data.progressMetrics ? `
    <div class="section">
        <h2>進捗メトリクス</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.progressMetrics.completionRate}%</div>
                <div class="metric-label">完了率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.progressMetrics.onTimeDelivery}%</div>
                <div class="metric-label">時間内完了</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.progressMetrics.customerSatisfaction}</div>
                <div class="metric-label">顧客満足度</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.progressMetrics.errorRate}%</div>
                <div class="metric-label">エラー率</div>
            </div>
        </div>
        
        ${data.progressMetrics.trends ? `
        <h3>トレンド分析</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>指標</th>
                    <th>現在値</th>
                    <th>前回値</th>
                    <th>変化率</th>
                </tr>
            </thead>
            <tbody>
                ${data.progressMetrics.trends.map((trend: any) => `<tr>
                    <td>${trend.metric}</td>
                    <td>${trend.current}</td>
                    <td>${trend.previous}</td>
                    <td style="color: ${trend.change >= 0 ? '#10B981' : '#EF4444'}">
                        ${trend.change >= 0 ? '+' : ''}${trend.change}%
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>
    ` : ''}

    ${data.faqAnalysis ? `
    <div class="section">
        <h2>FAQ分析</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.faqAnalysis.totalFAQs}</div>
                <div class="metric-label">総FAQ数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.faqAnalysis.aiGeneratedRatio}%</div>
                <div class="metric-label">AI生成率</div>
            </div>
        </div>

        ${data.faqAnalysis.categoryDistribution ? `
        <h3>カテゴリ別分布</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>カテゴリ</th>
                    <th>件数</th>
                </tr>
            </thead>
            <tbody>
                ${data.faqAnalysis.categoryDistribution.map((item: any) => `<tr>
                    <td>${item.category}</td>
                    <td>${item.count}</td>
                </tr>`).join('')}
            </tbody>
        </table>
        ` : ''}

        ${data.faqAnalysis.topQuestions ? `
        <h3>よくある質問 TOP5</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>質問</th>
                    <th>頻度</th>
                    <th>カテゴリ</th>
                </tr>
            </thead>
            <tbody>
                ${data.faqAnalysis.topQuestions.slice(0, 5).map((faq: any) => `<tr>
                    <td style="max-width: 300px; word-wrap: break-word;">${faq.question}</td>
                    <td>${faq.frequency}</td>
                    <td>${faq.category}</td>
                </tr>`).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>
    ` : ''}

    ${data.emailActivity ? `
    <div class="section">
        <h2>メール活動サマリー</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${data.emailActivity.totalEmails}</div>
                <div class="metric-label">総メール数</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.emailActivity.processedEmails}</div>
                <div class="metric-label">処理済み</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.emailActivity.autoReplies}</div>
                <div class="metric-label">自動返信</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.emailActivity.averageResponseTime}h</div>
                <div class="metric-label">平均応答時間</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${data.performance ? `
    <div class="section">
        <h2>パフォーマンス指標</h2>
        
        ${data.performance.kpis ? `
        <h3>KPI達成状況</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>指標名</th>
                    <th>現在値</th>
                    <th>目標値</th>
                    <th>達成率</th>
                </tr>
            </thead>
            <tbody>
                ${data.performance.kpis.map((kpi: any) => {
                  const achievementRate = Math.round((kpi.value / kpi.target) * 100)
                  return `<tr>
                    <td>${kpi.name}</td>
                    <td>${kpi.value}${kpi.unit}</td>
                    <td>${kpi.target}${kpi.unit}</td>
                    <td style="color: ${achievementRate >= 100 ? '#10B981' : '#EF4444'}">
                        ${achievementRate}%
                    </td>
                  </tr>`
                }).join('')}
            </tbody>
        </table>
        ` : ''}

        ${data.performance.departmentMetrics ? `
        <h3>部門別メトリクス</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>部門</th>
                    <th>効率性</th>
                    <th>作業負荷</th>
                </tr>
            </thead>
            <tbody>
                ${data.performance.departmentMetrics.map((dept: any) => `<tr>
                    <td>${dept.department}</td>
                    <td>${dept.efficiency}%</td>
                    <td>${dept.workload}%</td>
                </tr>`).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>
    ` : ''}

    ${data.recommendations && data.recommendations.length > 0 ? `
    <div class="section">
        <h2>推奨アクション</h2>
        <div class="recommendations">
            ${data.recommendations.map((rec: string, index: number) => `
                <div class="recommendation-item">
                    <strong>推奨事項 ${index + 1}:</strong> ${rec}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section" style="text-align: center; margin-top: 50px; color: #6B7280;">
        <p>このレポートは労災二次健診進捗管理システムにより自動生成されました。</p>
        <p>生成日時: ${generatedDate}</p>
    </div>
</body>
</html>
  `
}

function generateSummaryData(data: any) {
  return [
    ['項目', '値'],
    ['総企業数', data.executiveSummary?.totalCompanies || 0],
    ['進行中案件', data.executiveSummary?.activeCompanies || 0],
    ['完了企業数', data.executiveSummary?.completedCompanies || 0],
    ['完了率', `${data.executiveSummary?.conversionRate || 0}%`],
    ['平均処理日数', `${data.executiveSummary?.avgProcessingDays || 0}日`],
    ['売上予測', `${data.executiveSummary?.revenueProjection || 0}円`]
  ]
}

function generateCompanyStatusData(data: any) {
  const phaseData = data.companyStatus?.byPhase || {}
  const statusData = data.companyStatus?.byStatus || {}
  
  return [
    ['フェーズ別分布'],
    ['フェーズ', '企業数'],
    ...Object.entries(phaseData).map(([phase, count]) => [phase, count]),
    [],
    ['ステータス別分布'],
    ['ステータス', '企業数'],
    ...Object.entries(statusData).map(([status, count]) => [status, count])
  ]
}

function generateProgressMetricsData(data: any) {
  const metrics = data.progressMetrics || {}
  return [
    ['進捗メトリクス'],
    ['指標', '値'],
    ['完了率', `${metrics.completionRate || 0}%`],
    ['時間内完了率', `${metrics.onTimeDelivery || 0}%`],
    ['顧客満足度', metrics.customerSatisfaction || 0],
    ['エラー率', `${metrics.errorRate || 0}%`]
  ]
}

function generateFAQAnalysisData(data: any) {
  const faq = data.faqAnalysis || {}
  return [
    ['FAQ分析'],
    ['項目', '値'],
    ['総FAQ数', faq.totalFAQs || 0],
    ['AI生成率', `${faq.aiGeneratedRatio || 0}%`],
    [],
    ['カテゴリ別分布'],
    ['カテゴリ', '件数'],
    ...(faq.categoryDistribution || []).map((item: any) => [item.category, item.count])
  ]
}

function generateEmailActivityData(data: any) {
  const email = data.emailActivity || {}
  return [
    ['メール活動'],
    ['指標', '値'],
    ['総メール数', email.totalEmails || 0],
    ['処理済みメール数', email.processedEmails || 0],
    ['自動返信数', email.autoReplies || 0],
    ['平均応答時間', `${email.averageResponseTime || 0}時間`]
  ]
}

function generatePerformanceData(data: any) {
  const performance = data.performance || {}
  return [
    ['パフォーマンス指標'],
    ['KPI', '現在値', '目標値', '達成率'],
    ...(performance.kpis || []).map((kpi: any) => [
      kpi.name,
      `${kpi.value}${kpi.unit}`,
      `${kpi.target}${kpi.unit}`,
      `${Math.round((kpi.value / kpi.target) * 100)}%`
    ]),
    [],
    ['部門別メトリクス'],
    ['部門', '効率性', '作業負荷'],
    ...(performance.departmentMetrics || []).map((dept: any) => [
      dept.department,
      `${dept.efficiency}%`,
      `${dept.workload}%`
    ])
  ]
}

function getTemplateName(template: string): string {
  const templates: Record<string, string> = {
    'monthly': '月次レポート',
    'quarterly': '四半期レポート',
    'annual': '年次レポート',
    'custom': 'カスタムレポート'
  }
  return templates[template] || 'レポート'
}