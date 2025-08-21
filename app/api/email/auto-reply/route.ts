import { NextRequest, NextResponse } from 'next/server'
import { analyzeEmailWithAI } from '@/lib/gemini/email-analyzer'
import { Company, STATUS_DEFINITIONS } from '@/types/database'

// テンプレート定義
const REPLY_TEMPLATES = {
  // ステータス別テンプレート
  '01': {
    subject: 'Re: {{original_subject}} - 労災二次健診サービスのご案内',
    body: `{{company_name}} 様

お問い合わせいただきありがとうございます。
労災二次健診サポートセンターです。

貴社の従業員様の健康管理をサポートさせていただく機会をいただき、
誠にありがとうございます。

労災二次健診は、定期健康診断で異常所見があった従業員様を対象に、
脳・心臓疾患の予防を目的として実施される重要な健診です。

【サービスの特徴】
• 労災保険から全額給付（自己負担なし）
• 指定医療機関での専門的な検査
• 保健指導による生活習慣の改善サポート
• 企業様の健康経営をトータルサポート

担当者より改めてご連絡させていただきますので、
今しばらくお待ちください。

何かご不明な点がございましたら、
お気軽にお問い合わせください。

---
労災二次健診サポートセンター
TEL: 03-XXXX-XXXX
Email: health@ronshoal.com
営業時間: 平日 9:00-18:00`
  },
  '06': {
    subject: 'Re: {{original_subject}} - 契約手続きのご案内',
    body: `{{company_name}} 様

いつもお世話になっております。
労災二次健診サポートセンターです。

契約手続きに関するご連絡をいただき、
ありがとうございます。

【次のステップ】
1. 契約書類の準備
2. 必要事項のご記入
3. 押印・返送
4. サービス開始

契約書類は本日中に発送予定です。
到着まで2-3営業日お待ちください。

ご不明な点がございましたら、
担当者までお気軽にご連絡ください。

---
労災二次健診サポートセンター
担当: {{agent_name}}
Email: health@ronshoal.com`
  },
  '14': {
    subject: 'Re: {{original_subject}} - 健診日程の調整について',
    body: `{{company_name}} 様

お世話になっております。
労災二次健診サポートセンターです。

健診日程についてご連絡いただき、
ありがとうございます。

【健診実施の流れ】
1. 対象者リストの確認
2. 医療機関の選定
3. 日程調整
4. 受診票の送付
5. 健診実施

現在、{{suggested_date}}での実施を検討しております。
詳細は担当者より改めてご連絡いたします。

対象者の皆様がスムーズに受診できるよう、
全力でサポートさせていただきます。

---
労災二次健診サポートセンター
健診調整担当
Email: health@ronshoal.com`
  },
  // 意図別テンプレート
  inquiry: {
    subject: 'Re: {{original_subject}} - お問い合わせありがとうございます',
    body: `{{company_name}} 様

お問い合わせいただきありがとうございます。
労災二次健診サポートセンターです。

{{inquiry_content}}

担当者より1営業日以内にご連絡させていただきます。

お急ぎの場合は、お電話でもお問い合わせを承っております。
TEL: 03-XXXX-XXXX（平日 9:00-18:00）

今後ともよろしくお願いいたします。

---
労災二次健診サポートセンター
カスタマーサポート`
  },
  acceptance: {
    subject: 'Re: {{original_subject}} - ご承諾ありがとうございます',
    body: `{{company_name}} 様

この度はご承諾いただき、誠にありがとうございます。

{{next_action}}

今後の流れについて、担当者より詳しくご案内させていただきます。

ご不明な点がございましたら、いつでもお問い合わせください。

---
労災二次健診サポートセンター`
  },
  rejection: {
    subject: 'Re: {{original_subject}} - ご連絡ありがとうございました',
    body: `{{company_name}} 様

ご連絡いただきありがとうございました。

承知いたしました。
また機会がございましたら、ぜひご検討ください。

従業員様の健康管理に関するご相談は、
いつでもお気軽にお問い合わせください。

今後ともよろしくお願いいたします。

---
労災二次健診サポートセンター`
  }
}

interface AutoReplyRequest {
  email: {
    subject: string
    body: string
    from: string
  }
  company: Company
  manual_override?: {
    template?: string
    custom_message?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, company, manual_override } = await request.json() as AutoReplyRequest

    // AI分析を実行
    const analysis = await analyzeEmailWithAI({
      subject: email.subject,
      body: email.body,
      from: email.from,
      company
    })

    // テンプレート選択
    let template
    if (manual_override?.template) {
      template = REPLY_TEMPLATES[manual_override.template as keyof typeof REPLY_TEMPLATES]
    } else if (REPLY_TEMPLATES[company.current_status as keyof typeof REPLY_TEMPLATES]) {
      template = REPLY_TEMPLATES[company.current_status as keyof typeof REPLY_TEMPLATES]
    } else if (REPLY_TEMPLATES[analysis.intent]) {
      template = REPLY_TEMPLATES[analysis.intent as keyof typeof REPLY_TEMPLATES]
    } else {
      template = REPLY_TEMPLATES.inquiry
    }

    // プレースホルダー置換
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{{company_name}}/g, company.name)
        .replace(/{{original_subject}}/g, email.subject.replace(/^(Re: |RE: |Fwd: )+/i, ''))
        .replace(/{{agent_name}}/g, '山田 太郎') // デモ用
        .replace(/{{suggested_date}}/g, '来月中旬')
        .replace(/{{inquiry_content}}/g, analysis.reasoning || 'お問い合わせ内容を確認いたしました。')
        .replace(/{{next_action}}/g, analysis.action_items?.[0] || '次のステップについてご案内いたします。')
    }

    const replySubject = replacePlaceholders(template.subject)
    let replyBody = replacePlaceholders(template.body)

    // カスタムメッセージの追加
    if (manual_override?.custom_message) {
      replyBody = manual_override.custom_message + '\n\n' + replyBody
    }

    // AI生成の返信を追加（オプション）
    if (analysis.auto_reply && !manual_override?.custom_message) {
      replyBody = analysis.auto_reply + '\n\n---\n\n' + replyBody
    }

    // 関連FAQの追加
    const relatedFAQs = await getRelatedFAQs(company.current_status)
    if (relatedFAQs.length > 0) {
      replyBody += '\n\n【よくあるご質問】\n'
      relatedFAQs.forEach(faq => {
        replyBody += `\nQ: ${faq.question}\nA: ${faq.answer}\n`
      })
      replyBody += '\nその他のFAQはこちら: https://example.com/faq'
    }

    // 返信データの構築
    const reply = {
      to: email.from,
      subject: replySubject,
      body: replyBody,
      cc: [],
      bcc: ['archive@ronshoal.com'], // アーカイブ用
      attachments: [],
      metadata: {
        original_email_subject: email.subject,
        company_id: company.id,
        company_status: company.current_status,
        ai_analysis: analysis,
        template_used: template,
        generated_at: new Date().toISOString()
      }
    }

    // 実際の送信処理（Gmail API使用）
    // await sendEmailViaGmail(reply)

    return NextResponse.json({
      success: true,
      reply,
      analysis,
      message: 'Auto-reply generated successfully'
    })

  } catch (error) {
    console.error('Auto-reply error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auto-reply', details: error },
      { status: 500 }
    )
  }
}

// 関連FAQを取得（デモ用）
async function getRelatedFAQs(status: string): Promise<any[]> {
  const demoFAQs = [
    {
      question: '労災二次健診の対象者は誰ですか？',
      answer: '定期健康診断で血圧、血中脂質、血糖、腹囲の4項目すべてに異常所見があった労働者が対象です。'
    },
    {
      question: '費用はかかりますか？',
      answer: '労災保険から給付されるため、労働者・事業主ともに負担はありません。'
    },
    {
      question: 'いつまでに受診する必要がありますか？',
      answer: '一次健診の結果通知から3ヶ月以内に受診する必要があります。'
    }
  ]
  
  // ステータスに応じて関連するFAQを返す
  if (status.startsWith('01') || status.startsWith('02')) {
    return demoFAQs
  } else if (status.startsWith('14') || status.startsWith('15')) {
    return [demoFAQs[2]] // 期限に関するFAQのみ
  } else {
    return [demoFAQs[1]] // 費用に関するFAQのみ
  }
}

// プレビュー用エンドポイント
export async function GET(request: NextRequest) {
  const templates = Object.entries(REPLY_TEMPLATES).map(([key, template]) => ({
    key,
    subject: template.subject,
    preview: template.body.substring(0, 200) + '...'
  }))

  return NextResponse.json({
    templates,
    placeholders: [
      '{{company_name}} - 企業名',
      '{{original_subject}} - 元のメール件名',
      '{{agent_name}} - 担当者名',
      '{{suggested_date}} - 提案日程',
      '{{inquiry_content}} - 問い合わせ内容',
      '{{next_action}} - 次のアクション'
    ]
  })
}