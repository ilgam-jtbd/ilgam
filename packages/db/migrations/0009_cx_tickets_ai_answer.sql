-- Migration 0009 — cx_tickets에 ai_answer 컬럼 추가
-- cx-triage auto_answer 시 실제 답변 텍스트 저장

alter table public.cx_tickets
  add column if not exists ai_answer text;
