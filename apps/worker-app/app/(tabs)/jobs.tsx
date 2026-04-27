// 일감 탭 — 시니어 UX: 48dp 터치 / 18pt 기본 / WCAG AAA 7:1
// 카테고리 필터·거리·즉시정산 뱃지 (시니어 UX 베이스)
// 데이터: match-engine Edge Function (Supabase 미설정 시 MOCK_JOBS 폴백, lib/jobs.ts)

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors, typography, spacing } from "@ilgam/design-tokens";
import type { Job, JobCategory } from "@ilgam/core";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_LETTER } from "@ilgam/core";
import { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useMatchedJobs } from "../../lib/jobs";

const CATEGORY_TABS: Array<{ key: JobCategory | "all"; label: string }> = [
  { key: "all", label: "전체" },
  { key: "logistics", label: "📦 물류·배송" },
  { key: "food", label: "🍽️ 외식·카페" },
  { key: "cleaning", label: "🧹 청소·환경" },
  { key: "retail", label: "🛒 유통·판매" },
  { key: "care", label: "💊 돌봄·의료" },
  { key: "agriculture", label: "🌾 농업·자연" },
];

// ─── 시간 포맷 헬퍼 ──────────────────────────────────────────────────────
function toHHMM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── 즉시정산 뱃지 ───────────────────────────────────────────────────────
function InstantPayBadge() {
  return (
    <View style={styles.instantBadge}>
      <Text style={styles.instantBadgeText}>⚡ 즉시정산</Text>
    </View>
  );
}

// ─── 카테고리 뱃지 ───────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: JobCategory | null }) {
  if (!category) return null;
  return (
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryBadgeText}>
        [{JOB_CATEGORY_LETTER[category]}] {JOB_CATEGORY_LABEL[category]}
      </Text>
    </View>
  );
}

// ─── 일감 카드 (memo: 필터 변경 시 미변경 카드 리렌더 차단) ────────────
const JobCard = memo(function JobCard({ job }: { job: Job }) {
  const startHH = toHHMM(job.shift_start_at);
  const endHH = toHHMM(job.shift_end_at);
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      accessible
      accessibilityLabel={`${job.title}, 시급 ${job.hourly_wage_krw.toLocaleString()}원, ${startHH}~${endHH}, ${job.dong_label ?? ""}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })}
    >
      {/* 카드 상단: 뱃지 */}
      <View style={styles.cardBadgeRow}>
        <CategoryBadge category={job.category} />
        {job.instant_pay && <InstantPayBadge />}
      </View>

      {/* 공고명 */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {job.title}
      </Text>

      {/* 시급 (최우선 강조) */}
      <Text style={styles.cardWage}>
        시급 {job.hourly_wage_krw.toLocaleString()}원
      </Text>

      {/* 시간·장소·거리 */}
      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaText}>
          🕐 {startHH}~{endHH}
        </Text>
        <Text style={styles.cardMetaDot}>·</Text>
        <Text style={styles.cardMetaText}>
          📍 {job.dong_label ?? job.dong_code}
        </Text>
        {job.distance_km !== null && (
          <>
            <Text style={styles.cardMetaDot}>·</Text>
            <Text style={styles.cardMetaText}>
              {job.distance_km < 1
                ? `${Math.round(job.distance_km * 1000)}m`
                : `${job.distance_km.toFixed(1)}km`}
            </Text>
          </>
        )}
      </View>

      {/* 특이사항 */}
      {job.note && (
        <Text style={styles.cardNote} numberOfLines={1}>
          {job.note}
        </Text>
      )}

      {/* 지원 버튼 */}
      <TouchableOpacity
        style={styles.applyButton}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} 상세 보기`}
        onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })}
      >
        <Text style={styles.applyButtonText}>상세 보기</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

// ─── 메인 화면 ────────────────────────────────────────────────────────────
export default function JobsScreen() {
  const [activeCategory, setActiveCategory] = useState<JobCategory | "all">("all");
  // workerId 는 인증 연결 후 세션에서 주입. 미연결 상태에서는 mock 폴백.
  const { data: jobs, isLoading } = useMatchedJobs(null);

  const filtered = useMemo(() => {
    const list = jobs ?? [];
    return activeCategory === "all"
      ? list
      : list.filter((j) => j.category === activeCategory);
  }, [activeCategory, jobs]);

  const renderItem = useCallback(
    ({ item }: { item: Job }) => <JobCard job={item} />,
    []
  );
  const keyExtractor = useCallback((item: Job) => item.id, []);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘 할 수 있는 일감</Text>
        <Text style={styles.headerSub}>{filtered.length}개의 일감</Text>
      </View>

      {/* 카테고리 필터 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {CATEGORY_TABS.map((tab) => {
          const active = activeCategory === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveCategory(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 일감 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color={colors.navy[700]} />
              <Text style={styles.emptyText}>일감을 불러오는 중…</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>해당 카테고리 일감이 없습니다.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700" as const,
    color: colors.navy[800],
  },
  headerSub: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  tabScroll: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tabContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    minHeight: 48, // ADR-003 senior UX baseline: 48dp tap target
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.navy[700],
  },
  tabText: {
    fontSize: typography.sizes.base, // ADR-003: minimum 16pt for senior readability
    color: colors.gray[700],
    fontWeight: "500" as const,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: "700" as const,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBadgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: colors.navy[50] ?? colors.gray[100],
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.navy[700],
    fontWeight: "500" as const,
  },
  instantBadge: {
    backgroundColor: "#FFF3CD",
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  instantBadgeText: {
    fontSize: typography.sizes.xs,
    color: "#856404",
    fontWeight: "600" as const,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.navy[900],
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  cardWage: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.navy[600],
    marginBottom: spacing.sm,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.sm,
  },
  cardMetaText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  cardMetaDot: {
    fontSize: typography.sizes.sm,
    color: colors.gray[400],
  },
  cardNote: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  applyButton: {
    backgroundColor: colors.navy[700],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: "700" as const,
    color: colors.white,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.gray[500],
  },
});
