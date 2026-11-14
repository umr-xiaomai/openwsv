<script setup lang="ts">
import { ref } from 'vue';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-vue-next';
import {
  fmtCi,
  fmtCoverage,
  fmtPct,
  isIncompleteCoverage,
  modelColor,
  modelProvider,
  getModelSuiteScores,
  type Board,
  type BoardRow,
} from '../data/openwsv';

const props = defineProps<{
  board: Board;
  selectedModelIds?: string[];
  rows: BoardRow[];
}>();

const emit = defineEmits<{
  (e: 'toggleSelectModel', model: BoardRow): void;
}>();

// Expanded row for drill-down breakdown across suites
const expandedRows = ref<Set<string>>(new Set());

const toggleExpand = (rowId: string) => {
  if (expandedRows.value.has(rowId)) {
    expandedRows.value.delete(rowId);
  } else {
    expandedRows.value.add(rowId);
  }
};

// Copy model ID feedback
const copiedModelId = ref<string | null>(null);

const copyModelId = async (id: string) => {
  try {
    await navigator.clipboard.writeText(id);
    copiedModelId.value = id;
    setTimeout(() => {
      if (copiedModelId.value === id) copiedModelId.value = null;
    }, 1500);
  } catch {
    // ignore
  }
};

// Compute Margin of Error (half-width of CI)
const getMarginOfError = (ci: [number, number] | null) => {
  if (!ci) return null;
  const spread = Math.abs(ci[1] - ci[0]) / 2;
  return `±${(spread * 100).toFixed(2)}%`;
};
</script>

<template>
  <div class="w-full overflow-x-auto border border-t-0 border-border bg-card">
    <table class="w-full min-w-[760px] border-collapse text-left text-xs" data-leaderboard-table>
      <thead>
        <tr class="border-b border-border bg-muted/25 font-mono text-[10px] uppercase tracking-wider text-muted-foreground select-none">
          <th class="py-3 pl-4 pr-1 text-center w-10">
            <span class="sr-only">Select</span>
          </th>
          <th class="py-3 px-2 text-center w-12"># Rank</th>
          <th class="py-3 px-3 text-left">Model / Provider</th>
          <th class="py-3 px-4 text-left w-48">Accuracy</th>
          <th class="py-3 px-3 text-left">95% Bootstrap CI</th>
          <th class="py-3 px-3 text-right">Coverage</th>
          <th class="py-3 pl-3 pr-4 text-left" title="Whether the row's model reads bounding boxes from the frozen detector">
            Architecture
          </th>
          <th class="py-3 pr-4 text-right w-16">
            <span class="sr-only">Details</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60">
        <template v-for="(row, index) in rows" :key="row.id">
          <tr
            data-leaderboard-row
            :data-model-id="row.id"
            :data-uses-harness-boxes="String(row.usesHarnessBoxes)"
            class="transition-colors group hover:bg-muted/30"
            :class="{ 'bg-muted/15': selectedModelIds?.includes(row.id) }"
          >
            <!-- Checkbox for head-to-head comparison -->
            <td class="py-3 pl-4 pr-1 text-center">
              <input
                type="checkbox"
                class="size-3.5 rounded border-border text-foreground accent-foreground cursor-pointer focus:ring-0"
                :checked="selectedModelIds?.includes(row.id)"
                :title="`Select ${row.label} for comparison`"
                @change="emit('toggleSelectModel', row)"
              />
            </td>

            <!-- Rank Badge -->
            <td class="py-3 px-2 text-center">
              <span
                v-if="index === 0"
                class="inline-flex size-6 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold font-mono text-amber-500"
                title="Rank 1"
              >
                1
              </span>
              <span
                v-else-if="index === 1"
                class="inline-flex size-6 items-center justify-center rounded-full bg-slate-400/15 border border-slate-400/40 text-[11px] font-bold font-mono text-slate-300"
                title="Rank 2"
              >
                2
              </span>
              <span
                v-else-if="index === 2"
                class="inline-flex size-6 items-center justify-center rounded-full bg-amber-700/15 border border-amber-700/40 text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400"
                title="Rank 3"
              >
                3
              </span>
              <span
                v-else
                class="inline-flex size-6 items-center justify-center rounded-full bg-muted/40 font-mono text-[11px] font-medium text-muted-foreground"
              >
                {{ index + 1 }}
              </span>
            </td>

            <!-- Model & Provider -->
            <td class="py-3 px-3">
              <div class="flex items-center gap-2">
                <span
                  class="size-2.5 rounded-full shrink-0 shadow-xs"
                  :style="{ backgroundColor: modelColor(row.id) }"
                  aria-hidden="true"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-medium text-foreground text-xs hover:text-foreground/80 cursor-pointer" @click="toggleExpand(row.id)">
                      {{ row.label }}
                    </span>
                    <button
                      type="button"
                      class="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                      :title="copiedModelId === row.id ? 'Copied!' : 'Copy Model ID'"
                      @click="copyModelId(row.id)"
                    >
                      <Check v-if="copiedModelId === row.id" class="size-3 text-emerald-500" />
                      <Copy v-else class="size-3" />
                    </button>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{{ modelProvider(row.id) }}</span>
                    <span>·</span>
                    <span class="font-mono text-[9px] uppercase">
                      {{ row.usesHarnessBoxes ? 'Structured' : 'Text VLM' }}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Accuracy Score + Inline Micro Progress Bar -->
            <td class="py-3 px-4">
              <div class="space-y-1">
                <div class="flex items-baseline justify-between">
                  <span class="font-mono text-[15px] font-bold tabular-nums text-foreground tracking-tight">
                    {{ fmtPct(row.value) }}
                  </span>
                  <span class="font-mono text-[10px] text-muted-foreground/70">
                    {{ (row.value * 100).toFixed(1) }} / 100
                  </span>
                </div>
                <!-- Micro bar -->
                <div class="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :style="{
                      width: `${row.value * 100}%`,
                      backgroundColor: modelColor(row.id),
                    }"
                  />
                </div>
              </div>
            </td>

            <!-- 95% Confidence Interval -->
            <td class="py-3 px-3">
              <div class="flex flex-col">
                <span class="font-mono text-[11px] tabular-nums text-foreground/90 font-medium">
                  {{ fmtCi(row.ci) }}
                </span>
                <span v-if="getMarginOfError(row.ci)" class="font-mono text-[10px] text-muted-foreground">
                  MoE: {{ getMarginOfError(row.ci) }}
                </span>
              </div>
            </td>

            <!-- Coverage -->
            <td class="py-3 px-3 text-right font-mono text-[11px] tabular-nums">
              <span
                v-if="!isIncompleteCoverage(row)"
                class="inline-flex items-center gap-1 rounded bg-muted/40 px-1.5 py-0.5 text-foreground font-medium"
              >
                100%
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-amber-600 dark:text-amber-400 font-medium"
                :title="`Coverage ${fmtCoverage(row.coverage)}: unanswered/unparseable tasks excluded from denominator`"
              >
                <AlertCircle class="size-3" />
                {{ fmtCoverage(row.coverage) }}
              </span>
            </td>

            <!-- Architecture / Harness Boxes -->
            <td class="py-3 pl-3 pr-4">
              <span
                v-if="row.usesHarnessBoxes"
                class="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-600 dark:text-sky-400"
                title="Model reads bounding boxes from frozen GroundingDINO detector"
              >
                <Sparkles class="size-2.5" />
                GroundingDINO
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full border border-border bg-muted/20 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                title="Model reads raw image directly; does not read framework boxes"
              >
                End-to-End VLM
              </span>
            </td>

            <!-- Expand Suites Breakdown Button -->
            <td class="py-3 pr-4 text-right">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                :title="expandedRows.has(row.id) ? 'Collapse suite breakdown' : 'Expand suite breakdown'"
                @click="toggleExpand(row.id)"
              >
                <span>{{ expandedRows.has(row.id) ? 'Hide' : 'Suites' }}</span>
                <ChevronUp v-if="expandedRows.has(row.id)" class="size-3" />
                <ChevronDown v-else class="size-3" />
              </button>
            </td>
          </tr>

          <!-- In-table Expanded Suite Breakdown Drawer -->
          <tr v-if="expandedRows.has(row.id)" class="bg-muted/10 border-b border-border/80">
            <td colspan="8" class="p-4 sm:p-5">
              <div class="rounded-lg border border-border/80 bg-background/90 p-4 shadow-inner">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="size-2 rounded-full"
                      :style="{ backgroundColor: modelColor(row.id) }"
                    />
                    <span class="font-semibold text-xs text-foreground">{{ row.label }}</span>
                    <span class="text-xs text-muted-foreground">· Detailed Suite Matrix</span>
                  </div>
                  <div class="font-mono text-[10px] text-muted-foreground">
                    All evaluations performed under frozen openwsv-1 protocol
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    v-for="suite in getModelSuiteScores(row.id)"
                    :key="suite.boardId"
                    class="rounded border border-border/60 bg-muted/15 p-2.5 space-y-1.5"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-xs text-foreground">{{ suite.boardLabel }}</span>
                      <span class="font-mono font-bold text-xs tabular-nums text-foreground">
                        {{ fmtPct(suite.value) }}
                      </span>
                    </div>

                    <div class="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :style="{
                          width: `${suite.value * 100}%`,
                          backgroundColor: modelColor(row.id),
                        }"
                      />
                    </div>

                    <div class="flex items-center justify-between font-mono text-[9px] text-muted-foreground pt-0.5">
                      <span>CI: {{ fmtCi(suite.ci) }}</span>
                      <span>Cov: {{ fmtCoverage(suite.coverage) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
