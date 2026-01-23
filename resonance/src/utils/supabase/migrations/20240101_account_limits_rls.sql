-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
create policy "Users can view own usage"
on user_usage for select
to authenticated
using (auth.uid() = user_id);

-- Optional: If you want to allow direct inserts from client (though we use RPC generally)
-- create policy "Users can update own usage"
-- on user_usage for all
-- to authenticated
-- using (auth.uid() = user_id);
