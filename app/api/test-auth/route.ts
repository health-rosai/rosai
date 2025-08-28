import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user?.email 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message 
      })
    }

    return NextResponse.json({ 
      authenticated: !!user,
      user: user?.email 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      authenticated: false, 
      error: error.message 
    }, { status: 500 })
  }
}