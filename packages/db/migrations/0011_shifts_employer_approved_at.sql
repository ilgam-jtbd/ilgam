-- Migration 0011 — shifts.employer_approved_at + no-show manual action support

-- 구인자가 완료 근무를 승인하는 타임스탬프
alter table public.shifts
  add column if not exists employer_approved_at timestamptz;

create index if not exists idx_shifts_employer_approved
  on public.shifts (employer_approved_at)
  where employer_approved_at is not null;

-- 어드민이 수동으로 노쇼 처리할 수 있는 RPC (서비스 롤 경유)
create or replace function public.mark_no_show(p_shift_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.shifts
  set status = 'no_show'
  where id = p_shift_id
    and status in ('pending', 'clocked_in');
end;
$$;
