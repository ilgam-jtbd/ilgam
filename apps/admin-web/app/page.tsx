// 마케팅 홈 — YJKim 디자인 시스템 v1.0

export default function MarketingHome() {
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "3rem",
        color: "#0d1b2a",
      }}
    >
      {/* Hero */}
      <header
        style={{
          background: "#0d1b2a",
          borderRadius: "12px",
          padding: "3rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#2dd4bf",
            marginBottom: "1rem",
          }}
        >
          Senior Spotwork Platform · Korea
        </div>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "0.8rem",
          }}
        >
          일감
        </h1>
        <p
          style={{
            color: "#718096",
            fontSize: "0.9rem",
            lineHeight: 1.65,
            maxWidth: "480px",
          }}
        >
          베이비부머 2차(1964~1974년생, 954만 명)를 위한 한국형 스팟워크 플랫폼.
          수수료 15~20% · 공공 MOU · SMS 3중 UX.
        </p>

        {/* 지표 */}
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "5,000", lbl: "목표 워커 (M3)" },
            { num: "1,500+", lbl: "월 완료 매칭" },
            { num: "18%", lbl: "수수료율" },
            { num: "9~12개월", lbl: "진입 창문" },
          ].map(({ num, lbl }) => (
            <div key={lbl}>
              <div
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.6rem",
                  color: "#c9a84c",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.62rem",
                  color: "#718096",
                  letterSpacing: "0.1em",
                  marginTop: "0.2rem",
                }}
              >
                {lbl}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* 구인자 로그인 카드 */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderLeft: "3px solid #c9a84c",
          borderRadius: "12px",
          padding: "1.8rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#2dd4bf",
            marginBottom: "0.6rem",
          }}
        >
          Employer Login
        </div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.2rem",
            color: "#0d1b2a",
            marginBottom: "0.5rem",
          }}
        >
          구인자 어드민
        </h2>
        <p style={{ color: "#4a5568", fontSize: "0.82rem", marginBottom: "1.2rem" }}>
          공고 등록, 지원자 관리, 근무 승인, 급여 정산을 한 화면에서 처리하십시오.
        </p>
        <a
          href="/jobs"
          style={{
            display: "inline-block",
            background: "#c9a84c",
            color: "#0d1b2a",
            borderRadius: "8px",
            padding: "0.6rem 1.4rem",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          대시보드 입장
        </a>
      </div>
    </main>
  );
}
