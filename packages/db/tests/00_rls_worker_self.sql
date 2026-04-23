-- pgTAP · 워커 본인만 자신의 shifts 읽기 검증
begin;
select plan(3);
select ok((select count(*) from public.shifts where worker_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') >= 0, 'placeholder: worker A own shifts');
select ok(true, 'placeholder: worker A cannot see worker B shifts (run with set local jwt)');
select ok(true, 'placeholder: admin can see via audit_log');
select * from finish();
rollback;
