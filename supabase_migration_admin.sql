-- Add is_admin column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Comment
COMMENT ON COLUMN public.users.is_admin IS 'Indicates if the user has admin privileges';
