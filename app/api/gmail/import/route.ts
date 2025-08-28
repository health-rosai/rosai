import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailClient } from '@/lib/gmail/client'
import { analyzeEmailWithAI } from '@/lib/gemini/email-analyzer'
import { FAQGenerator } from '@/lib/faq/generator'

export async function POST(request: NextRequest) {
  try {
    // Supabaseが設定されていない場合はダミーモードで動作
    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    
    if (!isDemoMode) {
      const supabase = await createClient()
      // 認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Gmail クライアント初期化
    const gmailClient = new GmailClient()
    
    // 労災関連メールを取得
    console.log('Fetching emails from health@ronshoal.com...')
    const emails = await gmailClient.fetchRousaiEmails(100) // 最初は100件に制限
    console.log(`Found ${emails.length} rousai-related emails`)

    // デフォルト企業情報（デモモード用）
    const defaultCompany = {
      id: 'default-import',
      name: '一般問い合わせ',
      current_status: '01' as const,
      contact_email: 'health@ronshoal.com',
      status_changed_at: new Date().toISOString()
    }

    const importedEmails = []
    const faqCandidates = []
    const generatedFAQs: any[] = []

    // 各メールを処理
    for (const email of emails.slice(0, 10)) { // 最初の10件のみ処理（デモ用）
      console.log(`Processing email: ${email.subject}`)
      
      // AI分析
      const analysis = await analyzeEmailWithAI({
        subject: email.subject,
        body: email.body,
        from: email.from,
        company: defaultCompany as any
      })

      // デモモードではメモリに保存
      const savedEmail = {
        id: email.id,
        gmail_message_id: email.id,
        thread_id: email.threadId,
        subject: email.subject,
        from_email: email.from,
        to_email: email.to,
        body_text: email.body,
        body_snippet: email.snippet,
        received_at: new Date(email.date).toISOString(),
        company_id: defaultCompany.id,
        ai_analysis: analysis,
        ai_processed: true,
        faq_candidate: analysis.faq_candidate
      }

      importedEmails.push(savedEmail)

      // FAQ候補を収集（メールから自動生成）
      if (email.subject.includes('健診') || email.subject.includes('労災') || email.subject.includes('検診')) {
        const faqCandidate = {
          question: `${email.subject.replace(/Re: |RE: |Fwd: /g, '')}について教えてください`,
          category: email.subject.includes('日程') ? '日程' : 
                     email.subject.includes('費用') ? '費用' : 
                     email.subject.includes('契約') ? '契約' : '健診',
          frequency_score: 0.8,
          email_id: savedEmail.id
        }
        faqCandidates.push(faqCandidate)
      }
    }

    // デモ用FAQ生成（実際のDBは使用しない）
    if (faqCandidates.length > 0) {
      // FAQサンプルを生成
      generatedFAQs.push(
        {
          question: "労災二次健診の対象者は誰ですか？",
          answer: "定期健康診断で血圧、血中脂質、血糖、腹囲の4項目すべてに異常所見があった労働者が対象です。",
          category: "対象者",
          frequency_score: 0.95
        },
        {
          question: "二次健診の費用は誰が負担しますか？",
          answer: "労災保険から給付されるため、労働者の自己負担はありません。事業主の負担もありません。",
          category: "費用",
          frequency_score: 0.92
        },
        {
          question: "二次健診はいつまでに受診する必要がありますか？",
          answer: "一次健診の結果通知から3ヶ月以内に受診する必要があります。",
          category: "期限",
          frequency_score: 0.88
        }
      )
    }

    return NextResponse.json({
      success: true,
      imported_count: importedEmails.length,
      faq_candidates_count: faqCandidates.length,
      faqs_generated: generatedFAQs.length,
      sample_faqs: generatedFAQs.slice(0, 5)
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import emails', details: error },
      { status: 500 }
    )
  }
}

// Gmail認証用のコールバック
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  if (!code) {
    // 認証URLを生成
    console.log('Generating auth URL...')
    console.log('Environment variables:', {
      clientId: process.env.GMAIL_CLIENT_ID ? 'present' : 'missing',
      clientSecret: process.env.GMAIL_CLIENT_SECRET ? 'present' : 'missing',
      redirectUri: process.env.GMAIL_REDIRECT_URI
    })
    
    const gmailClient = new GmailClient()
    const authUrl = gmailClient.generateAuthUrl()
    console.log('Generated auth URL:', authUrl)
    
    return NextResponse.json({ authUrl })
  }

  // 認証コードからトークンを取得
  try {
    console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...')
    const gmailClient = new GmailClient()
    const tokens = await gmailClient.getToken(code)
    
    // トークンを環境変数に保存する指示を返す
    return NextResponse.json({
      success: true,
      message: 'Authentication successful! Please add the following to your .env.local:',
      refresh_token: tokens.refresh_token,
      instructions: `GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate', details: error.message || error },
      { status: 500 }
    )
  }
}