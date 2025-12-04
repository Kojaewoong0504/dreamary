create table public.verification_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  type text not null check (type in ('RESET_PASSWORD', 'FIND_ID')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index verification_codes_email_idx on public.verification_codes (email);
create index verification_codes_code_idx on public.verification_codes (code);
