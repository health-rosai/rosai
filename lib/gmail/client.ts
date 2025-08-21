import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export class GmailClient {
  private oauth2Client: OAuth2Client
  private gmail: any

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    )

    // 保存されたトークンを設定
    if (process.env.GMAIL_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      })
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  // 認証URLを生成
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    })
  }

  // 認証コードからトークンを取得
  async getToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)
    return tokens
  }

  // メールリストを取得
  async listMessages(query: string, maxResults: number = 500) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      })
      return response.data.messages || []
    } catch (error) {
      console.error('Error listing messages:', error)
      return []
    }
  }

  // メール詳細を取得
  async getMessage(messageId: string) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      })
      return response.data
    } catch (error) {
      console.error('Error getting message:', error)
      return null
    }
  }

  // メールの内容を解析
  parseMessage(message: any) {
    const headers = message.payload.headers
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name === name)?.value || ''

    const parseBody = (payload: any): string => {
      let body = ''
      
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            body += Buffer.from(part.body.data, 'base64').toString('utf-8')
          } else if (part.parts) {
            body += parseBody(part)
          }
        }
      } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      }
      
      return body
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
      body: parseBody(message.payload),
      snippet: message.snippet
    }
  }

  // 労災二次健診関連メールをフィルタリング
  isRousaiRelated(email: any): boolean {
    const keywords = [
      '労災', '二次健診', '健康診断', '産業医', '指定医療機関',
      '血圧', '血糖', '脂質', 'BMI', '腹囲', '心電図',
      '保健指導', '栄養指導', '運動指導', '生活習慣',
      '費用', '請求', '補助', '助成金', '契約',
      '判定', '結果', '報告書', '所見', '異常値',
      '予約', '日程', 'スケジュール', '実施', '受診',
      '労働基準監督署', '労基署', '申請', '手続き'
    ]

    const searchText = `${email.subject} ${email.body}`.toLowerCase()
    
    return keywords.some(keyword => searchText.includes(keyword))
  }

  // 一括でメールを取得・フィルタリング
  async fetchRousaiEmails(maxResults: number = 500) {
    const messages = await this.listMessages('to:health@ronshoal.com OR from:health@ronshoal.com', maxResults)
    const rousaiEmails = []

    for (const message of messages) {
      const fullMessage = await this.getMessage(message.id)
      if (fullMessage) {
        const parsed = this.parseMessage(fullMessage)
        if (this.isRousaiRelated(parsed)) {
          rousaiEmails.push(parsed)
        }
      }
    }

    return rousaiEmails
  }
}