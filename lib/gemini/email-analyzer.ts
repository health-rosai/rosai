import { GoogleGenerativeAI } from '@google/generative-ai'
import { Company, STATUS_DEFINITIONS } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || 'placeholder')

interface EmailAnalysisInput {
  subject: string
  body: string
  from: string
  company: Company
}

interface EmailAnalysisResult {
  intent: 'inquiry' | 'acceptance' | 'rejection' | 'confirmation' | 'other'
  suggested_status?: string
  confidence: number
  reasoning: string
  action_items: string[]
  auto_reply: string
  urgent: boolean
  requires_human_review: boolean
  faq_candidate?: {
    question: string
    category: string
    frequency_score: number
  }
}

export async function analyzeEmailWithAI(input: EmailAnalysisInput): Promise<EmailAnalysisResult> {
  // Gemini APIキーが設定されていない場合はダミーレスポンスを返す
  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'placeholder') {
    return {
      intent: 'other',
      confidence: 0.5,
      reasoning: 'AI分析は利用できません（APIキー未設定）',
      action_items: ['手動で確認してください'],
      auto_reply: generateDefaultReply(input),
      urgent: false,
      requires_human_review: true
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
## タスク
労災二次健診の業務メールを分析し、適切な次のアクションを提案してください。

## 現在の状態
- 企業名: ${input.company.name}
- 現在のステータス: ${input.company.current_status} - ${STATUS_DEFINITIONS[input.company.current_status]?.name}
- 前回の更新: ${input.company.status_changed_at}

## メール内容
差出人: ${input.from}
件名: ${input.subject}
本文:
${input.body}

## 分析指示
1. メールの意図を判定（問い合わせ/承諾/拒否/確認/その他）
2. 次の適切なステータスを提案
3. 必要なアクションアイテムをリスト化
4. 自動返信文を生成（丁寧なビジネス日本語で）
5. FAQ候補として抽出すべき質問があれば記録

## 特別な判定ルール
- "契約を進めたい" → ステータス06へ
- "検討中" → 現状維持
- "キャンセル" → 99A:保留へ
- 請求書の問題言及 → 99D:請求エラーへ
- 訪問日程の調整 → ステータス14または15へ

## 出力形式（JSON）
{
  "intent": "inquiry|acceptance|rejection|confirmation|other",
  "suggested_status": "ステータスコード",
  "confidence": 0.0-1.0,
  "reasoning": "判定理由の詳細説明",
  "action_items": ["アクション1", "アクション2"],
  "auto_reply": "自動返信文",
  "urgent": true/false,
  "requires_human_review": true/false,
  "faq_candidate": {
    "question": "抽出された質問",
    "category": "契約|請求|健診|判定|その他",
    "frequency_score": 0.0-1.0
  }
}
`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // JSONを抽出して解析
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]) as EmailAnalysisResult
      return analysis
    }

    throw new Error('Failed to parse AI response')
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      intent: 'other',
      confidence: 0.5,
      reasoning: 'AI分析中にエラーが発生しました',
      action_items: ['手動で確認してください'],
      auto_reply: generateDefaultReply(input),
      urgent: false,
      requires_human_review: true
    }
  }
}

function generateDefaultReply(input: EmailAnalysisInput): string {
  return `${input.company.name} 様

お世話になっております。
労災二次健診サポートセンターです。

お問い合わせいただきました件について、
確認の上、改めてご連絡させていただきます。

何かご不明な点がございましたら、
お気軽にお問い合わせください。

よろしくお願いいたします。

---
労災二次健診サポートセンター
support@example.com`
}