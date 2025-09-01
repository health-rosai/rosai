import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 開発環境専用のモックログイン
const DEV_USERS = [
  {
    email: 'admin@test.com',
    password: 'admin123456',
    role: 'admin',
    full_name: '管理者テスト',
    id: 'dev-admin-001'
  },
  {
    email: 'manager@test.com',
    password: 'manager123456',
    role: 'manager',
    full_name: 'マネージャーテスト',
    id: 'dev-manager-001'
  },
  {
    email: 'operator@test.com',
    password: 'operator123456',
    role: 'operator',
    full_name: 'オペレーターテスト',
    id: 'dev-operator-001'
  },
  {
    email: 'viewer@test.com',
    password: 'viewer123456',
    role: 'viewer',
    full_name: '閲覧者テスト',
    id: 'dev-viewer-001'
  }
]

export async function POST(request: NextRequest) {
  // デモモードまたは開発環境で有効
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (process.env.NODE_ENV === 'production' && !isDemoMode) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development or demo mode' },
      { status: 403 }
    )
  }

  try {
    const { email, password } = await request.json()

    // モックユーザーを検索
    const user = DEV_USERS.find(
      u => u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // セッションクッキーを設定
    const cookieStore = await cookies()
    cookieStore.set('dev-user', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }), {
      httpOnly: true,
      secure: false, // Always false for dev-login
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7日間
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // ログアウト
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  const cookieStore = await cookies()
  cookieStore.delete('dev-user')

  return NextResponse.json({ success: true })
}