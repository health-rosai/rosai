import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 開発環境のモック認証チェック
  if (process.env.NODE_ENV === 'development') {
    const devUser = request.cookies.get('dev-user')
    
    // ログインページとAPIエンドポイントはスキップ
    if (path === '/login' || path.startsWith('/api/')) {
      return NextResponse.next()
    }

    // 認証が必要なページへのアクセス
    if (path.startsWith('/dashboard') || 
        path.startsWith('/admin') || 
        path.startsWith('/companies') ||
        path.startsWith('/reports') ||
        path.startsWith('/faqs') ||
        path.startsWith('/kanban')) {
      
      if (!devUser) {
        // 未ログインの場合はログインページへリダイレクト
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}