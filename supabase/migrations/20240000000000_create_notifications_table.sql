-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message text not null,
  filter_type text not null check (filter_type in ('all', 'class', 'student')),
  filter_value text,
  sender_id uuid references auth.users(id)
);

-- Enable Realtime
alter publication supabase_realtime add table notifications;

-- Policies (Optional but recommended)
alter table public.notifications enable row level security;

-- Allow read access to everyone (or authenticated users)
create policy "Enable read access for all users"
on public.notifications for select
using (true);

-- Allow insert access to authenticated users (Admins)
create policy "Enable insert for authenticated users only"
on public.notifications for insert
with check (auth.role() = 'authenticated');
