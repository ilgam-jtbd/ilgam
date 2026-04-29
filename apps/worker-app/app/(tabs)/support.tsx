// 문의 탭 — FAQ 아코디언 + 채널톡 진입 + 전화 안내 없음 (ADR-008)
// CX 응답은 Claude intent 분류 후 자동회신 OR 휴먼 에스컬레이션 (cx-triage)

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { colors, typography, spacing, touch, radius } from "@ilgam/design-tokens";

// ─── FAQ 데이터 (일감 실제 운영 시나리오 기반) ──────────────────────────
type FaqItem = {
  id: string;
  category: "정산" | "근무" | "계정" | "매칭";
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    id: "faq-01",
    category: "정산",
    q: "급여는 언제 입금되나요?",
    a: "근무를 마치고 고용주가 승인하면 평균 1시간 이내, 당일 안에 등록된 계좌로 입금됩니다. 토·일요일에도 당일 정산됩니다.",
  },
  {
    id: "faq-02",
    category: "정산",
    q: "수수료는 얼마인가요?",
    a: "플랫폼 수수료는 시급의 4%이며, 3.3% 원천징수 후 실수령액으로 입금됩니다. 세전 48,000원 기준 실수령 46,080원입니다.",
  },
  {
    id: "faq-03",
    category: "정산",
    q: "입금이 되지 않으면?",
    a: "고용주 승인이 늦어지는 경우가 대부분입니다. 근무 종료 후 2시간 경과 시에도 승인되지 않으면 채널톡으로 문의 주세요. 운영팀이 고용주에게 연락드립니다.",
  },
  {
    id: "faq-04",
    category: "근무",
    q: "당일 취소하고 싶어요.",
    a: "건강 악화 등 불가피한 사유라면 근무 시작 3시간 전까지 채널톡으로 알려주세요. 반복되면 매칭 점수에 반영될 수 있습니다.",
  },
  {
    id: "faq-05",
    category: "근무",
    q: "현장에서 예상과 다른 업무를 시키면?",
    a: "공고와 다른 업무를 강요받거나 부당 대우를 받으면 즉시 근무를 중단하시고 채널톡에 상황을 알려주세요. 해당 일감은 전액 지급되며 고용주 제재를 검토합니다.",
  },
  {
    id: "faq-06",
    category: "근무",
    q: "출퇴근 체크는 어떻게 하나요?",
    a: "현장에 도착해 앱에서 출근 버튼을 누르면 GPS와 QR로 확인됩니다. 퇴근도 동일하게 앱에서 체크하면 고용주 승인 화면으로 자동 전달됩니다.",
  },
  {
    id: "faq-07",
    category: "매칭",
    q: "알림이 오지 않아요.",
    a: "카카오톡 알림톡 수신 거부, 문자 스팸 차단, 앱 푸시 권한을 확인해주세요. 앱 설정 → 알림 권한 → 허용으로 변경하시면 됩니다.",
  },
  {
    id: "faq-08",
    category: "매칭",
    q: "나한테 맞는 일감이 잘 안 보여요.",
    a: "프로필 탭에서 자격증, 선호 업종, 활동 반경을 업데이트하면 맞춤 일감이 늘어납니다. 매일 오전 8시·오후 1시에 새 공고가 집중 등록됩니다.",
  },
  {
    id: "faq-09",
    category: "계정",
    q: "전화번호를 바꿨어요.",
    a: "프로필 → 연락처 변경에서 새 번호로 본인인증 후 수정할 수 있습니다. 휴대폰 교체 후 로그인 문제가 있다면 채널톡으로 도움을 요청해주세요.",
  },
  {
    id: "faq-10",
    category: "계정",
    q: "탈퇴하면 근무 기록은 어떻게 되나요?",
    a: "개인 식별 정보는 즉시 삭제되고, 근무·정산 기록은 법정 보관기간(5년)까지 익명화되어 보존됩니다. 재가입은 30일 후 가능합니다.",
  },
];

const CATEGORY_ORDER: FaqItem["category"][] = ["정산", "근무", "매칭", "계정"];

// ─── FAQ 카드 (아코디언) ───────────────────────────────────────────────
function FaqCard({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.q} ${open ? "닫기" : "펼치기"}`}
      onPress={() => setOpen(!open)}
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[200],
        minHeight: touch.minTargetSize,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: typography.sizes.base,
            color: colors.navy[800],
            fontWeight: "600",
            lineHeight: 26,
            marginRight: spacing.md,
          }}
        >
          {item.q}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.lg,
            color: colors.navy[600],
            fontWeight: "700",
          }}
        >
          {open ? "−" : "+"}
        </Text>
      </View>
      {open && (
        <Text
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.gray[100],
            fontSize: typography.sizes.sm,
            color: colors.gray[700],
            lineHeight: 24,
          }}
        >
          {item.a}
        </Text>
      )}
    </Pressable>
  );
}

// ─── 카테고리 섹션 헤더 ────────────────────────────────────────────────
function CategoryHeader({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: typography.sizes.sm,
        color: colors.gray[500],
        fontWeight: "700",
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Text>
  );
}

// ─── 메인 ──────────────────────────────────────────────────────────────
export default function SupportScreen() {
  const openChannelTalk = () => {
    // 실연동 시 ChannelIO.open() 사용 (@channel.io/react-native-channel-plugin)
    Alert.alert(
      "채널톡 상담",
      "실시간 상담원이 평일 09:00–18:00, 주말 10:00–16:00 답변합니다.\n\n연동 완료 후 바로 열립니다.",
      [{ text: "확인" }]
    );
  };

  const openKakaoHelp = () => {
    Linking.openURL("https://pf.kakao.com/_ilgamhelp").catch(() => {
      Alert.alert("카카오톡 채널", "카카오톡 앱이 설치되어 있지 않습니다.");
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.gray[50] }}
      contentContainerStyle={{ paddingBottom: touch.bottomSafeZoneHeight + spacing.xxl }}
    >
      {/* 상단 안내 */}
      <View
        style={{
          padding: spacing.xl,
          backgroundColor: colors.navy[50],
          borderBottomWidth: 1,
          borderBottomColor: colors.navy[100],
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.lg,
            color: colors.navy[800],
            fontWeight: "700",
            marginBottom: spacing.xs,
          }}
        >
          무엇을 도와드릴까요?
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[700],
            lineHeight: 22,
          }}
        >
          자주 묻는 질문을 먼저 살펴보시고,{"\n"}
          해결되지 않으면 아래 채널톡으로 문의해주세요.
        </Text>
      </View>

      {/* 주요 문의 CTA */}
      <View style={{ flexDirection: "row", gap: spacing.md, padding: spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="채널톡 상담 열기"
          onPress={openChannelTalk}
          style={{
            flex: 1,
            backgroundColor: colors.navy[700],
            borderRadius: radius.md,
            paddingVertical: spacing.lg,
            alignItems: "center",
            minHeight: touch.buttonHeight,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: typography.sizes.base, color: colors.white, fontWeight: "700" }}>
            채널톡 상담
          </Text>
          <Text style={{ fontSize: typography.sizes.xs, color: colors.navy[100], marginTop: 2 }}>
            평균 3분 이내 답변
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="카카오톡 채널 열기"
          onPress={openKakaoHelp}
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            paddingVertical: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.navy[300],
            minHeight: touch.buttonHeight,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: typography.sizes.base, color: colors.navy[700], fontWeight: "700" }}>
            카카오톡 채널
          </Text>
          <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500], marginTop: 2 }}>
            알림톡·공지 수신
          </Text>
        </Pressable>
      </View>

      {/* FAQ 카테고리별 */}
      {CATEGORY_ORDER.map((cat) => {
        const items = FAQS.filter((f) => f.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat}>
            <CategoryHeader label={cat} />
            {items.map((item) => (
              <FaqCard key={item.id} item={item} />
            ))}
          </View>
        );
      })}

      {/* 긴급 안내 */}
      <View
        style={{
          marginHorizontal: spacing.lg,
          marginTop: spacing.xl,
          padding: spacing.lg,
          borderRadius: radius.md,
          backgroundColor: "#FDECEA",
          borderWidth: 1,
          borderColor: colors.danger,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.danger,
            fontWeight: "700",
            marginBottom: spacing.xs,
          }}
        >
          급여 미지급·부당 대우·신고
        </Text>
        <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[800], lineHeight: 22 }}>
          위와 같은 긴급 상황은 채널톡으로 알려주시면 즉시 운영팀에 연결됩니다.
          전화 상담은 운영하지 않습니다.
        </Text>
      </View>
    </ScrollView>
  );
}
