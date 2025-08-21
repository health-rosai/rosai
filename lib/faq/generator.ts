import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || 'placeholder')

interface GeneratedFAQ {
  question: string
  answer: string
  category: string
  related_status: string[]
  frequency_score: number
  confidence: number
  source_count: number
}

export class FAQGenerator {
  private readonly THRESHOLD = 100 // FAQ生成の閾値
  private supabase: any

  constructor() {
    this.init()
  }

  private async init() {
    this.supabase = await createClient()
  }

  async checkAndGenerate(): Promise<void> {
    const unprocessedCount = await this.getUnprocessedFAQCandidates()
    
    if (unprocessedCount >= this.THRESHOLD) {
      await this.generateFAQs()
    }
  }

  private async getUnprocessedFAQCandidates(): Promise<number> {
    const { count } = await this.supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .not('faq_candidate', 'is', null)
      .eq('ai_processed', true)

    return count || 0
  }

  async generateFAQs(): Promise<GeneratedFAQ[]> {
    try {
      // ジョブを作成
      const { data: job } = await this.supabase
        .from('faq_generation_jobs')
        .insert({
          status: 'processing',
          trigger_type: 'threshold',
          email_count_threshold: this.THRESHOLD,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      // メールデータ収集
      const emails = await this.collectEmails()
      
      // AI生成（APIキーが設定されていない場合はスキップ）
      if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'placeholder') {
        await this.supabase
          .from('faq_generation_jobs')
          .update({
            status: 'failed',
            error_message: 'Gemini APIキーが設定されていません',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id)
        
        return []
      }

      const faqs = await this.generateWithAI(emails)
      
      // DB保存
      await this.saveFAQs(faqs)

      // ジョブを完了
      await this.supabase
        .from('faq_generation_jobs')
        .update({
          status: 'completed',
          emails_analyzed: emails.length,
          faqs_generated: faqs.length,
          generation_result: { faqs },
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      return faqs
    } catch (error) {
      console.error('FAQ generation error:', error)
      return []
    }
  }

  private async collectEmails(): Promise<any[]> {
    const { data } = await this.supabase
      .from('emails')
      .select('*')
      .not('faq_candidate', 'is', null)
      .limit(this.THRESHOLD)

    return data || []
  }

  private async generateWithAI(emails: any[]): Promise<GeneratedFAQ[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const emailsData = emails.map(e => ({
      subject: e.subject,
      body: e.body_text,
      faq_candidate: e.faq_candidate
    }))

    const prompt = `
## タスク
蓄積されたメールデータから、顧客向けFAQを自動生成してください。

## 入力データ
${JSON.stringify(emailsData, null, 2)}

## 生成指示
1. よくある質問を抽出（最低10件）
2. カテゴリ別に分類
3. 頻度スコアを計算
4. 回答文を生成（正確で分かりやすい日本語）
5. 関連するステータスコードを紐付け

## カテゴリ定義
- 契約: 契約手続き、必要書類、費用など
- 請求: 請求書、支払い、金額など
- 健診: 健診内容、必要な準備、結果受領など
- 判定: 判定基準、結果通知、保健指導など
- サービス全般: サービス内容、流れ、期間など

## 出力形式（JSON）
{
  "faqs": [
    {
      "question": "質問文",
      "answer": "回答文",
      "category": "カテゴリ",
      "related_status": ["関連ステータスコード"],
      "frequency_score": 0.95,
      "confidence": 0.9,
      "source_count": 45
    }
  ]
}
`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const { faqs } = JSON.parse(jsonMatch[0])
        return faqs
      }
    } catch (error) {
      console.error('AI FAQ generation error:', error)
    }

    return []
  }

  private async saveFAQs(faqs: GeneratedFAQ[]): Promise<void> {
    if (faqs.length === 0) return

    const faqsToInsert = faqs.map(faq => ({
      ...faq,
      status: 'draft',
      ai_generated: true,
      generation_metadata: {
        generated_at: new Date().toISOString(),
        model: 'gemini-1.5-flash'
      }
    }))

    await this.supabase
      .from('faqs')
      .insert(faqsToInsert)
  }
}

// FAQ活用
export class FAQIntegration {
  private supabase: any

  constructor() {
    this.init()
  }

  private async init() {
    this.supabase = await createClient()
  }

  async enhanceAutoReply(originalReply: string, companyStatus: string): Promise<string> {
    const relevantFAQs = await this.getRelevantFAQs(companyStatus)
    
    if (relevantFAQs.length === 0) {
      return originalReply
    }

    return `${originalReply}

よくあるご質問：
${relevantFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

その他のご質問はこちら: ${process.env.NEXT_PUBLIC_APP_URL}/faq`
  }

  private async getRelevantFAQs(status: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .contains('related_status', [status])
      .order('frequency_score', { ascending: false })
      .limit(3)

    return data || []
  }
}