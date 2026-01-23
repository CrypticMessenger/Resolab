-- Ensure Storage RLS is enabled (it usually is by default for storage.objects, but good to be sure)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out to avoid "must be owner" error. RLS is usually on by default.

-- Create policy to allow Authenticated users to do EVERYTHING on their own folder
-- We assume the folder structure is `userId/filename`

-- First, drop existing policies to avoid conflicts if they were partially created
drop policy if exists "Give users access to own folder 1u5j4_0" on storage.objects;
drop policy if exists "Give users access to own folder 1u5j4_1" on storage.objects;
drop policy if exists "Give users access to own folder 1u5j4_2" on storage.objects;
drop policy if exists "Give users access to own folder 1u5j4_3" on storage.objects;

-- 1. SELECT (View)
create policy "Give users access to own folder 1u5j4_0"
on storage.objects for select
to authenticated
using ( bucket_id = 'audio-files' and name like (auth.uid() || '/%') );

-- 2. INSERT (Upload)
create policy "Give users access to own folder 1u5j4_1"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'audio-files' and name like (auth.uid() || '/%') );

-- 3. UPDATE (Move/Rename)
create policy "Give users access to own folder 1u5j4_2"
on storage.objects for update
to authenticated
using ( bucket_id = 'audio-files' and name like (auth.uid() || '/%') );

-- 4. DELETE (Remove)
create policy "Give users access to own folder 1u5j4_3"
on storage.objects for delete
to authenticated
using ( bucket_id = 'audio-files' and name like (auth.uid() || '/%') );
