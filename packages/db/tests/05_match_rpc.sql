-- 05_match_rpc.sql · match_jobs_for_worker RPC 존재 + 실행 확인
-- 2 assert: 함수 존재 · authenticated 에 execute 권한

begin;
select plan(2);

-- ── 함수 존재 ───────────────────────────────────────────
select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'match_jobs_for_worker'
  ),
  'public.match_jobs_for_worker(uuid, int) 함수 존재'
);

-- ── authenticated 실행 권한 ────────────────────────────
select ok(
  has_function_privilege(
    'authenticated',
    'public.match_jobs_for_worker(uuid, int)',
    'EXECUTE'
  ),
  'authenticated: match_jobs_for_worker 실행 권한'
);

select * from finish();
rollback;
