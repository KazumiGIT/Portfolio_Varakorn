-- Avatar uploads. The bucket is public to read (profile photos show next to
-- comments), but a signed in visitor may only write inside a folder named
-- after their own uid, so nobody can overwrite anyone else's face.
-- Applied by scripts/comments-db.mjs setup.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "avatars are readable by anyone" on storage.objects;
create policy "avatars are readable by anyone"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "own avatar insert" on storage.objects;
create policy "own avatar insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "own avatar update" on storage.objects;
create policy "own avatar update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "own avatar delete" on storage.objects;
create policy "own avatar delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
