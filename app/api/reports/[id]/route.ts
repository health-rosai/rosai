import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reportUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['monthly', 'quarterly', 'annual', 'custom']).optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
  metadata: z.object({
    department: z.string().optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
  }).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', (await params).id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      report,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = reportUpdateSchema.parse(body)
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('user_id')
      .eq('id', (await params).id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }
    
    if (existingReport && existingReport.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this report' },
        { status: 403 }
      )
    }
    
    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }
    
    const { data: report, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', (await params).id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      report,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('user_id')
      .eq('id', (await params).id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }
    
    if (existingReport && existingReport.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this report' },
        { status: 403 }
      )
    }
    
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', (await params).id)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: 'Report deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}