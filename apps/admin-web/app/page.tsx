import Image from "next/image";
import Link from "next/link";
import { colors, spacing, typography } from "@ilgam/design-tokens";

// SEO: 마케팅 랜딩 — H1/H2 에 주요 키워드 자연 배치
// 참고: 네이버 데이터랩·구글 트렌드 시니어 알바 카테고리 키워드

export const metadata = {
  title: "시니어 단기알바·동네알바 매칭 | 5070 당일정산",
  description:
    "50대·60대·70대 시니어와 중장년을 위한 단기알바 플랫폼. 내 주변 동네알바, 당일 정산, 유연근무.",
};

export default function MarketingHome() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: spacing.xxxl,
        color: colors.gray[900],
        fontSize: typography.sizes.base,
        lineHeight: typography.lineHeight,
      }}
    >
      <header
        style={{
          marginBottom: spacing.xxxl,
          display: "flex",
          alignItems: "center",
          gap: spacing.lg,
        }}
      >
        <Image
          src="/logo.png"
          alt="일감 로고 — 시니어 단기알바 플랫폼"
          width={80}
          height={80}
          priority
          style={{ borderRadius: 16 }}
        />
        <div>
          <h1
            style={{
              fontSize: typography.sizes.xxl,
              color: colors.navy[700],
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            일감
          </h1>
          <p style={{ color: colors.gray[600], marginTop: spacing.xs, margin: 0 }}>
            시니어·중장년을 위한 단기알바·동네알바 매칭 플랫폼
          </p>
        </div>
      </header>

      <section style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          50대·60대·70대 시니어 단기알바, 내 주변에서 바로
        </h2>
        <p style={{ color: colors.gray[700] }}>
          베이비부머 2차 세대(4060)와 70대 액티브 시니어를 합쳐 1,200만 명에 달하는 풍부한 경험을 필요로 하는 기업과 매칭합니다. 하루·반나절·주말 단기알바부터 동네알바까지, 시간과 거리를 맞춰 찾아드립니다. 일한 날{" "}
          <strong>당일 정산</strong>, 복잡한 서류 없이 모바일로 끝.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: spacing.xl,
          marginBottom: spacing.xxxl,
        }}
      >
        <div
          style={{
            padding: spacing.xl,
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
          }}
        >
          <h3 style={{ fontSize: typography.sizes.md, color: colors.navy[800], marginTop: 0 }}>
            구인 기업
          </h3>
          <p style={{ color: colors.gray[700] }}>
            검증된 중장년 워커 풀에 공고를 올리고 매칭부터 정산까지 대시보드에서 한번에. 당일 필요한 인력도 빠르게 모십니다.
          </p>
          <Link
            href="/auth/login"
            aria-label="구인 기업 로그인"
            style={{
              display: "inline-block",
              marginTop: spacing.md,
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: colors.navy[700],
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            기업 로그인 →
          </Link>
        </div>

        <div
          style={{
            padding: spacing.xl,
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: 12,
          }}
        >
          <h3 style={{ fontSize: typography.sizes.md, color: colors.navy[800], marginTop: 0 }}>
            시니어 근로자
          </h3>
          <p style={{ color: colors.gray[700] }}>
            내 주변 동네알바를 스마트폰으로 확인하고 바로 지원. 출퇴근 인증·평가·정산이 앱 한 곳에서 끝납니다. 용돈벌이부터 유연근무까지.
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: spacing.md,
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: colors.gray[100],
              color: colors.gray[700],
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Android·iOS 앱 출시 예정
          </span>
        </div>
      </section>

      <section style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          왜 일감인가
        </h2>
        <ul style={{ color: colors.gray[700], paddingLeft: spacing.xl }}>
          <li>
            <strong>시니어 UX 기준</strong> — 18pt 큰 글씨, 48dp 큰 버튼, WCAG AAA 7:1 대비. 스마트폰이 낯선 분도 편하게.
          </li>
          <li>
            <strong>당일 정산</strong> — PortOne 에스크로 연동. 일 끝나면 바로 지급, 미지급 걱정 없음.
          </li>
          <li>
            <strong>내 주변 동네 매칭</strong> — 법정동 단위 정밀 매칭. 먼 거리 헛걸음 없음.
          </li>
          <li>
            <strong>검증된 중장년 워커</strong> — 자격증·멘토 태그·평판 기반. 경험이 신뢰입니다.
          </li>
        </ul>
      </section>

      <section aria-label="자주 묻는 질문" style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ fontSize: typography.sizes.lg, color: colors.navy[800] }}>
          자주 묻는 질문
        </h2>
        <details style={{ marginBottom: spacing.md }}>
          <summary style={{ cursor: "pointer", color: colors.navy[700], fontWeight: 600 }}>
            일감은 어떤 알바를 찾을 수 있나요?
          </summary>
          <p style={{ color: colors.gray[700], marginTop: spacing.sm }}>
            물류·외식·청소·유통·돌봄·농업 등 시니어가 강점을 가진 단기·당일·반나절 알바 중심입니다. 무거운 짐이 없고 앉아서 가능한 일감도 별도 분류해 보여드립니다.
          </p>
        </details>
        <details style={{ marginBottom: spacing.md }}>
          <summary style={{ cursor: "pointer", color: colors.navy[700], fontWeight: 600 }}>
            정산은 얼마나 빨리 되나요?
          </summary>
          <p style={{ color: colors.gray[700], marginTop: spacing.sm }}>
            일을 마치고 출퇴근 인증이 완료되면 같은 날 당일 정산됩니다. 플랫폼은 통신판매중개업 에스크로 모델로 돈을 보유하지 않아 안전합니다.
          </p>
        </details>
        <details>
          <summary style={{ cursor: "pointer", color: colors.navy[700], fontWeight: 600 }}>
            기존 구인구직 플랫폼과 뭐가 다른가요?
          </summary>
          <p style={{ color: colors.gray[700], marginTop: spacing.sm }}>
            일감은 <strong>50대·60대·70대 시니어·중장년에 특화</strong>된 스팟워크 플랫폼입니다. 큰 글씨·큰 버튼 UX, 당일 정산, 검증된 워커 풀, 공공 파트너십(서울시 50플러스·노인일자리여기)이 차별점입니다.
          </p>
        </details>
      </section>

      <footer style={{ color: colors.gray[500], fontSize: typography.sizes.sm }}>
        © 2026 ILGAM · 통신판매중개업 · 시니어 단기알바·동네알바 플랫폼
      </footer>
    </main>
  );
}
