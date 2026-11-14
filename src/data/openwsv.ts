/**
 * OpenWSV data layer.
 *
 * The only data source is `./openwsv.generated.json`, generated from evaluation
 * artifacts of the frozen `openwsv-1` framework. This file only narrows types,
 * sorts and formats values; it contains no hardcoded leaderboard numbers.
 */

import raw from './openwsv.generated.json';

export interface WsvBenchmark {
  name: string;
  short: string;
  version: string;
  framework: string;
  updated: string;
}

export interface BoardRow {
  id: string;
  label: string;
  /** Metric value in 0–1 (accuracy). */
  value: number;
  /** 95% CI in 0–1; null when not computed. */
  ci: [number, number] | null;
  /** Share of tasks with a complete answer in 0–1; null when not reported. */
  coverage: number | null;
  /** Whether the row's model reads bounding boxes from the frozen detector (false for VLM rows). */
  usesHarnessBoxes: boolean;
}

export interface Board {
  id: string;
  label: string;
  n: number | null;
  /** 'pending' = no scores yet; no numbers are rendered. */
  state?: 'pending';
  note?: string;
  rows?: BoardRow[];
}

export interface CompositeInfo {
  label: string;
  method: string;
}

export interface ProtocolRow {
  name: string;
  value: string;
}

export interface DatasetSuite {
  id: string;
  name: string;
  n: string;
  desc: string;
}

export interface ReproInfo {
  command: string;
  repo: string;
}

export interface WsvData {
  benchmark: WsvBenchmark;
  composite: CompositeInfo;
  defaultBoard: string;
  boards: Board[];
  protocol: ProtocolRow[];
  datasets: DatasetSuite[];
  repro: ReproInfo;
}

export const DATA = raw as unknown as WsvData;
export const BENCHMARK = DATA.benchmark;
export const COMPOSITE = DATA.composite;
export const BOARDS = DATA.boards;
export const PROTOCOL = DATA.protocol;
export const DATASETS = DATA.datasets;
export const REPRO = DATA.repro;

export const isPending = (board: Board): boolean => board.state === 'pending';

export const rowsOf = (board: Board): BoardRow[] => board.rows ?? [];

/** Sort by metric value, descending. */
export const sortedRows = (board: Board): BoardRow[] =>
  rowsOf(board).slice().sort((a, b) => b.value - a.value);

export const findBoard = (id: string): Board | undefined => BOARDS.find((board) => board.id === id);

/** Default tab: the payload's defaultBoard, otherwise the first board. */
export const DEFAULT_BOARD: string =
  findBoard(DATA.defaultBoard)?.id ?? BOARDS[0]?.id ?? 'overall';

export const SHIPPED_BOARDS = BOARDS.filter((board) => !isPending(board));
export const PENDING_BOARDS = BOARDS.filter(isPending);

export const MODEL_COUNT = new Set(SHIPPED_BOARDS.flatMap((board) => rowsOf(board).map((row) => row.id)))
  .size;

export const fmtCount = (n: number): string => n.toLocaleString('en-US');

/** 0–1 → percentage (two decimals by default). */
export const fmtPct = (value: number, digits = 2): string => `${(value * 100).toFixed(digits)}%`;

export const fmtCi = (ci: [number, number] | null): string =>
  ci ? `[${fmtPct(ci[0])} – ${fmtPct(ci[1])}]` : '—';

/** Coverage: integers without decimals, otherwise two decimals. */
export const fmtCoverage = (coverage: number | null): string => {
  if (coverage == null) return '—';
  const pct = coverage * 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
};

export const isIncompleteCoverage = (row: BoardRow): boolean =>
  row.coverage != null && row.coverage < 1;

/** Model id → family color (visual mapping only; not part of the protocol). */
const MODEL_COLORS: Array<[RegExp, string]> = [
  [/^starlife/i, 'var(--color-starlife)'],
  [/^gemini/i, 'var(--color-gemini)'],
  [/^deepseek/i, 'var(--color-deepseek)'],
  [/^glm/i, 'var(--color-zhipu)'],
  [/^qwen/i, 'var(--color-qwen)'],
  [/^minimax/i, 'var(--color-minimax)'],
  [/^kimi/i, 'var(--color-kimi)'],
  [/^mimo/i, 'var(--color-xiaomi)'],
  [/^step/i, 'var(--color-bytedance)'],
  [/^gpt|^o[1-9]|^openai/i, 'var(--color-openai)'],
  [/^claude|^anthropic/i, 'var(--color-anthropic)'],
];

export const modelColor = (id: string): string => {
  for (const [pattern, color] of MODEL_COLORS) {
    if (pattern.test(id)) return color;
  }
  return 'var(--muted-foreground)';
};

/** Model provider / creator mapping for professional display. */
export const modelProvider = (id: string): string => {
  if (/^gemini/i.test(id)) return 'Google';
  if (/^deepseek/i.test(id)) return 'DeepSeek';
  if (/^glm/i.test(id)) return 'Zhipu AI';
  if (/^minimax/i.test(id)) return 'MiniMax';
  if (/^kimi/i.test(id)) return 'Moonshot AI';
  if (/^qwen/i.test(id)) return 'Alibaba';
  if (/^mimo/i.test(id)) return 'Xiaomi';
  if (/^starlife/i.test(id)) return 'StarLife';
  if (/^step/i.test(id)) return 'StepFun';
  if (/^gpt|^o[1-9]|^openai/i.test(id)) return 'OpenAI';
  if (/^claude|^anthropic/i.test(id)) return 'Anthropic';
  return 'Independent';
};

export interface SuiteScoreItem {
  boardId: string;
  boardLabel: string;
  value: number;
  ci: [number, number] | null;
  coverage: number | null;
  usesHarnessBoxes: boolean;
}

/** Get all suite evaluations for a particular model id. */
export const getModelSuiteScores = (modelId: string): SuiteScoreItem[] => {
  const result: SuiteScoreItem[] = [];
  for (const board of SHIPPED_BOARDS) {
    const row = rowsOf(board).find((r) => r.id === modelId);
    if (row) {
      result.push({
        boardId: board.id,
        boardLabel: board.id === 'overall' ? 'Overall' : board.label,
        value: row.value,
        ci: row.ci,
        coverage: row.coverage,
        usesHarnessBoxes: row.usesHarnessBoxes,
      });
    }
  }
  return result;
};

/** Get overall leaderboard top performer. */
export const getOverallLeader = (): BoardRow | null => {
  const overallBoard = findBoard('overall');
  if (!overallBoard) return null;
  const sorted = sortedRows(overallBoard);
  return sorted[0] ?? null;
};
