'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, FileQuestion, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailImportPage() {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<string>('')

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/gmail/import')
      const data = await response.json()
      
      if (data.authUrl) {
        setAuthUrl(data.authUrl)
        window.open(data.authUrl, '_blank')
      }
    } catch (err) {
      setError('認証URLの取得に失敗しました')
    }
  }

  const startImport = async () => {
    setIsImporting(true)
    setError(null)
    setImportResult(null)
    setImportProgress('メールを取得中...')

    try {
      // 進捗メッセージを段階的に更新
      setTimeout(() => setImportProgress('労災関連メールをフィルタリング中...'), 3000)
      setTimeout(() => setImportProgress('AI分析を実行中...'), 10000)
      setTimeout(() => setImportProgress('FAQ候補を生成中...'), 20000)
      setTimeout(() => setImportProgress('処理を完了中...'), 30000)

      const response = await fetch('/api/gmail/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('インポートに失敗しました')
      }

      const data = await response.json()
      setImportResult(data)
      setImportProgress('')
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
      setImportProgress('')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            メール一括インポート & FAQ自動生成
          </CardTitle>
          <CardDescription>
            health@ronshoal.com のメールから労災二次健診関連のメールを取り込み、FAQを自動生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!process.env.NEXT_PUBLIC_GMAIL_CONFIGURED && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Gmail APIの設定が必要です。まず認証を行ってください。
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Step 1: Gmail認証</h3>
              <p className="text-sm text-muted-foreground">
                Gmail APIへのアクセス権限を取得します
              </p>
              <Button 
                onClick={checkAuth}
                variant="outline"
                disabled={isImporting}
              >
                認証ページを開く
              </Button>
              {authUrl && (
                <Alert>
                  <AlertDescription className="text-xs">
                    認証ページが開きました。認証完了後、表示されるトークンを.env.localに追加してください。
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Step 2: メールインポート実行</h3>
              <p className="text-sm text-muted-foreground">
                認証完了後、メールの取り込みとFAQ生成を実行します
              </p>
              <Button 
                onClick={startImport}
                disabled={isImporting}
                className="w-full sm:w-auto"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    インポート中...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    インポート開始
                  </>
                )}
              </Button>
              {isImporting && importProgress && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {importProgress}
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importResult && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  インポート完了
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-700">
                      {importResult.imported_count}
                    </p>
                    <p className="text-sm text-gray-600">メール取込</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-700">
                      {importResult.faq_candidates_count}
                    </p>
                    <p className="text-sm text-gray-600">FAQ候補</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-700">
                      {importResult.faqs_generated}
                    </p>
                    <p className="text-sm text-gray-600">FAQ生成</p>
                  </div>
                </div>

                {importResult.sample_faqs && importResult.sample_faqs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-gray-700">生成されたFAQサンプル:</h4>
                    <div className="space-y-2">
                      {importResult.sample_faqs.map((faq: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-300 pl-3 py-1">
                          <p className="font-medium text-sm">Q: {faq.question}</p>
                          <p className="text-sm text-gray-600 mt-1">A: {faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Alert>
            <FileQuestion className="h-4 w-4" />
            <AlertDescription>
              <strong>処理内容:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• health@ronshoal.com の送受信メールを取得</li>
                <li>• 労災二次健診に関連するキーワードでフィルタリング</li>
                <li>• AI（Gemini）でメール内容を分析</li>
                <li>• よくある質問を自動抽出してFAQ生成</li>
                <li>• カテゴリ別に分類（契約/請求/健診/判定など）</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}