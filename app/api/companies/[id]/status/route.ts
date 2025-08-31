import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const STATUS_DEFINITIONS = {
  '01': { name: '新規リード', phase: '営業' },
  '02': { name: '初回コンタクト', phase: '営業' },
  '03A': { name: 'ニーズヒアリング中', phase: '営業' },
  '03B': { name: 'サービス説明済み', phase: '営業' },
  '04': { name: '提案準備中', phase: '提案' },
  '05': { name: '提案済み・検討中', phase: '提案' },
  '06': { name: '契約条件交渉中', phase: '契約' },
  '07': { name: '契約手続き中', phase: '契約' },
  '08': { name: '健診準備中', phase: '健診・判定' },
  '09': { name: '健診日程調整中', phase: '健診・判定' },
  '10': { name: '健診実施中', phase: '健診・判定' },
  '11': { name: '判定待ち', phase: '健診・判定' },
  '12': { name: '判定結果通知済み', phase: '健診・判定' },
  '13': { name: '有所見者フォロー中', phase: '健診・判定' },
  '14': { name: '労災二次健診対象者確認中', phase: '労災二次健診' },
  '15': { name: '二次健診医療機関調整中', phase: '労災二次健診' },
  '16': { name: '二次健診実施中', phase: '労災二次健診' },
  '17': { name: '二次健診結果待ち', phase: '労災二次健診' },
  '18': { name: '請求準備中', phase: '請求' },
  '19': { name: '請求書発行済み', phase: '請求' },
  '20': { name: '入金確認済み', phase: '完了' },
  '21': { name: 'サービス完了', phase: '完了' },
  '22': { name: '次年度更新待ち', phase: '完了' },
  '23': { name: '保留', phase: '特殊' },
  '24': { name: '失注', phase: '特殊' },
  '25': { name: '解約', phase: '特殊' },
  '26': { name: 'トラブル対応中', phase: '特殊' }
};

const VALID_TRANSITIONS: { [key: string]: string[] } = {
  '01': ['02', '23', '24'],
  '02': ['03A', '03B', '23', '24'],
  '03A': ['03B', '04', '23', '24'],
  '03B': ['04', '05', '23', '24'],
  '04': ['05', '23', '24'],
  '05': ['06', '23', '24'],
  '06': ['07', '23', '24'],
  '07': ['08', '23', '25'],
  '08': ['09', '23', '25', '26'],
  '09': ['10', '23', '25', '26'],
  '10': ['11', '23', '25', '26'],
  '11': ['12', '23', '25', '26'],
  '12': ['13', '14', '18', '23', '25', '26'],
  '13': ['14', '18', '23', '25', '26'],
  '14': ['15', '18', '23', '25', '26'],
  '15': ['16', '23', '25', '26'],
  '16': ['17', '23', '25', '26'],
  '17': ['18', '23', '25', '26'],
  '18': ['19', '23', '25', '26'],
  '19': ['20', '23', '25', '26'],
  '20': ['21', '22', '25'],
  '21': ['22', '01'],
  '22': ['01', '08'],
  '23': ['01', '02', '03A', '03B', '04', '05', '06', '07', '08'],
  '24': [],
  '25': [],
  '26': ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('current_status, phase')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch company status' },
        { status: 500 }
      );
    }

    const currentStatus = company.current_status;
    const validTransitions = VALID_TRANSITIONS[currentStatus] || [];
    
    const availableTransitions = validTransitions.map(status => ({
      status,
      ...STATUS_DEFINITIONS[status]
    }));

    return NextResponse.json({
      current: {
        status: currentStatus,
        ...STATUS_DEFINITIONS[currentStatus]
      },
      availableTransitions,
      allStatuses: Object.entries(STATUS_DEFINITIONS).map(([status, def]) => ({
        status,
        ...def
      }))
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { new_status, reason, force = false } = body;

    if (!new_status || !STATUS_DEFINITIONS[new_status]) {
      return NextResponse.json(
        { error: 'Invalid status code' },
        { status: 400 }
      );
    }

    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('current_status, name')
      .eq('id', params.id)
      .single();

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!force) {
      const validTransitions = VALID_TRANSITIONS[company.current_status] || [];
      if (!validTransitions.includes(new_status)) {
        return NextResponse.json(
          { 
            error: 'Invalid status transition',
            details: {
              current: company.current_status,
              requested: new_status,
              valid: validTransitions
            }
          },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await supabase
      .from('companies')
      .update({
        current_status: new_status,
        status_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    await supabase
      .from('status_histories')
      .insert({
        company_id: params.id,
        from_status: company.current_status,
        to_status: new_status,
        changed_by: user.user.id,
        change_reason: reason || 'ステータス更新',
        metadata: { force }
      });

    await supabase
      .from('activity_logs')
      .insert({
        company_id: params.id,
        user_id: user.user.id,
        action: 'status_changed',
        details: {
          from: company.current_status,
          to: new_status,
          reason
        }
      });

    if (new_status === '23' || new_status === '26') {
      await supabase
        .from('alerts')
        .insert({
          company_id: params.id,
          type: new_status === '26' ? 'error' : 'custom',
          severity: new_status === '26' ? 'high' : 'medium',
          title: new_status === '26' ? 'トラブル発生' : '案件保留',
          description: reason || 'ステータスが変更されました'
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        company_id: params.id,
        old_status: company.current_status,
        new_status,
        timestamp: new Date().toISOString()
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