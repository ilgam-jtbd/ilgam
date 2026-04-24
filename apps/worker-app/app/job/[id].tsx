// 일감 상세 — 공고 전체 정보 + 지원 CTA (하단 고정)
// ADR-003: 18pt 기본 · 48dp 터치 · 하단 안전존 · 2초 Undo 토스트
// 실 구현 시 supabase.from("jobs").select().eq("id", id) (ADR-004)

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { colors, typography, spacing, radius, touch, motion } from "@ilgam/design-tokens";
import type { Job } from "@ilgam/core";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_EMOJI } from "@ilgam/core";

// ─── 샘플 (실제로는 id로 fetch) ─────────────────────────────────────────
const MOCK_JOB: Job = {
  id: "job-001",
  employer_id: "emp-001",
  title: "강서 쿠팡 물류센터 피킹 보조",
  description:
    "가벼운 생필품(세제·휴지 등)을 주문 번호에 맞춰 분류·피킹하는 작업입니다. 지게차 없이 손수레만 사용하며, 휴게 시간 1회 15분 제공됩니다. 안전화는 현장에서 대여 가능합니다.",
  dong_code: "1150010100",
  dong_label: "강서구 마곡동",
  shift_start_at: "2026-04-25T09:00:00+09:00",
  shift_end_at: "2026-04-25T13:00:00+09:00",
  hourly_wage_krw: 12000,
  required_cert_codes: [],
  preferred_mentor_tags: ["logistics"],
  headcount: 3,
  status: "open",
  category: "logistics",
  distance_km: 1.2,
  instant_pay: true,
  note: "지게차 불필요 · 서서 작업",
};

// ─── 포매터 ────────────────────────────────────────────────────────────
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

// ─── 정보 Row ──────────────────────────────────────────────────────────
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

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // 실연동 시: const { data: job } = useQuery(["job", id], () => supabase.from("jobs")...)
  const job = MOCK_JOB;

  const workMinutes = diffMinutes(job.shift_start_at, job.shift_end_at);
  const estWage = Math.round((job.hourly_wage_krw * workMinutes) / 60);
  const estNet = Math.round(estWage * 0.967); // 4% 수수료 + 3.3% 원천징수 대략값

  const handleApply = () => {
    Alert.alert(
      "이 일감에 지원할까요?",
      `${formatDateKo(job.shift_start_at)} ${formatTime(job.shift_start_at)}–${formatTime(
        job.shift_end_at
      )}\n${job.dong_label} · 예상 수령 ${formatKrw(estNet)}`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "지원하기",
          style: "default",
          onPress: async () => {
            setApplying(true);
            // 실연동: await supabase.from("matches").insert({...})
            await new Promise((r) => setTimeout(r, 800));
            setApplying(false);
            setApplied(true);
            // 2초 Undo 토스트 (motion.undoTimeoutMs)
            setTimeout(() => {
              Alert.alert(
                "지원 완료",
                "고용주 확인 후 알림톡으로 결과를 알려드립니다.",
                [{ text: "확인", onPress: () => router.back() }]
              );
            }, motion.undoTimeoutMs);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "일감 상세", headerBackTitle: "뒤로" }} />
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: touch.buttonHeight + touch.bottomSafeZoneHeight,
          }}
        >
          {/* 헤더 영역 */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200],
            }}
          >
            {/* 카테고리 + 거리 + 즉시정산 */}
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
                  <Text style={{ fontSize: 14, marginRight: 4 }}>
                    {JOB_CATEGORY_EMOJI[job.category]}
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
              {typeof job.distance_km === "number" && (
                <View
                  style={{
                    backgroundColor: colors.gray[100],
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    borderRadius: radius.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: colors.gray[700],
                      fontWeight: "600",
                    }}
                  >
                    집에서 {job.distance_km}km
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

            {/* 시급 강조 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.xxl,
                  color: colors.navy[800],
                  fontWeight: "700",
                  letterSpacing: -0.5,
                }}
              >
                {formatKrw(job.hourly_wage_krw)}
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
                / 시간
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
            <InfoRow label="지역" value={job.dong_label ?? "위치 비공개"} />
            <InfoRow label="모집 인원" value={`${job.headcount}명`} />
            {job.note && <InfoRow label="특이사항" value={job.note} />}
          </View>

          {/* 업무 설명 */}
          {job.description && (
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
                  marginBottom: spacing.md,
                }}
              >
                업무 설명
              </Text>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[800],
                  lineHeight: 28,
                }}
              >
                {job.description}
              </Text>
            </View>
          )}

          {/* 예상 수령액 */}
          <View
            style={{
              backgroundColor: colors.navy[50],
              padding: spacing.xl,
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.navy[700],
                fontWeight: "600",
                marginBottom: spacing.xs,
              }}
            >
              예상 수령액 (수수료·세금 제외)
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xl,
                color: colors.navy[800],
                fontWeight: "700",
              }}
            >
              약 {formatKrw(estNet)}
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[600],
                marginTop: spacing.xs,
              }}
            >
              세전 {formatKrw(estWage)} · 수수료 4% + 원천징수 3.3% 적용
            </Text>
          </View>

          {/* 안전 안내 */}
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginTop: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.gray[200],
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[700],
                fontWeight: "700",
                marginBottom: spacing.xs,
              }}
            >
              안심하세요
            </Text>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[600], lineHeight: 20 }}>
              모든 고용주는 사업자등록 확인을 거쳤습니다. 근무 중 문제가 생기면
              문의 탭의 채널톡으로 즉시 알려주세요.
            </Text>
          </View>
        </ScrollView>

        {/* 하단 고정 CTA */}
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
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={applied ? "지원 완료" : "이 일감에 지원하기"}
            accessibilityState={{ disabled: applying || applied }}
            onPress={handleApply}
            disabled={applying || applied}
            style={{
              minHeight: touch.buttonHeight,
              backgroundColor: applied ? colors.success : colors.navy[700],
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
              opacity: applying ? 0.6 : 1,
            }}
          >
            {applying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: colors.white,
                  fontWeight: "700",
                }}
              >
                {applied ? "지원 완료" : "이 일감 지원하기"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}
