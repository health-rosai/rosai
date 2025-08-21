import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeEmailWithAI } from '@/lib/gemini/email-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Gmail Webhookからのデータを処理
    const { message } = body
    
    if (!message || !message.data) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    // Base64デコード
    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8')
    const emailData = JSON.parse(decodedData)

    // メールをデータベースに保存
    const { data: savedEmail, error: saveError } = await supabase
      .from('emails')
      .insert({
        gmail_id: emailData.id,
        thread_id: emailData.threadId,
        from_email: emailData.from,
        to_emails: emailData.to,
        cc_emails: emailData.cc,
        subject: emailData.subject,
        body_text: emailData.bodyText,
        body_html: emailData.bodyHtml,
        received_at: emailData.receivedAt,
        attachments: emailData.attachments || []
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving email:', saveError)
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    // 企業を特定
    const companyEmail = emailData.from.toLowerCase()
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .or(`contact_email.ilike.%${companyEmail}%,cc_emails.cs.{${companyEmail}}`)
      .single()

    if (company) {
      // AI分析を実行
      const aiAnalysis = await analyzeEmailWithAI({
        subject: emailData.subject,
        body: emailData.bodyText,
        from: emailData.from,
        company: company
      })

      // AI分析結果を保存
      await supabase
        .from('emails')
        .update({
          company_id: company.id,
          ai_processed: true,
          ai_analysis: aiAnalysis,
          ai_suggested_status: aiAnalysis.suggested_status,
          ai_confidence: aiAnalysis.confidence,
          ai_auto_reply: aiAnalysis.auto_reply,
          ai_processed_at: new Date().toISOString(),
          faq_candidate: aiAnalysis.faq_candidate
        })
        .eq('id', savedEmail.id)

      // 高確信度の場合、自動でステータス更新
      if (aiAnalysis.confidence > 0.8 && aiAnalysis.suggested_status) {
        await supabase
          .from('companies')
          .update({
            current_status: aiAnalysis.suggested_status,
            status_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', company.id)

        // ステータス履歴を記録
        await supabase
          .from('status_histories')
          .insert({
            company_id: company.id,
            from_status: company.current_status,
            to_status: aiAnalysis.suggested_status,
            change_reason: `自動更新: ${aiAnalysis.reasoning}`
          })
      }

      // 緊急フラグがある場合はアラート作成
      if (aiAnalysis.urgent) {
        await supabase
          .from('alerts')
          .insert({
            company_id: company.id,
            type: 'custom',
            severity: 'high',
            title: '緊急対応が必要なメール',
            description: `${emailData.subject} - 要確認`
          })
      }
    }

    return NextResponse.json({ success: true, emailId: savedEmail.id })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}