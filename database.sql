-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Appointments Table
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  title text not null,
  provider_name text not null,
  specialty text not null,
  date text not null,
  time text not null,
  type text not null,
  status text not null,
  location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Health Records Table
create table health_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  title text not null,
  category text not null,
  date text not null,
  provider_name text not null,
  summary text not null,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Medications Table
create table medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  name text not null,
  dosage text not null,
  frequency text not null,
  prescribed_by text not null,
  start_date text not null,
  end_date text,
  refill_date text,
  pills_remaining integer,
  total_pills integer,
  instructions text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Providers Table
create table providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  name text not null,
  specialty text not null,
  npi text,
  phone text not null,
  address text not null,
  secure_fax text,
  email text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Referrals Table
create table referrals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  direction text not null,
  patient_name text not null,
  patient_dob text,
  reason text not null,
  notes text not null,
  from_provider_id text not null,
  to_provider_id text not null,
  attachments text[],
  status text not null,
  scheduled_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Health Histories Table
create table health_histories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users default auth.uid() not null,
  completed_at text not null,
  patient_info jsonb not null,
  dental_info jsonb not null,
  medical_conditions jsonb not null,
  allergy_info jsonb not null,
  medication_info jsonb not null,
  women_health jsonb not null,
  additional_info jsonb not null,
  consent jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) setup
alter table appointments enable row level security;
alter table health_records enable row level security;
alter table medications enable row level security;
alter table providers enable row level security;
alter table referrals enable row level security;
alter table health_histories enable row level security;

-- Create policies so users can only access their own data
create policy "Users can view their own appointments" on appointments for select using (auth.uid() = user_id);
create policy "Users can insert their own appointments" on appointments for insert with check (auth.uid() = user_id);
create policy "Users can update their own appointments" on appointments for update using (auth.uid() = user_id);

create policy "Users can view their own health records" on health_records for select using (auth.uid() = user_id);
create policy "Users can insert their own health records" on health_records for insert with check (auth.uid() = user_id);
create policy "Users can update their own health records" on health_records for update using (auth.uid() = user_id);

create policy "Users can view their own medications" on medications for select using (auth.uid() = user_id);
create policy "Users can insert their own medications" on medications for insert with check (auth.uid() = user_id);
create policy "Users can update their own medications" on medications for update using (auth.uid() = user_id);

create policy "Users can view their own providers" on providers for select using (auth.uid() = user_id);
create policy "Users can insert their own providers" on providers for insert with check (auth.uid() = user_id);
create policy "Users can update their own providers" on providers for update using (auth.uid() = user_id);

create policy "Users can view their own referrals" on referrals for select using (auth.uid() = user_id);
create policy "Users can insert their own referrals" on referrals for insert with check (auth.uid() = user_id);
create policy "Users can update their own referrals" on referrals for update using (auth.uid() = user_id);

create policy "Users can view their own health histories" on health_histories for select using (auth.uid() = user_id);
create policy "Users can insert their own health histories" on health_histories for insert with check (auth.uid() = user_id);
create policy "Users can update their own health histories" on health_histories for update using (auth.uid() = user_id);

-- Gamification / Profiles
create table user_profiles (
  id uuid references auth.users not null primary key,
  total_points integer default 0 not null,
  current_level integer default 1 not null,
  current_streak integer default 0 not null,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table completed_challenges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  challenge_id text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_profiles enable row level security;
alter table completed_challenges enable row level security;

create policy "Users can view their own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on user_profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on user_profiles for insert with check (auth.uid() = id);

create policy "Users can view their own completed challenges" on completed_challenges for select using (auth.uid() = user_id);
create policy "Users can insert their own completed challenges" on completed_challenges for insert with check (auth.uid() = user_id);

-- Storage bucket for avatars (run these commands manually in SQL editor if bucket creation via SQL depends on Supabase version)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
create policy "Anyone can update their own avatar." on storage.objects for update using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

