import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects })
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, data } = body

    const { data: project, error } = await supabase
        .from('projects')
        .insert([
            {
                user_id: user.id,
                name,
                data
            }
        ])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // MOCK MODE FALLBACK
    // Since our mock client returns null for single(), we need to manually return a project object.
    const createdProject = project || {
        id: 'mock-project-' + Date.now(),
        name,
        data,
        updated_at: new Date().toISOString(),
        user_id: user.id
    };

    return NextResponse.json({ project: createdProject })
}
