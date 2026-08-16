-- Stage 6: private application documents backed by Supabase Storage.

update public.documents
set document_type = 'other'
where document_type not in (
  'resume',
  'cover_letter',
  'technical_challenge',
  'portfolio',
  'certificate',
  'other'
);

alter table public.documents
  add column original_name text,
  add column mime_type text,
  add column file_size bigint,
  add column updated_at timestamptz;

update public.documents
set
  original_name = name,
  mime_type = case
    when lower(name) like '%.docx'
      then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    else 'application/pdf'
  end,
  file_size = 1,
  updated_at = created_at;

alter table public.documents
  alter column original_name set not null,
  alter column mime_type set not null,
  alter column file_size set not null,
  alter column updated_at set not null,
  alter column updated_at set default now(),
  add constraint documents_storage_path_key unique (storage_path),
  add constraint documents_original_name_check check (
    char_length(trim(original_name)) between 1 and 255
    and original_name !~ '[[:cntrl:]]'
  ),
  add constraint documents_name_control_chars_check check (
    name !~ '[[:cntrl:]]'
  ),
  add constraint documents_document_type_check check (
    document_type in (
      'resume',
      'cover_letter',
      'technical_challenge',
      'portfolio',
      'certificate',
      'other'
    )
  ),
  add constraint documents_mime_type_check check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  add constraint documents_file_size_check check (
    file_size between 1 and 10485760
  ),
  add constraint documents_storage_path_owner_check check (
    storage_path like user_id::text || '/' || application_id::text || '/%'
    and position('..' in storage_path) = 0
    and storage_path ~ '\.(pdf|docx)$'
  );

create trigger documents_set_updated_at
before update on public.documents
for each row execute function private.set_updated_at();

create index documents_application_created_at_idx
  on public.documents (application_id, created_at desc);

create index documents_user_type_idx
  on public.documents (user_id, document_type);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'application-documents',
  'application-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "application_documents_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'application-documents'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.id::text = (storage.foldername(name))[2]
  )
);

create policy "application_documents_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'application-documents'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.id::text = (storage.foldername(name))[2]
  )
);

create policy "application_documents_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'application-documents'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.id::text = (storage.foldername(name))[2]
  )
)
with check (
  bucket_id = 'application-documents'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.id::text = (storage.foldername(name))[2]
  )
);

create policy "application_documents_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'application-documents'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.id::text = (storage.foldername(name))[2]
  )
);

revoke update on public.documents from authenticated;
grant update (name) on public.documents to authenticated;
