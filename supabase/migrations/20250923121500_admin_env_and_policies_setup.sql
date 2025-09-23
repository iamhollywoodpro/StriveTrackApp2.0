-- Admin/Storage/Media setup (idempotent)
-- 1) Ensure profiles has admin + active flags
alter table if exists public.profiles add column if not exists is_admin boolean not null default false;
alter table if exists public.profiles add column if not exists is_active boolean not null default true;

-- 2) Promote primary admin by email (safe if row exists)
update public.profiles
set is_admin = true, is_active = true
where email = 'iamhollywoodpro@protonmail.com';

-- 3) media_files table (if missing)
create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text,
  file_path text not null,
  file_size bigint,
  mime_type text,
  media_type text check (media_type in ('image','video')),
  progress_type text,
  privacy_level text,
  description text,
  status text not null default 'active' check (status in ('active','flagged','deleted')),
  flagged_by uuid,
  flagged_reason text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_files_user on public.media_files (user_id);
create index if not exists idx_media_files_status on public.media_files (status);
create index if not exists idx_media_files_uploaded_at on public.media_files (uploaded_at);

-- 4) RLS on media_files
alter table public.media_files enable row level security;

-- Owner select
create policy if not exists media_files_select_owner
on public.media_files for select
using (user_id = auth.uid());

-- Admin select
create policy if not exists media_files_select_admin
on public.media_files for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Owner insert
create policy if not exists media_files_insert_owner
on public.media_files for insert
with check (user_id = auth.uid());

-- Owner update
create policy if not exists media_files_update_owner
on public.media_files for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Admin update (flag/unflag/delete)
create policy if not exists media_files_update_admin
on public.media_files for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 5) Storage policies for user-media and profile-images
-- Admin full access to user-media
create policy if not exists user_media_admin_all on storage.objects for all
using (
  bucket_id = 'user-media'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
)
with check (
  bucket_id = 'user-media'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- User manage own files in user-media (prefix {uid}/...)
create policy if not exists user_media_user_select on storage.objects for select
using (bucket_id = 'user-media' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists user_media_user_insert on storage.objects for insert
with check (bucket_id = 'user-media' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists user_media_user_update on storage.objects for update
using (bucket_id = 'user-media' and split_part(name,'/',1) = auth.uid()::text)
with check (bucket_id = 'user-media' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists user_media_user_delete on storage.objects for delete
using (bucket_id = 'user-media' and split_part(name,'/',1) = auth.uid()::text);

-- Admin full access to profile-images
create policy if not exists profile_images_admin_all on storage.objects for all
using (
  bucket_id = 'profile-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
)
with check (
  bucket_id = 'profile-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- User manage own files in profile-images
create policy if not exists profile_images_user_select on storage.objects for select
using (bucket_id = 'profile-images' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists profile_images_user_insert on storage.objects for insert
with check (bucket_id = 'profile-images' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists profile_images_user_update on storage.objects for update
using (bucket_id = 'profile-images' and split_part(name,'/',1) = auth.uid()::text)
with check (bucket_id = 'profile-images' and split_part(name,'/',1) = auth.uid()::text);
create policy if not exists profile_images_user_delete on storage.objects for delete
using (bucket_id = 'profile-images' and split_part(name,'/',1) = auth.uid()::text);

-- 6) Optional: migrate legacy public.progress_media -> media_files if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='progress_media'
  ) THEN
    INSERT INTO public.media_files
      (user_id, filename, file_path, file_size, mime_type, media_type, progress_type, privacy_level, description, status, uploaded_at)
    SELECT
      pm.user_id,
      pm.filename,
      pm.file_path,
      pm.file_size,
      pm.mime_type,
      CASE WHEN pm.mime_type ILIKE 'video/%' THEN 'video' ELSE 'image' END,
      pm.progress_type,
      pm.privacy_level,
      pm.description,
      COALESCE(pm.status, 'active'),
      COALESCE(pm.uploaded_at, now())
    FROM public.progress_media pm
    ON CONFLICT DO NOTHING;
  END IF;
END $$;