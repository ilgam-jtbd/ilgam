// 일감 탭 — 시니어 UX: 48dp 터치 / 18pt 기본 / WCAG AAA 7:1
// 카테고리 필터·거리·즉시정산 뱃지 (당근알바·급구·지니어스 패턴 참조)
// 실 구현 시 match-engine RPC + supabase-js 연결 (ADR-004)

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { colors, typography, spacing } from "@ilgam/design-tokens";
import type { Job, JobCategory } from "@ilgam/core";
import { JOB_CATEGORY_LABEL, JOB_CATEGORY_EMOJI } from "@ilgam/core";
import { useState } from "react";
import { useRouter } from "expo-router";

// ─── 샘플 데이터 (당근알바·급구·지니어스 공고 패턴 참조) ─────────────────
const MOCK_JOBS: Job[] = [
  {
    id: "job-001",
    employer_id: "emp-001",
    title: "강서 쿠팡 물류센터 피킹 보조",
    description: "지게차 불필요, 가벼운 물품 분류·피킹 작업",
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
  },
  {
    id: "job-002",
    employer_id: "emp-002",
    title: "송파 베이커리 오전 프렙 보조",
    description: "빵 성형 보조, 앉아서 작업 가능, 경험 무관",
    dong_code: "1174010500",
    dong_label: "송파구 방이동",
    shift_start_at: "2026-04-25T06:00:00+09:00",
    shift_end_at: "2026-04-25T10:00:00+09:00",
    hourly_wage_krw: 12000,
    required_cert_codes: [],
    preferred_mentor_tags: ["fnb"],
    headcount: 1,
    status: "open",
    category: "food",
    distance_km: 0.8,
    instant_pay: true,
    note: "앉아서 작업 가능 · 고령자 환영",
  },
  {
    id: "job-003",
    employer_id: "emp-003",
    title: "마포 국밥집 점심 서빙",
    description: "주문 접수·상차림·퇴식 보조",
    dong_code: "1144010400",
    dong_label: "마포구 합정동",
    shift_start_at: "2026-04-25T10:30:00+09:00",
    shift_end_at: "2026-04-25T14:30:00+09:00",
    hourly_wage_krw: 11500,
    required_cert_codes: [],
    preferred_mentor_tags: ["fnb"],
    headcount: 2,
    status: "open",
    category: "food",
    distance_km: 2.3,
    instant_pay: false,
    note: "고령자 우대",
  },
  {
    id: "job-004",
    employer_id: "emp-004",
    title: "노원 재활병원 청소 보조",
    description: "병동 복도·화장실 청소, 세제 제공",
    dong_code: "1135010300",
    dong_label: "노원구 중계동",
    shift_start_at: "2026-04-25T07:00:00+09:00",
    shift_end_at: "2026-04-25T11:00:00+09:00",
    hourly_wage_krw: 11500,
    required_cert_codes: [],
    preferred_mentor_tags: [],
    headcount: 2,
    status: "open",
    category: "cleaning",
    distance_km: 0.5,
    instant_pay: true,
    note: null,
  },
  {
    id: "job-005",
    employer_id: "emp-005",
    title: "영등포 이마트 행사 물품 진열",
    description: "음료·과자 행사 코너 진열, 무거운 짐 없음",
    dong_code: "1156010200",
    dong_label: "영등포구 당산동",
    shift_start_at: "2026-04-25T08:00:00+09:00",
    shift_end_at: "2026-04-25T12:00:00+09:00",
    hourly_wage_krw: 11500,
    required_cert_codes: [],
    preferred_mentor_tags: ["retail"],
    headcount: 3,
    status: "open",
    category: "retail",
    distance_km: 3.1,
    instant_pay: false,
    note: "무거운 짐 없음",
  },
  {
    id: "job-006",
    employer_id: "emp-006",
    title: "중랑 요양원 식사 보조",
    description: "어르신 식사 배식·보조, 요양보호사 우대",
    dong_code: "1126010100",
    dong_label: "중랑구 면목동",
    shift_start_at: "2026-04-25T07:30:00+09:00",
    shift_end_at: "2026-04-25T11:30:00+09:00",
    hourly_wage_krw: 12500,
    required_cert_codes: ["care_worker_2"],
    preferred_mentor_tags: ["care"],
    headcount: 1,
    status: "open",
    category: "care",
    distance_km: 1.8,
    instant_pay: true,
    note: "요양보호사 자격 우대",
  },
  {
    id: "job-007",
    employer_id: "emp-007",
    title: "파주 딸기 수확 보조",
    description: "하우스 딸기 수확 보조, 앉아서 작업, 교통비 지원",
    dong_code: "4148025300",
    dong_label: "파주시 탄현면",
    shift_start_at: "2026-04-25T07:00:00+09:00",
    shift_end_at: "2026-04-25T12:00:00+09:00",
    hourly_wage_krw: 12000,
    required_cert_codes: [],
    preferred_mentor_tags: ["agriculture"],
    headcount: 5,
    status: "open",
    category: "agriculture",
    distance_km: 28.4,
    instant_pay: false,
    note: "교통비 지원 · 점심 제공",
  },
  {
    id: "job-008",
    employer_id: "emp-008",
    title: "고양 CJ대한통운 택배 분류",
    description: "택배 상자 무게순 분류, 체력 보통 수준",
    dong_code: "4128110000",
    dong_label: "고양시 덕양구",
    shift_start_at: "2026-04-25T06:00:00+09:00",
    shift_end_at: "2026-04-25T10:00:00+09:00",
    hourly_wage_krw: 12500,
    required_cert_codes: [],
    preferred_mentor_tags: ["logistics"],
    headcount: 4,
    status: "open",
    category: "logistics",
    distance_km: 15.6,
    instant_pay: true,
    note: null,
  },
];

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

function formatWage(krw: number): string {
  return `${(krw / 1000).toFixed(1)}천원`;
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
        {JOB_CATEGORY_EMOJI[category]} {JOB_CATEGORY_LABEL[category]}
      </Text>
    </View>
  );
}

// ─── 일감 카드 ───────────────────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
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
}

// ─── 메인 화면 ────────────────────────────────────────────────────────────
export default function JobsScreen() {
  const [activeCategory, setActiveCategory] = useState<JobCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_JOBS
      : MOCK_JOBS.filter((j) => j.category === activeCategory);

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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>해당 카테고리 일감이 없습니다.</Text>
          </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    minHeight: 36,
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.navy[700],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
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
