// 내 프로필 — 기본 정보 + 자격증·선호 업종·활동 반경 (매칭 품질에 직접 영향)
// ADR-003: 18pt 기본 · 48dp 터치 · 시니어 UX
// 실연동 시 supabase.from("workers").select() + update (ADR-004)

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { colors, typography, spacing, radius, touch } from "@ilgam/design-tokens";
import type { JobCategory } from "@ilgam/core";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_EMOJI } from "@ilgam/core";

// ─── 프로필 데이터 ─────────────────────────────────────────────────────
const PROFILE = {
  display_name: "김영자",
  phone_e164: "+821012345678",
  birth_year: 1958, // 만 68세
  home_dong_label: "서울 강서구 마곡동",
  rating_avg: 4.8,
  total_shifts: 124,
  no_show_count: 0,
  joined_at: "2025-09-14",
};

// 자격증 목록 (워커-앱 선택용 · 실연동 시 certs 마스터 테이블)
const AVAILABLE_CERTS = [
  { code: "CDL_1", label: "1종 보통 운전면허" },
  { code: "FOOD_HYGIENE", label: "조리사 자격증" },
  { code: "CARE_1", label: "요양보호사 1급" },
  { code: "CLEAN", label: "건물위생관리사" },
  { code: "HACCP", label: "식품위생관리사" },
  { code: "FORKLIFT", label: "지게차 운전" },
];

// ─── 섹션 ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: typography.sizes.sm,
          color: colors.gray[500],
          fontWeight: "700",
          letterSpacing: 0.5,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.gray[200],
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        minHeight: touch.minTargetSize,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}
    >
      <Text style={{ fontSize: typography.sizes.base, color: colors.gray[700] }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.navy[800],
            fontWeight: "600",
          }}
        >
          {value}
        </Text>
        {onPress && (
          <Text style={{ fontSize: typography.sizes.base, color: colors.gray[400] }}>›</Text>
        )}
      </View>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

// ─── 토글 칩 ──────────────────────────────────────────────────────────
function Chip({
  label,
  active,
  onPress,
  emoji,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} ${active ? "선택됨" : "선택 안됨"}`}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
        backgroundColor: active ? colors.navy[700] : colors.white,
        borderWidth: 1,
        borderColor: active ? colors.navy[700] : colors.gray[300],
        minHeight: touch.minTargetSize,
      }}
    >
      {emoji && <Text style={{ fontSize: 16, marginRight: 6 }}>{emoji}</Text>}
      <Text
        style={{
          fontSize: typography.sizes.sm,
          color: active ? colors.white : colors.gray[700],
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();

  const [certs, setCerts] = useState<string[]>(["CARE_1"]);
  const [categories, setCategories] = useState<JobCategory[]>(["food", "cleaning", "retail"]);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [notifyAlimtalk, setNotifyAlimtalk] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  const toggleCert = (code: string) => {
    setCerts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };
  const toggleCategory = (cat: JobCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "일감 앱에서 로그아웃할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          // 실연동: supabase.auth.signOut() + router.replace('/')
          Alert.alert("로그아웃되었습니다");
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      "회원 탈퇴",
      "탈퇴하면 개인 정보는 즉시 삭제되고, 근무 기록은 법정 보관기간(5년)까지 익명화되어 보존됩니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "문의로 진행", onPress: () => router.push("/(tabs)/support") },
      ]
    );
  };

  const age = new Date().getFullYear() - PROFILE.birth_year;

  return (
    <>
      <Stack.Screen options={{ title: "내 프로필" }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.gray[50] }}
        contentContainerStyle={{ paddingVertical: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        {/* 상단 요약 */}
        <View
          style={{
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
            padding: spacing.xl,
            borderRadius: radius.lg,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.gray[200],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: typography.sizes.xl,
                  color: colors.navy[800],
                  fontWeight: "700",
                }}
              >
                {PROFILE.display_name}
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  marginTop: 2,
                }}
              >
                만 {age}세 · {PROFILE.home_dong_label}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.navy[50],
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.sm,
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  color: colors.navy[700],
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                ★ {PROFILE.rating_avg.toFixed(1)}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: colors.gray[100],
              paddingTop: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
                누적 근무
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: colors.navy[800],
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {PROFILE.total_shifts}회
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
                노쇼
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: PROFILE.no_show_count === 0 ? colors.success : colors.danger,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {PROFILE.no_show_count}회
              </Text>
            </View>
          </View>
        </View>

        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Row label="전화번호" value="010-1234-5678" onPress={() => {}} />
          <Row label="집 주소" value={PROFILE.home_dong_label} onPress={() => {}} />
          <Row label="가입일" value={PROFILE.joined_at} />
        </Section>

        {/* 자격증 */}
        <Section title="자격증 (매칭 우선 반영)">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.sm,
              padding: spacing.lg,
            }}
          >
            {AVAILABLE_CERTS.map((c) => (
              <Chip
                key={c.code}
                label={c.label}
                active={certs.includes(c.code)}
                onPress={() => toggleCert(c.code)}
              />
            ))}
          </View>
        </Section>

        {/* 선호 업종 */}
        <Section title="선호 업종">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.sm,
              padding: spacing.lg,
            }}
          >
            {(Object.keys(JOB_CATEGORY_LABEL) as JobCategory[]).map((cat) => (
              <Chip
                key={cat}
                label={JOB_CATEGORY_LABEL[cat]}
                emoji={JOB_CATEGORY_EMOJI[cat]}
                active={categories.includes(cat)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </View>
        </Section>

        {/* 활동 반경 */}
        <Section title="활동 반경">
          <View style={{ padding: spacing.lg }}>
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.navy[800],
                fontWeight: "700",
                marginBottom: spacing.md,
              }}
            >
              집에서 {radiusKm}km 이내
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {[1, 3, 5, 10].map((km) => (
                <Chip
                  key={km}
                  label={`${km}km`}
                  active={radiusKm === km}
                  onPress={() => setRadiusKm(km)}
                />
              ))}
            </View>
          </View>
        </Section>

        {/* 알림 설정 */}
        <Section title="알림">
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.lg,
              minHeight: touch.minTargetSize,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[100],
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.base, color: colors.gray[800] }}>
                카카오톡 알림톡
              </Text>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500], marginTop: 2 }}>
                매칭·정산 알림
              </Text>
            </View>
            <Switch
              value={notifyAlimtalk}
              onValueChange={setNotifyAlimtalk}
              trackColor={{ false: colors.gray[300], true: colors.navy[500] }}
              thumbColor={colors.white}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.lg,
              minHeight: touch.minTargetSize,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.sizes.base, color: colors.gray[800] }}>
                앱 푸시
              </Text>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500], marginTop: 2 }}>
                새 일감 실시간 알림
              </Text>
            </View>
            <Switch
              value={notifyPush}
              onValueChange={setNotifyPush}
              trackColor={{ false: colors.gray[300], true: colors.navy[500] }}
              thumbColor={colors.white}
            />
          </View>
        </Section>

        {/* 계정 관리 */}
        <Section title="계정">
          <Row label="로그아웃" value="" onPress={handleLogout} />
          <Row label="회원 탈퇴" value="" onPress={handleWithdraw} />
        </Section>

        <Text
          style={{
            fontSize: typography.sizes.xs,
            color: colors.gray[400],
            textAlign: "center",
            marginTop: spacing.md,
          }}
        >
          일감 v1.0.0 · 통신판매중개업
        </Text>
      </ScrollView>
    </>
  );
}
