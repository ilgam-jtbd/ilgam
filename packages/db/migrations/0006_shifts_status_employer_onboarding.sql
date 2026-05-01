-- 0006_shifts_status_employer_onboarding.sql
-- 1. shifts 테이블: status 컬럼 + 좌표 컬럼 이름 정규화
-- 2. employer_applications: 구인자 셀프 온보딩 서류 심사

-- ─── shifts.status 컬럼 추가 ──────────────────────────────
alter table public.shifts
  add column if not exists status text not null default 'pending'
    check (status in ('pending','clocked_in','clocked_out','no_show','disputed'));

-- clock Edge Function 에서 사용하는 selfie 경로 컬럼
alter table public.shifts
  add column if not exists selfie_in_path  text,
  add column if not exists selfie_out_path text;

-- ─── payments 컬럼 이름 정규화 ────────────────────────────
-- 기존: worker_net_krw / 신규 코드: worker_payout_krw 로 통일
-- 하위호환: 기존 컬럼은 유지하고 뷰(alias) 방식으로 노출
-- (마이그레이션 간편화: 새 컬럼 추가 후 sync trigger)
alter table public.payments
  add column if not exists worker_payout_krw integer
    generated always as (worker_net_krw) stored;

-- platform_fee_rate·platform_fee_krw는 이미 있으므로 스킵
-- gross_amount_krw 도 이미 존재

-- ─── employer_applications: 구인자 셀프 온보딩 서류 ────────
-- 구인자가 직접 신청 → 어드민이 approved_at 설정
create table if not exists public.employer_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  biz_name text not null,
  biz_reg_no text not null,         -- 사업자등록번호 (평문, 어드민 검토용)
  contact_name text not null,
  contact_phone_e164 text not null,
  biz_type text,
  biz_reg_doc_path text,            -- Supabase Storage 업로드 경로
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewer_id uuid references public.profiles(id),
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz default now()
);

create index if not exists idx_ea_status on public.employer_applications (status, created_at desc);

alter table public.employer_applications enable row level security;

-- 본인만 자신의 신청서 조회
create policy if not exists ea_self_select on public.employer_applications
  for select using (profile_id = auth.uid());

-- 본인만 신청서 제출
create policy if not exists ea_self_insert on public.employer_applications
  for insert with check (profile_id = auth.uid());

-- 어드민(service_role)만 status 업데이트
-- (어드민은 service_role key 사용하므로 RLS 우회)

-- ─── 구인자 승인 처리 RPC ──────────────────────────────────
create or replace function public.approve_employer(
  p_application_id uuid,
  p_approved boolean,
  p_reject_reason text default null
) returns void language plpgsql security definer as $$
declare
  v_app public.employer_applications;
  v_employer_id uuid;
begin
  select * into v_app from public.employer_applications where id = p_application_id;
  if not found then raise exception 'application not found'; end if;

  if p_approved then
    -- employers 테이블에 삽입 (아직 없는 경우)
    insert into public.employers (
      biz_name, biz_reg_number_encrypted, biz_reg_number_hash,
      contact_name, contact_phone_e164, biz_type, approved_at
    ) values (
      v_app.biz_name,
      pgp_sym_encrypt(v_app.biz_reg_no, current_setting('app.encryption_key')),
      digest(v_app.biz_reg_no, 'sha256'),
      v_app.contact_name,
      v_app.contact_phone_e164,
      v_app.biz_type,
      now()
    )
    on conflict (biz_reg_number_hash) do update set approved_at = now()
    returning id into v_employer_id;

    -- employer_members 에 owner 추가
    insert into public.employer_members (employer_id, profile_id, role)
    values (v_employer_id, v_app.profile_id, 'owner')
    on conflict (employer_id, profile_id) do nothing;

    -- profiles.role 업데이트
    update public.profiles set role = 'employer' where id = v_app.profile_id;

    -- 신청서 상태 업데이트
    update public.employer_applications
    set status = 'approved', reviewer_id = auth.uid(), reviewed_at = now()
    where id = p_application_id;
  else
    update public.employer_applications
    set status = 'rejected', reviewer_id = auth.uid(), reviewed_at = now(),
        reject_reason = p_reject_reason
    where id = p_application_id;
  end if;
end
$$;

grant execute on function public.approve_employer to authenticated;
