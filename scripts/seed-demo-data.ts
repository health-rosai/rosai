#!/usr/bin/env ts-node

/**
 * デモデータ生成スクリプト
 * 使用方法: npx ts-node scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker/locale/ja'

// Supabase接続設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

const supabase = createClient(supabaseUrl, supabaseKey)

// 企業名リスト
const COMPANY_NAMES = [
  '株式会社山田製作所',
  '田中建設株式会社',
  '佐藤運輸有限会社',
  '鈴木電機工業株式会社',
  '高橋商事株式会社',
  '渡辺フーズ株式会社',
  '伊藤化学工業株式会社',
  '山本物流センター',
  '中村製薬株式会社',
  '小林精密機器株式会社',
  '加藤建材株式会社',
  '吉田自動車工業',
  '山崎食品加工株式会社',
  '森田電子部品株式会社',
  '松本建築設計事務所',
  '井上印刷株式会社',
  '木村繊維工業株式会社',
  '清水環境サービス',
  '斎藤重工業株式会社',
  '藤田商会'
]

// 業種リスト
const INDUSTRIES = [
  '製造業',
  '建設業',
  '運輸業',
  '小売業',
  '食品加工業',
  '化学工業',
  '電気機器',
  '精密機器',
  '印刷業',
  '繊維工業'
]

// ステータスリスト（26段階）
const STATUS_LIST = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '99A', '99D'
]

// メールテンプレート
const EMAIL_SUBJECTS = [
  '労災二次健診について',
  '二次検診日程につきまして',
  '健診費用のお問い合わせ',
  '対象者リストの確認',
  '契約書類について',
  '保健指導の実施について',
  '請求書の送付先変更',
  '健診結果の受領確認',
  '次年度の契約更新について',
  'キャンセルのご連絡'
]

const EMAIL_BODIES = [
  `お世話になっております。
労災二次健診の対象者について確認させていただきたく、ご連絡いたしました。
弊社の従業員で対象となる者は何名程度になりますでしょうか。
また、費用についても教えていただければ幸いです。
よろしくお願いいたします。`,
  
  `いつもお世話になっております。
二次健診の日程調整についてご相談があります。
来月中に実施を希望しておりますが、可能でしょうか。
対象者は約15名です。
ご確認のほど、よろしくお願いいたします。`,
  
  `お世話になっております。
契約書類を拝受いたしました。
内容を確認させていただき、問題ございません。
押印の上、明日返送させていただきます。
今後ともよろしくお願いいたします。`,
  
  `健診結果を受領いたしました。
迅速な対応をいただき、ありがとうございます。
保健指導についても実施をお願いしたく存じます。
日程調整についてご相談させてください。`,
  
  `請求書の送付先を変更したく、ご連絡いたしました。
新しい住所は以下の通りです。
〒100-0000 東京都千代田区〇〇1-2-3
ご対応のほど、よろしくお願いいたします。`
]

// FAQ質問と回答
const FAQ_DATA = [
  {
    question: '労災二次健診の対象者の条件を教えてください。',
    answer: '定期健康診断で、①血圧、②血中脂質、③血糖、④腹囲またはBMIの4項目すべてに異常所見があった労働者が対象となります。',
    category: '対象者'
  },
  {
    question: '二次健診の費用負担はどうなりますか？',
    answer: '労災保険から全額給付されるため、労働者の自己負担はありません。事業主の負担もございません。',
    category: '費用'
  },
  {
    question: '二次健診を受診できる期限はありますか？',
    answer: '一次健診（定期健康診断）の結果通知から3ヶ月以内に受診する必要があります。期限を過ぎると労災保険の給付を受けられません。',
    category: '期限'
  },
  {
    question: '二次健診ではどのような検査を行いますか？',
    answer: '空腹時血糖値、HbA1c検査、血中脂質検査、負荷心電図、頸部エコー検査、微量アルブミン尿検査などを実施します。',
    category: '検査内容'
  },
  {
    question: '保健指導は必ず受ける必要がありますか？',
    answer: '二次健診の結果、脳・心臓疾患のリスクが高いと判断された場合は、医師または保健師による保健指導を受ける必要があります。',
    category: '保健指導'
  },
  {
    question: '指定医療機関はどこで確認できますか？',
    answer: '労働局のホームページまたは当センターにお問い合わせください。最寄りの指定医療機関をご案内いたします。',
    category: '医療機関'
  },
  {
    question: '二次健診の結果はいつ頃わかりますか？',
    answer: '通常、受診から2週間程度で結果が通知されます。医療機関により多少前後する場合があります。',
    category: '結果通知'
  },
  {
    question: '従業員が二次健診を拒否した場合はどうなりますか？',
    answer: '受診は任意ですが、健康管理の観点から受診を推奨してください。受診しない場合でも罰則はありません。',
    category: '受診義務'
  },
  {
    question: '年度途中の入社者も対象になりますか？',
    answer: '定期健康診断を受診し、4項目すべてに異常所見があれば対象となります。入社時期は問いません。',
    category: '対象者'
  },
  {
    question: '申請書類はどこで入手できますか？',
    answer: '当センターからお送りするか、労働局のホームページからダウンロードできます。記入方法もサポートいたします。',
    category: '手続き'
  }
]

async function seedDemoData() {
  console.log('🚀 デモデータ生成開始...')

  try {
    // 1. プロファイル作成
    console.log('📝 プロファイル作成中...')
    const profiles = []
    for (let i = 0; i < 5; i++) {
      const profile = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        full_name: faker.person.fullName(),
        role: ['admin', 'manager', 'operator', 'viewer'][Math.floor(Math.random() * 4)],
        department: ['営業部', '管理部', 'サポート部', '経理部'][Math.floor(Math.random() * 4)],
        created_at: faker.date.past()
      }
      profiles.push(profile)
    }

    // 2. 企業データ作成
    console.log('🏢 企業データ作成中...')
    const companies = []
    for (let i = 0; i < 20; i++) {
      const company = {
        id: faker.string.uuid(),
        name: COMPANY_NAMES[i],
        employee_count: faker.number.int({ min: 10, max: 500 }),
        industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
        contact_person: faker.person.fullName(),
        contact_email: faker.internet.email(),
        contact_phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        current_status: STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)],
        status_changed_at: faker.date.recent(),
        priority: faker.number.int({ min: 1, max: 5 }),
        is_active: Math.random() > 0.1,
        notes: faker.lorem.sentence(),
        created_at: faker.date.past()
      }
      companies.push(company)
    }

    // 3. ステータス履歴作成
    console.log('📊 ステータス履歴作成中...')
    const statusHistories: any[] = []
    companies.forEach(company => {
      for (let i = 0; i < faker.number.int({ min: 2, max: 8 }); i++) {
        const history = {
          id: faker.string.uuid(),
          company_id: company.id,
          from_status: STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)],
          to_status: STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)],
          reason: faker.lorem.sentence(),
          created_at: faker.date.past()
        }
        statusHistories.push(history)
      }
    })

    // 4. メールデータ作成
    console.log('📧 メールデータ作成中...')
    const emails: any[] = []
    companies.forEach(company => {
      for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
        const email = {
          id: faker.string.uuid(),
          gmail_message_id: faker.string.uuid(),
          thread_id: faker.string.uuid(),
          subject: EMAIL_SUBJECTS[Math.floor(Math.random() * EMAIL_SUBJECTS.length)],
          from_email: company.contact_email,
          to_email: 'health@ronshoal.com',
          body_text: EMAIL_BODIES[Math.floor(Math.random() * EMAIL_BODIES.length)],
          received_at: faker.date.recent(),
          company_id: company.id,
          is_processed: Math.random() > 0.3,
          ai_processed: Math.random() > 0.5,
          created_at: faker.date.recent()
        }
        emails.push(email)
      }
    })

    // 5. FAQ作成
    console.log('❓ FAQ作成中...')
    const faqs = FAQ_DATA.map(faq => ({
      id: faker.string.uuid(),
      ...faq,
      tags: faker.lorem.words(3).split(' '),
      view_count: faker.number.int({ min: 10, max: 500 }),
      helpful_count: faker.number.int({ min: 5, max: 300 }),
      is_published: Math.random() > 0.2,
      ai_generated: Math.random() > 0.5,
      frequency_score: Math.random(),
      confidence: Math.random(),
      created_at: faker.date.past()
    }))

    // 6. 活動ログ作成
    console.log('📝 活動ログ作成中...')
    const activityLogs = []
    for (let i = 0; i < 50; i++) {
      const log = {
        id: faker.string.uuid(),
        action: ['login', 'view', 'create', 'update', 'delete'][Math.floor(Math.random() * 5)],
        resource_type: ['company', 'email', 'faq', 'report'][Math.floor(Math.random() * 4)],
        resource_id: faker.string.uuid(),
        details: { message: faker.lorem.sentence() },
        created_at: faker.date.recent()
      }
      activityLogs.push(log)
    }

    // データ出力（実際のDBへの挿入の代わり）
    const demoData = {
      profiles,
      companies,
      statusHistories,
      emails,
      faqs,
      activityLogs
    }

    // デモデータをJSONファイルとして保存
    const fs = require('fs')
    const path = require('path')
    const outputPath = path.join(__dirname, 'demo-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(demoData, null, 2))

    console.log('✅ デモデータ生成完了！')
    console.log(`📁 データ保存先: ${outputPath}`)
    console.log('📊 生成データ統計:')
    console.log(`  - プロファイル: ${profiles.length}件`)
    console.log(`  - 企業: ${companies.length}件`)
    console.log(`  - ステータス履歴: ${statusHistories.length}件`)
    console.log(`  - メール: ${emails.length}件`)
    console.log(`  - FAQ: ${faqs.length}件`)
    console.log(`  - 活動ログ: ${activityLogs.length}件`)

    // Supabase接続可能な場合のコード（コメントアウト）
    /*
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      console.log('🔄 Supabaseへデータ挿入中...')
      
      const { error: profileError } = await supabase.from('profiles').insert(profiles)
      if (profileError) console.error('Profile error:', profileError)
      
      const { error: companyError } = await supabase.from('companies').insert(companies)
      if (companyError) console.error('Company error:', companyError)
      
      const { error: historyError } = await supabase.from('status_histories').insert(statusHistories)
      if (historyError) console.error('History error:', historyError)
      
      const { error: emailError } = await supabase.from('emails').insert(emails)
      if (emailError) console.error('Email error:', emailError)
      
      const { error: faqError } = await supabase.from('faqs').insert(faqs)
      if (faqError) console.error('FAQ error:', faqError)
      
      const { error: logError } = await supabase.from('activity_logs').insert(activityLogs)
      if (logError) console.error('Log error:', logError)
      
      console.log('✅ Supabaseへのデータ挿入完了！')
    }
    */

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// メイン実行
if (require.main === module) {
  seedDemoData()
}

export { seedDemoData }