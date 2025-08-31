import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        agency:agencies(id, name, code),
        assigned_staff:profiles!assigned_staff_id(id, full_name, email),
        status_histories(
          id,
          from_status,
          to_status,
          change_reason,
          created_at,
          changed_by:profiles!changed_by(id, full_name)
        ),
        alerts(
          id,
          type,
          severity,
          title,
          description,
          is_resolved,
          created_at
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching company:', error);
      return NextResponse.json(
        { error: 'Failed to fetch company' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { data: currentCompany } = await supabase
      .from('companies')
      .select('current_status')
      .eq('id', params.id)
      .single();

    if (!currentCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    const allowedFields = [
      'name', 'code', 'current_status', 'contact_person', 
      'contact_email', 'contact_phone', 'cc_emails',
      'support_level', 'contract_email', 'needs_explanation',
      'explanation_method', 'agency_id', 'assigned_staff_id',
      'notes', 'tags', 'custom_fields'
    ];

    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    });

    if (body.current_status && body.current_status !== currentCompany.current_status) {
      updateData.status_changed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      );
    }

    if (body.current_status && body.current_status !== currentCompany.current_status) {
      await supabase
        .from('status_histories')
        .insert({
          company_id: params.id,
          from_status: currentCompany.current_status,
          to_status: body.current_status,
          changed_by: user.user.id,
          change_reason: body.status_change_reason || '手動更新',
          metadata: body.status_metadata || {}
        });
    }

    await supabase
      .from('activity_logs')
      .insert({
        company_id: params.id,
        user_id: user.user.id,
        action: 'company_updated',
        details: { 
          updated_fields: Object.keys(updateData).filter(k => k !== 'updated_at')
        }
      });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete companies' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', params.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting company:', error);
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}