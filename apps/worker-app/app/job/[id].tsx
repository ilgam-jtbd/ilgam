// 일감 상세 — 공고 전체 정보 + 지원 CTA (하단 고정)
// ADR-003: 18pt 기본 · 48dp 터치 · 하단 안전존 · 2초 Undo 토스트
// 데이터: useJob(id) — Supabase 미설정 시 MOCK_JOBS 폴백 (lib/jobs.ts)
// 지원: useApplyToJob — RLS: worker 본인만 INSERT job_applications

import { useEffect, useRef, useState } from "react";
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
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_LETTER } from "@ilgam/core";
import { useJob, useApplyToJob } from "../../lib/jobs";
import { supabase } from "../../lib/supabase";

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
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: job, isLoading } = useJob(params.id);
  const applyMutation = useApplyToJob();
  const [applied, setApplied] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  if (isLoading || !job) {
    return (
      <>
        <Stack.Screen options={{ title: "일감 상세", headerBackTitle: "뒤로" }} />
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
              일감을 찾을 수 없습니다.
            </Text>
          )}
        </View>
      </>
    );
  }

  const workMinutes = diffMinutes(job.shift_start_at, job.shift_end_at);
  const estWage = Math.round((job.hourly_wage_krw * workMinutes) / 60);
  const estNet = Math.round(estWage * 0.967); // 4% 수수료 + 3.3% 원천징수 대략값

  // Undo 토스트 — Optimistic Delay 패턴 (ADR-003 §시니어 UX 우선순위 2):
  // mutate를 2초 후에 실행. 사용자가 그 안에 "되돌리기"를 누르면 mutate 자체가 발사되지 않음.
  // → DB에 row가 만들어지지 않으므로 cancel API 불필요 + 진정한 미스탭 회복.
  const handleApply = () => {
    if (applied || applying) return;
    setApplied(true);
    undoTimerRef.current = setTimeout(async () => {
      undoTimerRef.current = null;
      try {
        const session = supabase ? (await supabase.auth.getUser()).data.user : null;
        const workerId = session?.id ?? "anon-worker";
        await applyMutation.mutateAsync({ jobId: job.id, workerId });
        router.back();
      } catch (e) {
        // 실패 시 토스트 닫고 에러 표시
        setApplied(false);
        const msg = e instanceof Error ? e.message : "지원 중 오류가 발생했습니다.";
        Alert.alert("지원 실패", msg);
      }
    }, motion.undoTimeoutMs);
  };
  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setApplied(false);
    // mutate 자체가 아직 발사되지 않았으므로 클라이언트 state만 복원하면 끝.
  };

  const applying = applyMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: "일감 상세", headerBackTitle: "뒤로" }} />
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: touch.buttonHeight + touch.bottomSafeZoneHeight,
          }}
        >
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

        {applied && (
          <View
            accessibilityLiveRegion="polite"
            style={{
              position: "absolute",
              bottom: touch.buttonHeight + spacing.xl + spacing.sm,
              left: spacing.lg,
              right: spacing.lg,
              backgroundColor: colors.navy[800],
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.white,
                fontWeight: "600",
              }}
            >
              지원했습니다 · 곧 결과 알림
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="지원 되돌리기"
              hitSlop={12}
              onPress={handleUndo}
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                minHeight: 36,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.white,
                  fontWeight: "700",
                  textDecorationLine: "underline",
                }}
              >
                되돌리기
              </Text>
            </Pressable>
          </View>
        )}
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
