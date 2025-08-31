import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('faqs')
      .select(`
        *,
        reviewed_by:profiles!reviewed_by(id, full_name)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'FAQ not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQ' },
        { status: 500 }
      );
    }

    await supabase
      .from('faqs')
      .update({
        usage_count: (data.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', params.id);

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

    const { data: currentFaq } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!currentFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    const allowedFields = [
      'question', 'answer', 'category', 'related_status',
      'tags', 'status', 'is_active', 'frequency_score', 'confidence'
    ];

    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    });

    if (body.status === 'approved' && currentFaq.status !== 'approved') {
      updateData.reviewed_by = user.user.id;
      updateData.reviewed_at = new Date().toISOString();
    }

    if (Object.keys(updateData).length > 1 && 
        (body.question !== currentFaq.question || body.answer !== currentFaq.answer)) {
      const { data: newVersion } = await supabase
        .from('faqs')
        .insert({
          ...currentFaq,
          ...updateData,
          parent_id: currentFaq.parent_id || currentFaq.id,
          version: (currentFaq.version || 1) + 1,
          id: undefined,
          created_at: undefined
        })
        .select()
        .single();

      await supabase
        .from('faqs')
        .update({ is_active: false })
        .eq('id', params.id);

      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.user.id,
          action: 'faq_updated',
          details: { 
            faq_id: params.id,
            new_version_id: newVersion?.id,
            updated_fields: Object.keys(updateData).filter(k => k !== 'updated_at')
          }
        });

      return NextResponse.json({ data: newVersion });
    }

    const { data, error } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      );
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.user.id,
        action: 'faq_updated',
        details: { 
          faq_id: params.id,
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
        { error: 'Only admins can delete FAQs' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('faqs')
      .update({ 
        is_active: false,
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'FAQ not found' },
          { status: 404 }
        );
      }
      console.error('Error archiving FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to archive FAQ' },
        { status: 500 }
      );
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.user.id,
        action: 'faq_archived',
        details: { faq_id: params.id }
      });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}