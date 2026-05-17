-- Migration 0008 — employer-docs Storage 버킷 + RLS
-- 구인자 사업자등록증 업로드용 private 버킷

-- ─── 버킷 생성 ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employer-docs',
  'employer-docs',
  false,                         -- private (서명된 URL로만 접근)
  5242880,                       -- 5 MB 제한
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do nothing;

-- ─── RLS: 본인만 업로드·조회 ────────────────────────────────
create policy "employer_docs_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'employer-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "employer_docs_select"
  on storage.objects for select
  using (
    bucket_id = 'employer-docs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or app.is_platform_admin()
    )
  );

create policy "employer_docs_delete"
  on storage.objects for delete
  using (
    bucket_id = 'employer-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
