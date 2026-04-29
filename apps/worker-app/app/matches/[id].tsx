// 매칭 명세 화면 — 워커가 employer 수락(매칭) 후 보는 확정 카드
// ADR-003: 18pt 기본 · 48dp 터치 · WCAG AAA · 하단 안전존 CTA
// 데이터: useMatch(id) — Supabase 미설정 시 MOCK_MATCHES 폴백 (lib/matches.ts)
// RLS: matches_worker SELECT only — 워커는 본인 매칭만 조회 가능. 취소 정책은 후속.

import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { colors, typography, spacing, radius, touch } from "@ilgam/design-tokens";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_LETTER } from "@ilgam/core";
import { useMatch } from "../../lib/matches";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
function formatDateKo(iso: string): string {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
function formatKrw(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
function diffMinutes(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}
function formatHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}
function isStartingSoon(start: string): boolean {
  const ms = new Date(start).getTime() - Date.now();
  return ms > 0 && ms <= 24 * 60 * 60 * 1000;
}
function relativeStart(start: string): string {
  const ms = new Date(start).getTime() - Date.now();
  if (ms <= 0) return "근무 시작 시간 도달";
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h < 1) return `${Math.round(ms / 60000)}분 후 시작`;
  if (h < 24) return `${h}시간 후 시작`;
  return `${Math.floor(h / 24)}일 후 시작`;
}

function InfoRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}
    >
      <Text
        style={{
          width: 96,
          fontSize: typography.sizes.sm,
          color: colors.gray[500],
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          fontSize: typography.sizes.base,
          color: colors.navy[800],
          fontWeight: strong ? "700" : "500",
          lineHeight: 26,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: match, isLoading } = useMatch(params.id);

  if (isLoading || !match) {
    return (
      <>
        <Stack.Screen options={{ title: "매칭 확정", headerBackTitle: "뒤로" }} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.gray[50],
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.navy[700]} />
          ) : (
            <Text style={{ fontSize: typography.sizes.base, color: colors.gray[600] }}>
              매칭을 찾을 수 없습니다.
            </Text>
          )}
        </View>
      </>
    );
  }

  const job = match.job;
  const workMinutes = diffMinutes(job.shift_start_at, job.shift_end_at);
  const estWage = Math.round((job.hourly_wage_krw * workMinutes) / 60);
  const estNet = Math.round(estWage * 0.967);
  const startingSoon = isStartingSoon(job.shift_start_at);
  const cancelled = Boolean(match.cancelled_at);

  const handleSupportCall = () => {
    Alert.alert(
      "고객지원 문의",
      "근무 관련 문제가 있으면 고객지원으로 문의해 주세요.\n채널톡 또는 문의 탭에서 상담 가능합니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "문의 탭 열기",
          onPress: () => router.push("/support"),
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (!job.dong_label) {
      Alert.alert("위치 정보 없음", "근무 장소 위치 정보가 없습니다. 고객지원에 문의해 주세요.");
      return;
    }
    const query = encodeURIComponent(`${job.dong_label} ${job.title}`);
    const url = `https://map.naver.com/v5/search/${query}`;
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert("길찾기 불가", "지도 앱을 열 수 없습니다.");
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "매칭 확정", headerBackTitle: "뒤로" }} />
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: touch.buttonHeight + touch.bottomSafeZoneHeight,
          }}
        >
          {/* 확정 배너 */}
          <View
            style={{
              backgroundColor: cancelled ? colors.danger : colors.success,
              padding: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.white,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {cancelled
                ? "❌ 매칭이 취소되었습니다"
                : startingSoon
                ? `✓ 매칭 확정 · ${relativeStart(job.shift_start_at)}`
                : "✓ 매칭 확정"}
            </Text>
          </View>

          {/* 공고 헤더 */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              {job.category && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.navy[50],
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    borderRadius: radius.sm,
                  }}
                >
                  <Text
                    accessibilityLabel={JOB_CATEGORY_LABEL[job.category]}
                    style={{
                      fontSize: 14,
                      marginRight: 4,
                      fontWeight: "700",
                      color: colors.navy[700],
                    }}
                  >
                    [{JOB_CATEGORY_LETTER[job.category]}]
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: colors.navy[700],
                      fontWeight: "700",
                    }}
                  >
                    {JOB_CATEGORY_LABEL[job.category]}
                  </Text>
                </View>
              )}
              {job.instant_pay && (
                <View
                  style={{
                    backgroundColor: "#E6F4EC",
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    borderRadius: radius.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: colors.success,
                      fontWeight: "700",
                    }}
                  >
                    당일 정산
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={{
                fontSize: typography.sizes.lg,
                color: colors.navy[800],
                fontWeight: "700",
                lineHeight: 32,
                marginBottom: spacing.md,
              }}
            >
              {job.title}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.sm }}>
              <Text
                style={{
                  fontSize: typography.sizes.xxl,
                  color: colors.navy[800],
                  fontWeight: "700",
                  letterSpacing: -0.5,
                }}
              >
                약 {formatKrw(estNet)}
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
                예상 수령
              </Text>
            </View>
          </View>

          {/* 근무 정보 */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.xl,
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.md,
                color: colors.navy[800],
                fontWeight: "700",
                marginBottom: spacing.sm,
              }}
            >
              근무 정보
            </Text>
            <InfoRow label="날짜" value={formatDateKo(job.shift_start_at)} strong />
            <InfoRow
              label="시간"
              value={`${formatTime(job.shift_start_at)}–${formatTime(
                job.shift_end_at
              )} (${formatHours(workMinutes)})`}
            />
            <InfoRow label="장소" value={job.dong_label ?? "위치 비공개 (시작 1시간 전 공개)"} />
            <InfoRow label="시급" value={formatKrw(job.hourly_wage_krw)} />
          </View>

          {/* 매칭 기록 */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.xl,
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.md,
                color: colors.navy[800],
                fontWeight: "700",
                marginBottom: spacing.sm,
              }}
            >
              매칭 기록
            </Text>
            <InfoRow
              label="확정 시각"
              value={new Date(match.confirmed_at).toLocaleString("ko-KR")}
            />
            {cancelled && match.cancelled_at && (
              <InfoRow
                label="취소 시각"
                value={new Date(match.cancelled_at).toLocaleString("ko-KR")}
              />
            )}
            {cancelled && match.cancel_reason && (
              <InfoRow label="취소 사유" value={match.cancel_reason} />
            )}
          </View>

          {/* 안내 박스 */}
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginTop: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: cancelled ? "#FDECEA" : colors.navy[50],
              borderWidth: 1,
              borderColor: cancelled ? colors.danger : colors.navy[200],
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: cancelled ? colors.danger : colors.navy[800],
                fontWeight: "700",
                marginBottom: spacing.xs,
              }}
            >
              {cancelled ? "취소된 매칭" : "당일 안내"}
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: cancelled ? "#721C24" : colors.gray[700],
                lineHeight: 22,
              }}
            >
              {cancelled
                ? "이 매칭은 더 이상 유효하지 않습니다. 새 일감을 찾으려면 일감 탭으로 돌아가세요."
                : "근무 시작 1시간 전 알림톡으로 정확한 주소를 받게 됩니다.\n10분 이상 늦거나 못 가게 되시면 즉시 고객지원으로 알려주세요. 노쇼 3회 누적 시 일정 기간 매칭이 제한됩니다."}
            </Text>
          </View>
        </ScrollView>

        {/* 하단 CTA */}
        {!cancelled && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: spacing.lg,
              paddingBottom: spacing.xl,
              backgroundColor: colors.white,
              borderTopWidth: 1,
              borderTopColor: colors.gray[200],
              flexDirection: "row",
              gap: spacing.md,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="고객지원 문의 열기"
              onPress={handleSupportCall}
              style={{
                flex: 1,
                minHeight: touch.buttonHeight,
                borderWidth: 1,
                borderColor: colors.gray[300],
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.white,
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                  fontWeight: "600",
                }}
              >
                문제 있어요
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="네이버 지도로 길찾기"
              onPress={handleNavigate}
              style={{
                flex: 1.4,
                minHeight: touch.buttonHeight,
                backgroundColor: colors.navy[700],
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: colors.white,
                  fontWeight: "700",
                }}
              >
                길찾기 (네이버지도)
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}
