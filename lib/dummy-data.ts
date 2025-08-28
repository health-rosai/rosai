// ダミーデータプロバイダー（開発環境用）
// import { dummyCompanies, dummyFAQs } from '@/scripts/seed-dummy-data'

// 開発環境でのみダミーデータを使用
export function useDummyData() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    companies: [],
    faqs: [],
    isDummy: isDevelopment
  }
}

// 企業データ取得（ダミーデータ対応）
export async function getCompaniesWithDummy() {
  // 本番環境では実際のデータベースから取得
  // ここにSupabaseのクエリを実装
  return {
    data: [],
    error: null
  }
}

// FAQデータ取得（ダミーデータ対応）
export async function getFAQsWithDummy() {
  // 本番環境では実際のデータベースから取得
  // ここにSupabaseのクエリを実装
  return {
    data: [],
    error: null
  }
}