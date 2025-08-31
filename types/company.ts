export interface Company {
  id: string;
  company_code?: string; // 企業ID
  name: string; // 企業名
  introducer_name?: string; // 紹介者（敬称略）
  cc_introducer?: string; // CCをつける紹介者
  headquarters_address?: string; // 本社住所
  prefecture?: string; // 所在都道府県
  city?: string; // 市区町村
  website_url?: string; // HP
  primary_health_checkup_count?: number; // 一次健診受診者数
  employee_count?: number; // 従業員数
  remarks?: string; // 備考
  additional_remarks?: string; // 備考（追加）
  
  // 担当者情報
  contact_person?: string; // ご担当者様
  contact_method?: 'email' | 'phone' | 'both' | 'other'; // 連絡方法
  contact_phone_primary?: string; // 連絡先TEL1
  contact_phone_secondary?: string; // 連絡先TEL2
  contact_email_primary?: string; // メールアドレス1
  contact_email_secondary?: string; // メールアドレス2
  contact_email_tertiary?: string; // メールアドレス3
  
  // 商談管理
  initial_meeting_date?: string; // 初回商談日
  recording_data_url?: string; // 録画データ
  meeting_minutes?: string; // 商談議事録
  correspondence_history?: string; // やり取り履歴
  last_contact_date?: string; // 最終連絡日
  response_status_notes?: string; // 対応状況備考
  next_action_date?: string; // 次回アクション日
  next_action_content?: string; // 次回アクション内容
  memo?: string; // メモ
  
  // ドキュメント管理
  company_folder_url?: string; // 企業フォルダへ
  info_sheet_url?: string; // 情報シートリンク
  schedule_sheet_url?: string; // 日程調整シートリンク
  schedule_sheet_url2?: string; // 日程調整シートリンク2
  
  // 健診管理
  primary_checkup_completion?: string; // 1次健診完了時期
  result_receipt_timing?: string; // 健診結果受け取り時期
  secondary_checkup_month?: string; // 2次健診実施予定月
  judgment_request_count?: number; // 判定依頼人数
  earliest_checkup_date?: string; // 一次健診日（一番早い人）
  confirmed_count?: number; // 確定数
  checkup_start_date?: string; // 健診初日
  leader_name?: string; // リーダー
  medical_institution?: string; // 実施医療機関
  preferred_start_time?: string; // 希望開始時間
  preferred_weekday?: string; // 希望曜日
  preferred_month?: string; // 希望月
  ng_period?: string; // NGの時期
  executive_check?: boolean; // 役員チェック
  has_venue?: boolean; // 実施場所の有無
  special_notes?: string; // 注意事項等
  
  // ステータス管理
  current_status: string;
  phase?: string;
  status_changed_at?: string;
  
  // 契約サポート設定
  support_level?: 'referral_only' | 'partial' | 'full';
  contract_email?: string;
  
  // サービス説明設定
  needs_explanation?: boolean;
  explanation_method?: 'online' | 'visit' | 'document';
  
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
  
  // リレーション（JOIN時に含まれる）
  agency?: {
    id: string;
    name: string;
    code: string;
  };
  assigned_staff?: {
    id: string;
    full_name: string;
    email: string;
  };
  status_histories?: StatusHistory[];
  alerts?: Alert[];
}

export interface StatusHistory {
  id: string;
  company_id: string;
  from_status?: string;
  to_status: string;
  changed_by?: string;
  change_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Alert {
  id: string;
  company_id: string;
  type: 'stagnant' | 'no_reply' | 'error' | 'deadline' | 'custom';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface CompanyCreateInput {
  company_code?: string;
  name: string;
  introducer_name?: string;
  cc_introducer?: string;
  headquarters_address?: string;
  prefecture?: string;
  city?: string;
  website_url?: string;
  primary_health_checkup_count?: number;
  employee_count?: number;
  remarks?: string;
  additional_remarks?: string;
  contact_person?: string;
  contact_method?: 'email' | 'phone' | 'both' | 'other';
  contact_phone_primary?: string;
  contact_phone_secondary?: string;
  contact_email_primary?: string;
  contact_email_secondary?: string;
  contact_email_tertiary?: string;
  initial_meeting_date?: string;
  recording_data_url?: string;
  meeting_minutes?: string;
  correspondence_history?: string;
  last_contact_date?: string;
  response_status_notes?: string;
  next_action_date?: string;
  next_action_content?: string;
  memo?: string;
  company_folder_url?: string;
  info_sheet_url?: string;
  schedule_sheet_url?: string;
  schedule_sheet_url2?: string;
  primary_checkup_completion?: string;
  result_receipt_timing?: string;
  secondary_checkup_month?: string;
  judgment_request_count?: number;
  earliest_checkup_date?: string;
  confirmed_count?: number;
  checkup_start_date?: string;
  leader_name?: string;
  medical_institution?: string;
  preferred_start_time?: string;
  preferred_weekday?: string;
  preferred_month?: string;
  ng_period?: string;
  executive_check?: boolean;
  has_venue?: boolean;
  special_notes?: string;
  current_status?: string;
  support_level?: 'referral_only' | 'partial' | 'full';
  contract_email?: string;
  needs_explanation?: boolean;
  explanation_method?: 'online' | 'visit' | 'document';
  agency_id?: string;
  assigned_staff_id?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface CompanyUpdateInput extends Partial<CompanyCreateInput> {
  status_change_reason?: string;
  status_metadata?: Record<string, any>;
}

export interface CompanySearchParams {
  status?: string;
  phase?: string;
  agency_id?: string;
  search?: string;
  introducer_name?: string;
  employee_count_min?: number;
  employee_count_max?: number;
  page?: number;
  limit?: number;
  sort_by?: 'updated_at' | 'created_at' | 'name' | 'employee_count';
  sort_order?: 'asc' | 'desc';
}