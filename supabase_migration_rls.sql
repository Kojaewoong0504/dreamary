-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data including is_admin
CREATE POLICY "Users can read own data" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- If the policy already exists, you might need to drop it first or ensure it covers all columns.
-- DROP POLICY IF EXISTS "Users can read own data" ON public.users;
