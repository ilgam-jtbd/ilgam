-- Migration 0010 — 리뷰 후 workers.rating_avg 자동 갱신 트리거

create or replace function public.refresh_worker_rating()
returns trigger language plpgsql security definer as $$
declare
  v_worker_id uuid;
begin
  -- reviews.shift_id → shifts.worker_id 경유
  select s.worker_id into v_worker_id
  from public.shifts s
  where s.id = coalesce(NEW.shift_id, OLD.shift_id);

  if v_worker_id is null then return coalesce(NEW, OLD); end if;

  update public.workers
  set rating_avg = (
    select round(avg(r.rating)::numeric, 2)
    from public.reviews r
    join public.shifts s on s.id = r.shift_id
    where s.worker_id = v_worker_id
      and r.author_role = 'employer'
  )
  where id = v_worker_id;

  return coalesce(NEW, OLD);
end;
$$;

create trigger trg_refresh_worker_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_worker_rating();
