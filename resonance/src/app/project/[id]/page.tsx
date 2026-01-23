import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SpatialAudioEditor from '@/components/SpatialAudioEditor';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    return <SpatialAudioEditor projectId={id} />;
}
