-- 1. Add columns to user_usage table (Safe if exists)
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS total_storage_bytes bigint DEFAULT 0;
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS total_files_count int DEFAULT 0;

-- 2. Function to increment storage usage (Upload) - WITH UPSERT
create or replace function increment_storage(bytes int, file_count int)
returns void
language plpgsql
security definer
as $$
begin
  insert into user_usage (user_id, total_storage_bytes, total_files_count)
  values (auth.uid(), bytes, file_count)
  on conflict (user_id) do update
  set 
    total_storage_bytes = user_usage.total_storage_bytes + excluded.total_storage_bytes,
    total_files_count = user_usage.total_files_count + excluded.total_files_count;
end;
$$;

-- 3. Function to decrement storage usage (Delete)
create or replace function decrement_storage(bytes int, file_count int)
returns void
language plpgsql
security definer
as $$
begin
  update user_usage
  set 
    total_storage_bytes = greatest(0, total_storage_bytes - bytes),
    total_files_count = greatest(0, total_files_count - file_count)
  where user_id = auth.uid();
end;
$$;

-- 4. Helper to Sync Stats (Optional: Call this if numbers get drifted)
-- usage: select sync_storage_stats();
create or replace function sync_storage_stats()
returns void
language plpgsql
security definer
as $$
declare
  total_bytes bigint;
  count_files int;
begin
  -- Calculate from storage.objects (Requires permissions, might fail if RLS blocks reading others' objects, 
  -- but security definer might help if function owner has access. 
  -- Note: storage.objects is often not directly queryable easily without extensions. 
  -- Simplified approximation: just reset to 0 if unsure, or manual fix)
  
  -- For now, we won't try complex storage object querying to avoid permission hell. 
  -- This function is a placeholder for future robust syncing if needed.
  -- A manual reset:
  -- update user_usage set total_storage_bytes = 0, total_files_count = 0 where user_id = auth.uid();
end;
$$;
