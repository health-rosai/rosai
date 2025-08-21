import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ScheduleReportRequest {
  template: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
  active: boolean
  name: string
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ScheduleReportRequest = await request.json()
    const { template, frequency, recipients, format, active, name, description } = body

    if (!template || !frequency || !recipients.length || !format || !name) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Create scheduled report in database
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        name,
        description,
        template,
        frequency,
        recipients,
        format,
        active,
        created_by: user.id,
        next_run: calculateNextRun(frequency)
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create scheduled report' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      scheduledReport: data,
      message: 'スケジュールされたレポートを作成しました' 
    })
  } catch (error) {
    console.error('Schedule report error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all scheduled reports for the user
    const { data: scheduledReports, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch scheduled reports' }, { status: 500 })
    }

    return NextResponse.json({ scheduledReports })
  } catch (error) {
    console.error('Get scheduled reports error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const body: Partial<ScheduleReportRequest> = await request.json()

    // Update scheduled report
    const { data, error } = await supabase
      .from('scheduled_reports')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        next_run: body.frequency ? calculateNextRun(body.frequency) : undefined
      })
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update scheduled report' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Scheduled report not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      scheduledReport: data,
      message: 'スケジュールされたレポートを更新しました' 
    })
  } catch (error) {
    console.error('Update scheduled report error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Delete scheduled report
    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete scheduled report' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'スケジュールされたレポートを削除しました' 
    })
  } catch (error) {
    console.error('Delete scheduled report error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

function calculateNextRun(frequency: string): string {
  const now = new Date()
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    case 'quarterly':
      now.setMonth(now.getMonth() + 3)
      break
    default:
      now.setDate(now.getDate() + 1)
  }
  
  // Set to 9 AM
  now.setHours(9, 0, 0, 0)
  
  return now.toISOString()
}