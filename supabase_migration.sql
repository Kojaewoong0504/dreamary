-- Add refresh_token column to users table for Auth Persistence
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Optional: Add comment
COMMENT ON COLUMN public.users.refresh_token IS 'Stores the latest refresh token for RTR (Refresh Token Rotation)';
