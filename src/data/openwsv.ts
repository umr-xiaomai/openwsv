/**
 * OpenWSV 数据层。
 *
 * 唯一的数据来源是 `./openwsv.generated.json`（由评测流水线从冻结框架
 * `openwsv-1` 的结果产物生成）。本文件只做类型收窄、排序与格式化，
 * 不包含任何写死的排行榜数值。
 */

import raw from './openwsv.generated.json';

export type CapabilityStatus = 'shipped' | 'pending';

export interface WsvBenchmark {
  name: string;
  short: string;
  version: string;
  framework: string;
  updated: string;
}

export interface Capability {
  id: string;
  name: string;
  status: CapabilityStatus;
  metric: string;
  suites: string[];
  note: string;
}

export interface LeaderboardRow {
  id: string;
  label: string;
  /** 'vlm' | 'structured'（未来结构化世界模型行） */
  kind: string;
  /** 该行模型是否读取冻结检测器输出的 bbox（VLM 行为 false）。 */
  usesHarnessBoxes: boolean;
  /** 0–1 的指标值（accuracy / agreement / macro-F1）。 */
  value: number;
  /** 95% CI（0–1）；未计算时为 null。 */
  ci: [number, number] | null;
  /** 完整回答覆盖的题目比例（0–1）；未报告时为 null。 */
  coverage: number | null;
}

export interface Leaderboard {
  capability: string;
  suite: string;
  n: number;
  metric: string;
  rows: LeaderboardRow[];
}

export interface ProtocolComponent {
  name: string;
  frozen: string;
}

export interface DatasetSuite {
  id: string;
  name: string;
  n: number;
  desc: string;
}

export interface ReproInfo {
  command: string;
  repo: string;
  release?: string;
}

export interface WsvData {
  benchmark: WsvBenchmark;
  capabilities: Capability[];
  leaderboards: Leaderboard[];
  protocol: { components: ProtocolComponent[]; notes: string };
  datasets: DatasetSuite[];
  repro: ReproInfo;
}

export const DATA = raw as unknown as WsvData;
export const BENCHMARK = DATA.benchmark;
export const CAPABILITIES = DATA.capabilities;
export const LEADERBOARDS = DATA.leaderboards;
export const PROTOCOL = DATA.protocol;
export const DATASETS = DATA.datasets;
export const REPRO = DATA.repro;

export const SHIPPED_COUNT = CAPABILITIES.filter((c) => c.status === 'shipped').length;
export const PENDING_COUNT = CAPABILITIES.length - SHIPPED_COUNT;
export const MODEL_COUNT = new Set(LEADERBOARDS.flatMap((b) => b.rows.map((r) => r.id))).size;

/** suite → 展示名。 */
export const SUITE_LABELS: Record<string, string> = {
  spatialmqa: 'SpatialMQA',
  spatialmqa_relation: 'SpatialMQA 关系子集',
  pairs: 'Structured Pairs',
  abstract: 'Abstract Geometry',
};

/** 指标 → 展示名。 */
export const METRIC_LABELS: Record<string, string> = {
  accuracy: 'accuracy',
  agreement: 'agreement',
  macro_f1: 'macro-F1',
};

/** 模型类型 → 展示名。 */
export const KIND_LABELS: Record<string, string> = {
  vlm: 'VLM · zero-shot',
  structured: '结构化世界模型',
};

export const capabilityOf = (id: string): Capability | undefined =>
  CAPABILITIES.find((c) => c.id === id);

export const suiteLabel = (suite: string): string => SUITE_LABELS[suite] ?? suite;

export const metricLabel = (metric: string): string => METRIC_LABELS[metric] ?? metric;

export const kindLabel = (kind: string): string => KIND_LABELS[kind] ?? kind;

/** 按指标值降序。 */
export const sortedRows = (board: Leaderboard): LeaderboardRow[] =>
  board.rows.slice().sort((a, b) => b.value - a.value);

export const fmtCount = (n: number): string => n.toLocaleString('en-US');

/** 已出分 suite 的题目总数（不用于跨 suite 比较，仅作页面计数）。 */
export const sumLeaderboardN = (): number =>
  LEADERBOARDS.reduce((total, board) => total + board.n, 0);

/** 0–1 → 百分比（默认两位小数）。 */
export const fmtPct = (value: number, digits = 2): string => `${(value * 100).toFixed(digits)}%`;

export const fmtCi = (ci: [number, number] | null): string =>
  ci ? `[${fmtPct(ci[0])} – ${fmtPct(ci[1])}]` : '—';

/** 覆盖率：整数不补小数，其余两位。 */
export const fmtCoverage = (coverage: number | null): string => {
  if (coverage == null) return '—';
  const pct = coverage * 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
};

export const isIncompleteCoverage = (row: LeaderboardRow): boolean =>
  row.coverage != null && row.coverage < 1;

/** 模型 id → 家族色（仅视觉映射，不参与口径）。 */
const MODEL_COLORS: Array<[RegExp, string]> = [
  [/^qwen/i, 'var(--color-qwen)'],
  [/^deepseek/i, 'var(--color-deepseek)'],
  [/^glm/i, 'var(--color-zhipu)'],
  [/^minimax/i, 'var(--color-minimax)'],
  [/^mimo/i, 'var(--color-xiaomi)'],
];

export const modelColor = (id: string): string => {
  for (const [pattern, color] of MODEL_COLORS) {
    if (pattern.test(id)) return color;
  }
  return 'var(--muted-foreground)';
};

/** 复现命令里可选的 suite 列表（来自能力矩阵与数据集定义，去重保序）。 */
export const SUITE_OPTIONS: string[] = Array.from(
  new Set([...CAPABILITIES.flatMap((c) => c.suites), ...DATASETS.map((d) => d.id.replace(/^openwsv-/, ''))]),
).filter((suite) => suite !== 't1');