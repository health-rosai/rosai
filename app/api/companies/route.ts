import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const phase = searchParams.get('phase');
    const agency_id = searchParams.get('agency_id');
    const search = searchParams.get('search');
    const introducer_name = searchParams.get('introducer_name');
    const employee_count_min = searchParams.get('employee_count_min');
    const employee_count_max = searchParams.get('employee_count_max');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort_by = searchParams.get('sort_by') || 'updated_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('companies')
      .select(`
        *,
        agency:agencies(id, name, code),
        assigned_staff:profiles!assigned_staff_id(id, full_name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('current_status', status);
    }

    if (phase) {
      query = query.eq('phase', phase);
    }

    if (agency_id) {
      query = query.eq('agency_id', agency_id);
    }

    if (introducer_name) {
      query = query.ilike('introducer_name', `%${introducer_name}%`);
    }

    if (employee_count_min) {
      query = query.gte('employee_count', parseInt(employee_count_min));
    }

    if (employee_count_max) {
      query = query.lte('employee_count', parseInt(employee_count_max));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,company_code.ilike.%${search}%,contact_person.ilike.%${search}%,introducer_name.ilike.%${search}%,headquarters_address.ilike.%${search}%`);
    }

    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: body.name,
        company_code: body.company_code,
        introducer_name: body.introducer_name,
        headquarters_address: body.headquarters_address,
        website_url: body.website_url,
        primary_health_checkup_count: body.primary_health_checkup_count || 0,
        employee_count: body.employee_count || 0,
        remarks: body.remarks,
        current_status: body.current_status || '01',
        contact_person: body.contact_person,
        contact_method: body.contact_method,
        contact_phone_primary: body.contact_phone_primary,
        contact_phone_secondary: body.contact_phone_secondary,
        contact_email_primary: body.contact_email_primary,
        contact_email_secondary: body.contact_email_secondary,
        contact_email_tertiary: body.contact_email_tertiary,
        support_level: body.support_level,
        contract_email: body.contract_email,
        needs_explanation: body.needs_explanation || false,
        explanation_method: body.explanation_method,
        agency_id: body.agency_id,
        assigned_staff_id: body.assigned_staff_id || user.user.id,
        notes: body.notes,
        tags: body.tags || [],
        custom_fields: body.custom_fields || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }

    if (data) {
      await supabase
        .from('status_histories')
        .insert({
          company_id: data.id,
          from_status: null,
          to_status: data.current_status,
          changed_by: user.user.id,
          change_reason: '新規登録'
        });

      await supabase
        .from('activity_logs')
        .insert({
          company_id: data.id,
          user_id: user.user.id,
          action: 'company_created',
          details: { company_name: data.name }
        });
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