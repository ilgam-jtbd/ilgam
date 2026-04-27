// RSC · 공고 등록 폼
// Server Action 으로 제출 (client-side JS 불필요) — 고령 고용주도 저대역폭 환경에서 안정
// RLS 가 employer_id 권한 강제 — UI 에 나오지 않는 employer 는 insert 실패

import { redirect } from "next/navigation";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";
import { getServerSupabase } from "@/lib/supabase-server";
import { createJob } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type EmployerOption = { id: string; biz_name: string };

async function listEmployers(): Promise<EmployerOption[]> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS 가 employer_members 로 필터링 — 본인 소속 사업체만 반환
  const { data } = await supabase.from("employers").select("id, biz_name").order("biz_name");
  return (data ?? []) as EmployerOption[];
}

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: `${spacing.md}px ${spacing.lg}px`,
  border: `1px solid ${colors.gray[300]}`,
  borderRadius: 8,
  fontSize: typography.sizes.base,
  color: colors.gray[900],
  boxSizing: "border-box",
  outline: "none",
  minHeight: 48,
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: typography.sizes.sm,
  color: colors.gray[700],
  marginBottom: spacing.sm,
  fontWeight: 600,
};

type Search = { error?: string };

export default async function NewJobPage(props: { searchParams: Promise<Search> }) {
  const searchParams = await props.searchParams;
  const employers = await listEmployers();

  return (
    <section style={{ maxWidth: 720 }}>
      <header style={{ marginBottom: spacing.xl }}>
        <h1 style={{ fontSize: typography.sizes.xl, color: colors.navy[800], margin: 0 }}>
          새 공고 등록
        </h1>
        <p style={{ color: colors.gray[600], margin: `${spacing.xs}px 0 0` }}>
          시급은 2026 최저임금 ₩10,030 이상이어야 합니다.
        </p>
      </header>

      {searchParams.error ? (
        <div
          role="alert"
          style={{
            padding: spacing.md,
            background: "#FFF3CD",
            border: "1px solid #F0AD4E",
            borderRadius: 8,
            marginBottom: spacing.lg,
            color: "#856404",
          }}
        >
          {searchParams.error}
        </div>
      ) : null}

      {employers.length === 0 ? (
        <div
          style={{
            padding: spacing.xxl,
            background: colors.gray[50],
            borderRadius: 8,
            color: colors.gray[700],
          }}
        >
          소속 사업체가 없습니다. 관리자에게 초대를 요청하세요.
        </div>
      ) : (
        <form action={createJob} style={{ display: "grid", gap: spacing.lg }}>
          <div>
            <label htmlFor="employer_id" style={labelBase}>
              사업체
            </label>
            <select id="employer_id" name="employer_id" required style={inputBase}>
              {employers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.biz_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" style={labelBase}>
              공고 제목
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={60}
              placeholder="예: 마포구 물류센터 하루 알바"
              style={inputBase}
            />
          </div>

          <div>
            <label htmlFor="dong_code" style={labelBase}>
              법정동 코드 (10자리)
            </label>
            <input
              id="dong_code"
              name="dong_code"
              required
              pattern="[0-9]{10}"
              placeholder="1144010200"
              style={inputBase}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            <div>
              <label htmlFor="shift_start_at" style={labelBase}>
                시작 일시
              </label>
              <input
                id="shift_start_at"
                name="shift_start_at"
                type="datetime-local"
                required
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="shift_end_at" style={labelBase}>
                종료 일시
              </label>
              <input
                id="shift_end_at"
                name="shift_end_at"
                type="datetime-local"
                required
                style={inputBase}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            <div>
              <label htmlFor="hourly_wage_krw" style={labelBase}>
                시급 (원)
              </label>
              <input
                id="hourly_wage_krw"
                name="hourly_wage_krw"
                type="number"
                min={10030}
                step={10}
                required
                placeholder="10030"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="headcount" style={labelBase}>
                모집 인원
              </label>
              <input
                id="headcount"
                name="headcount"
                type="number"
                min={1}
                defaultValue={1}
                required
                style={inputBase}
              />
            </div>
          </div>

          <div>
            <label htmlFor="required_cert_codes" style={labelBase}>
              필수 자격 (쉼표 구분, 선택)
            </label>
            <input
              id="required_cert_codes"
              name="required_cert_codes"
              placeholder="forklift, food_hygiene"
              style={inputBase}
            />
          </div>

          <div>
            <label htmlFor="preferred_mentor_tags" style={labelBase}>
              선호 멘토 태그 (쉼표 구분, 선택)
            </label>
            <input
              id="preferred_mentor_tags"
              name="preferred_mentor_tags"
              placeholder="logistics, senior_friendly"
              style={inputBase}
            />
          </div>

          <div>
            <label htmlFor="description" style={labelBase}>
              업무 설명 (선택)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              style={{ ...inputBase, minHeight: 120, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.md }}>
            <button
              type="submit"
              style={{
                padding: `${spacing.md}px ${spacing.xl}px`,
                background: colors.navy[700],
                color: colors.white,
                border: "none",
                borderRadius: 8,
                fontSize: typography.sizes.base,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              등록하기
            </button>
            <Link
              href="/jobs"
              style={{
                padding: `${spacing.md}px ${spacing.xl}px`,
                background: colors.white,
                color: colors.gray[700],
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                minHeight: 48,
              }}
            >
              취소
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
