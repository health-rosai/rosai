export type StatusCode = 
  | '01' | '02' | '03A' | '03B' | '04' | '05' | '06' | '07' | '08' | '09' 
  | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' 
  | '20' | '21' | '22' | '99A' | '99D' | '99E';

export type Phase = '営業' | '提案' | '契約' | '健診・判定' | '労災二次健診' | '請求' | '完了' | '特殊';

export type UserRole = 'admin' | 'staff' | 'agency';

export type SupportLevel = 'referral_only' | 'partial' | 'full';

export type ExplanationMethod = 'online' | 'visit' | 'document';

export type AlertType = 'stagnant' | 'no_reply' | 'error' | 'deadline' | 'custom';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FAQCategory = '契約' | '請求' | '健診' | '判定' | 'サービス全般' | 'その他';

export type FAQStatus = 'draft' | 'reviewing' | 'approved' | 'published' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  agency_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  code: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  code?: string;
  current_status: StatusCode;
  phase: Phase;
  
  // 基本情報
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  cc_emails?: string[];
  
  // 契約サポート設定
  support_level?: SupportLevel;
  contract_email?: string;
  
  // サービス説明設定
  needs_explanation: boolean;
  explanation_method?: ExplanationMethod;
  
  // 関連情報
  agency_id?: string;
  assigned_staff_id?: string;
  
  // メタデータ
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
  status_changed_at: string;
}

export interface StatusHistory {
  id: string;
  company_id: string;
  from_status?: StatusCode;
  to_status: StatusCode;
  changed_by?: string;
  change_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Email {
  id: string;
  company_id?: string;
  gmail_id: string;
  thread_id?: string;
  from_email: string;
  to_emails?: string[];
  cc_emails?: string[];
  subject?: string;
  body_text?: string;
  body_html?: string;
  attachments?: any[];
  received_at?: string;
  
  // AI処理結果
  ai_processed: boolean;
  ai_analysis?: any;
  ai_suggested_status?: StatusCode;
  ai_confidence?: number;
  ai_auto_reply?: string;
  ai_processed_at?: string;
  
  // FAQ候補
  faq_candidate?: any;
  
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  related_status?: StatusCode[];
  frequency_score: number;
  confidence: number;
  source_count: number;
  
  // バージョン管理
  version: number;
  is_active: boolean;
  parent_id?: string;
  
  // レビュー管理
  status: FAQStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // メタデータ
  tags?: string[];
  usage_count: number;
  last_used_at?: string;
  
  // AI生成情報
  ai_generated: boolean;
  generation_metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  company_id: string;
  type: AlertType;
  severity?: AlertSeverity;
  title: string;
  description?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  company_id?: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ステータス定義
export const STATUS_DEFINITIONS: Record<StatusCode, { name: string; phase: Phase; description: string }> = {
  '01': { name: '未着手', phase: '営業', description: '初期状態、まだ何もアクションが取られていない' },
  '02': { name: 'アポ獲得', phase: '営業', description: '訪問・オンライン商談の日程が確定' },
  '03A': { name: '商談済（検討中）', phase: '営業', description: '商談実施済み、企業が検討中' },
  '03B': { name: '商談済（前向き）', phase: '営業', description: '商談実施済み、前向きな反応あり' },
  '04': { name: '資料提供準備中', phase: '提案', description: '提案資料・見積もり作成中' },
  '05': { name: '資料送付済', phase: '提案', description: '提案資料を送付完了、返答待ち' },
  '06': { name: '契約意向あり', phase: '契約', description: '契約の意思表示あり、手続き準備中' },
  '07': { name: '契約書送付済', phase: '契約', description: '契約書類送付済み、押印・返送待ち' },
  '08': { name: '契約締結完了', phase: '健診・判定', description: '契約成立、健診準備開始' },
  '09': { name: '健診案内送付済', phase: '健診・判定', description: '対象者への健診案内を配布済み' },
  '10': { name: '健診予約受付中', phase: '健診・判定', description: '従業員からの健診予約を受付中' },
  '11': { name: '健診実施中', phase: '健診・判定', description: '健診を実施している期間' },
  '12': { name: '健診完了（判定待ち）', phase: '健診・判定', description: '全員の健診完了、結果判定中' },
  '13': { name: '判定結果通知済', phase: '健診・判定', description: '健診結果を企業・従業員に通知済み' },
  '14': { name: '二次健診対象者確定', phase: '労災二次健診', description: '労災二次健診の対象者が確定' },
  '15': { name: '二次健診案内済', phase: '労災二次健診', description: '対象者に二次健診の案内を送付済み' },
  '16': { name: '二次健診予約受付中', phase: '労災二次健診', description: '二次健診の予約受付期間' },
  '17': { name: '二次健診完了', phase: '労災二次健診', description: '二次健診実施完了' },
  '18': { name: '請求書作成中', phase: '請求', description: '請求書類の作成・確認中' },
  '19': { name: '請求書送付済', phase: '請求', description: '請求書送付完了、入金待ち' },
  '20': { name: '入金確認済', phase: '完了', description: '入金確認完了' },
  '21': { name: '保健指導実施済', phase: '完了', description: '必要に応じた保健指導完了' },
  '22': { name: '完了（次年度準備）', phase: '完了', description: '全プロセス完了、次年度の準備' },
  '99A': { name: '保留', phase: '特殊', description: '一時的に保留状態' },
  '99D': { name: '請求エラー', phase: '特殊', description: '請求関連の問題発生' },
  '99E': { name: 'その他エラー', phase: '特殊', description: 'その他のエラー・イレギュラー対応' }
};