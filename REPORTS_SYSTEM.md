# 労災二次健診システム - レポート生成機能

## 概要

労災二次健診システムの包括的なレポート生成機能です。月次、四半期、年次、およびカスタムレポートの作成、プレビュー、エクスポート、スケジュール配信をサポートします。

## 機能一覧

### 1. レポートテンプレート

#### 月次レポート
- エグゼクティブサマリー
- 企業ステータス概要
- 進捗メトリクス
- メール活動サマリー

#### 四半期レポート
- エグゼクティブサマリー
- 企業ステータス概要
- 進捗メトリクス
- FAQ分析
- パフォーマンス指標
- 推奨アクション

#### 年次レポート
- 全セクションを包含する総合レポート
- 年間トレンド分析
- 部門別パフォーマンス評価

#### カスタムレポート
- ユーザー定義の期間と項目
- 柔軟なセクション選択

### 2. レポート内容

#### エグゼクティブサマリー
- 総企業数
- 進行中案件数
- 完了企業数
- 完了率
- 平均処理日数
- 売上予測

#### 企業ステータス概要
- フェーズ別分布（円グラフ）
- ステータス別企業数（棒グラフ）
- 進捗推移（折れ線グラフ）

#### 進捗メトリクス
- 完了率
- 時間内完了率
- 顧客満足度
- エラー率
- トレンド分析

#### FAQ分析
- 総FAQ数
- カテゴリ別分布
- よくある質問TOP10
- AI生成率

#### メール活動サマリー
- 総メール数
- 処理済みメール数
- 自動返信数
- 平均応答時間
- 日別メール活動グラフ

#### パフォーマンス指標
- KPI達成状況
- 部門別メトリクス
- アラート分析

#### 推奨アクション
- データ分析に基づく改善提案
- プロセス最適化の推奨事項

### 3. エクスポート機能

#### PDF形式
- プレゼンテーション形式
- 印刷に最適化
- グラフとチャートを含む視覚的レポート

#### Excel形式
- データ分析用
- 複数シート構成
- 数値データの詳細分析

#### CSV形式
- データエクスポート
- 外部システム連携
- 軽量なデータ交換

### 4. スケジュール機能

#### 自動配信
- 日次、週次、月次、四半期配信
- 複数受信者への同時送信
- 配信履歴の管理

#### 配信管理
- スケジュール設定の作成・編集・削除
- アクティブ/非アクティブ切り替え
- 次回実行日の自動計算

## 技術仕様

### フロントエンド
- **フレームワーク**: Next.js 15
- **UI**: React + Tailwind CSS
- **チャート**: Recharts
- **状態管理**: React Hooks
- **フォーム**: React Hook Form

### バックエンド
- **API**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ファイル生成**: カスタム実装

### データベース構造

#### scheduled_reports テーブル
```sql
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    recipients TEXT[] NOT NULL,
    format VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    next_run TIMESTAMP WITH TIME ZONE,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### report_execution_history テーブル
```sql
CREATE TABLE report_execution_history (
    id UUID PRIMARY KEY,
    scheduled_report_id UUID REFERENCES scheduled_reports(id),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL,
    recipients_sent TEXT[],
    error_message TEXT,
    file_size INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API エンドポイント

### レポート生成
```
POST /api/reports/generate
```
**リクエスト**:
```json
{
  "template": "monthly",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "format": "pdf",
  "data": { /* レポートデータ */ }
}
```

### スケジュール管理
```
GET /api/reports/schedule     # スケジュール一覧取得
POST /api/reports/schedule    # スケジュール作成
PUT /api/reports/schedule?id=xxx  # スケジュール更新
DELETE /api/reports/schedule?id=xxx # スケジュール削除
```

## 使用方法

### 1. レポート生成
1. レポートページ（/reports）にアクセス
2. テンプレートを選択
3. 期間を設定
4. 「レポート生成」ボタンをクリック
5. プレビューで内容を確認
6. 必要な形式でエクスポート

### 2. スケジュール設定
1. 「定期レポート設定」ボタンをクリック
2. レポート名と説明を入力
3. テンプレートと頻度を選択
4. 受信者のメールアドレスを入力
5. 出力形式を選択
6. 「作成」ボタンでスケジュール保存

### 3. プレビューモード
- 「プレビュー」ボタンで全画面表示
- 印刷やPDF保存に最適化された表示
- セクションごとの詳細な分析結果

## セキュリティ

### アクセス制御
- Supabase RLS（Row Level Security）による行レベルセキュリティ
- ユーザーは自分が作成したスケジュールのみアクセス可能
- 管理者は全スケジュールにアクセス可能

### データ保護
- レポートデータの一時的な生成
- 機密情報の適切な処理
- セッション管理とタイムアウト

## パフォーマンス最適化

### フロントエンド
- React.memoによるコンポーネント最適化
- 遅延ローディング
- チャートレンダリングの最適化

### バックエンド
- データベースクエリの最適化
- インデックスの適切な設計
- ファイル生成の効率化

## 今後の拡張予定

### 機能追加
- レポートテンプレートのカスタマイズ機能
- ダッシュボードウィジェットとの連携
- リアルタイムデータ更新
- モバイル対応の向上

### 技術改善
- PDFライブラリの統合（Puppeteer等）
- Excelライブラリの統合（ExcelJS等）
- バックグラウンドジョブ処理
- キャッシュ機能の実装

## トラブルシューティング

### よくある問題

#### レポート生成が失敗する
- データベース接続を確認
- 権限設定を確認
- ログでエラー詳細を確認

#### スケジュール配信が動作しない
- next_runの時刻設定を確認
- バックグラウンドジョブの状態確認
- メール送信設定の確認

#### パフォーマンスが遅い
- データ量の確認
- インデックスの最適化
- クエリの見直し

## サポート

技術的な問題や機能要望については、開発チームまでお問い合わせください。

---

**最終更新**: 2024年8月21日
**バージョン**: 1.0.0