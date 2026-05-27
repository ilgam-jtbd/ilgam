-- B2B 프로젝트 인테이크 + 수동 매칭 운영 테이블
-- platform-web에서 접수된 기업 요청을 어드민이 수동으로 전문가에 배정

CREATE TABLE IF NOT EXISTS public.b2b_inquiries (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        TEXT        NOT NULL,
  contact_name        TEXT,
  contact_email       TEXT,
  contact_phone       TEXT,
  industry            TEXT,
  project_title       TEXT        NOT NULL,
  description         TEXT,
  budget_krw          INTEGER,    -- 만원 단위
  duration            TEXT,
  skills              TEXT[]      DEFAULT '{}',
  urgent              BOOLEAN     DEFAULT FALSE,
  nda_required        BOOLEAN     DEFAULT FALSE,
  status              TEXT        NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','reviewing','matched','contracted','completed','closed')),
  admin_notes         TEXT,
  contract_amount_krw INTEGER,    -- 실제 계약금액 (만원)
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.b2b_assignments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id   UUID        NOT NULL REFERENCES public.b2b_inquiries(id) ON DELETE CASCADE,
  expert_name  TEXT        NOT NULL,
  expert_title TEXT,
  note         TEXT,
  assigned_by  TEXT        DEFAULT 'admin',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_inquiries_updated_at ON public.b2b_inquiries;
CREATE TRIGGER trg_b2b_inquiries_updated_at
  BEFORE UPDATE ON public.b2b_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_b2b_inquiries_status   ON public.b2b_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_b2b_inquiries_created  ON public.b2b_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_assignments_inquiry ON public.b2b_assignments (inquiry_id);

-- RLS
ALTER TABLE public.b2b_inquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_assignments ENABLE ROW LEVEL SECURITY;

-- 어드민(service_role)만 접근 — Phase 0 수동 운영
CREATE POLICY "service_role_b2b_inquiries"
  ON public.b2b_inquiries FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_b2b_assignments"
  ON public.b2b_assignments FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- 시드 데이터 (데모용 — 투자자 IR 스크린샷용)
INSERT INTO public.b2b_inquiries
  (company_name, contact_name, contact_email, industry, project_title, description, budget_krw, duration, skills, urgent, nda_required, status, contract_amount_krw)
VALUES
  ('STX조선해양', '이상훈 부장', 'lee@stx.com', 'shipbuilding',
   '중동 LNG 선박 수주 협상 기술 자문',
   '카타르 에너지사와의 LNG 선박 수주 협상에서 기술 검토 및 가격 협상 전략 자문',
   500, '2주', ARRAY['선박 수주','LNG 기술','중동 영업'], TRUE, TRUE, 'contracted', 480),
  ('메디컬AI 스타트업', '박지현 대표', 'park@medai.io', 'healthcare',
   'Series A 투자 IR 자료 검토 및 피칭 코칭',
   '글로벌 VC 대상 Series A IR 자료 검토 및 피칭 시뮬레이션 코칭',
   200, '1주', ARRAY['IR 전략','투자 유치','헬스케어'], FALSE, TRUE, 'completed', 200),
  ('코스맥스바이오', '김태민 팀장', 'kim@cosmax.com', 'healthcare',
   'FDA 510(k) 허가 전략 자문',
   '피부 진단 AI 디바이스의 미국 FDA 510(k) 허가 전략 수립 및 서류 검토',
   1500, '1개월', ARRAY['FDA 허가','510(k)','의료기기'], FALSE, TRUE, 'matched', NULL),
  ('핀테크 스타트업', '정수빈 CTO', 'chung@fintech.io', 'finance',
   '글로벌 SaaS 기업과의 기술 파트너십 협상',
   'Salesforce, HubSpot 등 글로벌 SaaS 플랫폼과의 파트너십 계약 협상 전략 및 계약 검토',
   300, '3일', ARRAY['BD','SaaS','기술 협상'], TRUE, FALSE, 'reviewing', NULL),
  ('한화에너지', '오민준 상무', 'oh@hanwha.com', 'energy',
   '베트남 태양광 JV 설립 현지 규제 자문',
   '베트남 정부 인허가 및 현지 파트너 협상 지원',
   800, '3주', ARRAY['JV 설립','베트남','에너지 규제'], FALSE, TRUE, 'new', NULL)
ON CONFLICT DO NOTHING;
