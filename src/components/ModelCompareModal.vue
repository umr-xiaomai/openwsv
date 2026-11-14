<script setup lang="ts">
import { computed } from 'vue';
import { X, Check, ArrowRight, Scale, ShieldCheck, AlertCircle } from 'lucide-vue-next';
import {
  type BoardRow,
  fmtPct,
  fmtCi,
  fmtCoverage,
  modelColor,
  modelProvider,
  getModelSuiteScores,
  SHIPPED_BOARDS,
  type SuiteScoreItem,
} from '../data/openwsv';

const props = defineProps<{
  models: BoardRow[];
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'removeModel', modelId: string): void;
}>();

// Compare across core suites
const SUITE_LIST = [
  { id: 'overall', label: 'Overall Composite' },
  { id: 't4', label: 'T4 Spatial Change' },
  { id: 't5', label: 'T5 Relation Change' },
  { id: 't6', label: 'T6 State Replay' },
  { id: 't7', label: 'T7 Cross-frame' },
  { id: 't1', label: 'T1 Single Image' },
  { id: 't1_relation', label: 'T1 Relation Subset' },
];

const modelComparisons = computed(() => {
  return props.models.map((model) => {
    const suites = getModelSuiteScores(model.id);
    const suiteMap = new Map<string, SuiteScoreItem>();
    suites.forEach((s) => suiteMap.set(s.boardId, s));
    return {
      model,
      provider: modelProvider(model.id),
      color: modelColor(model.id),
      suiteMap,
    };
  });
});

const getScoreForSuite = (suiteMap: Map<string, SuiteScoreItem>, suiteId: string) => {
  return suiteMap.get(suiteId) ?? null;
};

// Calculate delta between model 0 and model 1 for each suite if exactly 2 models
const getDelta = (s1Val: number | null, s2Val: number | null) => {
  if (s1Val == null || s2Val == null) return null;
  const diff = (s1Val - s2Val) * 100;
  return diff;
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    />

    <!-- Modal Box -->
    <div
      class="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-card shadow-2xl overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground">
            <Scale class="size-4 text-foreground" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground">
              Head-to-Head Model Comparison
            </h3>
            <p class="text-xs text-muted-foreground">
              Cross-suite benchmarking under frozen openwsv-1 protocol
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          @click="emit('close')"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- Models Header Bar -->
      <div class="grid border-b border-border bg-background px-5 py-3 gap-4" :style="{ gridTemplateColumns: `160px repeat(${models.length}, minmax(0, 1fr))` }">
        <div class="flex items-center text-xs font-mono uppercase text-muted-foreground">
          Model / Architecture
        </div>
        <div
          v-for="item in modelComparisons"
          :key="item.model.id"
          class="flex items-center justify-between rounded-md border border-border/80 bg-muted/15 px-3 py-2"
        >
          <div class="min-w-0 pr-2">
            <div class="flex items-center gap-1.5">
              <span
                class="size-2 rounded-full shrink-0"
                :style="{ backgroundColor: item.color }"
              />
              <span class="truncate font-semibold text-xs text-foreground">{{ item.model.label }}</span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
              <span>{{ item.provider }}</span>
              <span>·</span>
              <span>{{ item.model.usesHarnessBoxes ? 'Structured' : 'Text VLM' }}</span>
            </div>
          </div>
          <button
            v-if="models.length > 2"
            type="button"
            class="text-muted-foreground hover:text-foreground text-xs"
            title="Remove from comparison"
            @click="emit('removeModel', item.model.id)"
          >
            <X class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Content Table (Scrollable) -->
      <div class="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border/60">
        <!-- Suite comparisons -->
        <div
          v-for="suite in SUITE_LIST"
          :key="suite.id"
          class="grid py-3.5 items-center gap-4 text-xs"
          :style="{ gridTemplateColumns: `160px repeat(${models.length}, minmax(0, 1fr))` }"
        >
          <!-- Suite Info -->
          <div>
            <div class="font-medium text-foreground text-xs">{{ suite.label }}</div>
            <div class="font-mono text-[10px] text-muted-foreground uppercase">{{ suite.id }}</div>
          </div>

          <!-- Model Scores for this suite -->
          <div
            v-for="(item, idx) in modelComparisons"
            :key="item.model.id"
            class="min-w-0"
          >
            <div v-if="getScoreForSuite(item.suiteMap, suite.id)" class="space-y-1">
              <div class="flex items-baseline justify-between gap-1">
                <span class="font-mono font-bold text-sm tabular-nums text-foreground">
                  {{ fmtPct(getScoreForSuite(item.suiteMap, suite.id)!.value) }}
                </span>
                <span
                  v-if="models.length === 2 && idx === 0"
                  class="font-mono text-[10px] font-medium"
                  :class="
                    (getDelta(
                      getScoreForSuite(item.suiteMap, suite.id)?.value ?? null,
                      getScoreForSuite(modelComparisons[1].suiteMap, suite.id)?.value ?? null
                    ) ?? 0) >= 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  "
                >
                  {{
                    (getDelta(
                      getScoreForSuite(item.suiteMap, suite.id)?.value ?? null,
                      getScoreForSuite(modelComparisons[1].suiteMap, suite.id)?.value ?? null
                    ) ?? 0) >= 0 ? '+' : ''
                  }}{{
                    (
                      getDelta(
                        getScoreForSuite(item.suiteMap, suite.id)?.value ?? null,
                        getScoreForSuite(modelComparisons[1].suiteMap, suite.id)?.value ?? null
                      ) ?? 0
                    ).toFixed(2)
                  }}%
                </span>
              </div>

              <!-- Mini Bar -->
              <div class="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${getScoreForSuite(item.suiteMap, suite.id)!.value * 100}%`,
                    backgroundColor: item.color,
                  }"
                />
              </div>

              <div class="flex items-center justify-between font-mono text-[10px] text-muted-foreground pt-0.5">
                <span>CI: {{ fmtCi(getScoreForSuite(item.suiteMap, suite.id)!.ci) }}</span>
                <span>Cov: {{ fmtCoverage(getScoreForSuite(item.suiteMap, suite.id)!.coverage) }}</span>
              </div>
            </div>

            <!-- Not measured / pending -->
            <div v-else class="text-muted-foreground/60 font-mono text-[11px] italic">
              pending / unmeasured
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Notes -->
      <div class="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20 text-xs text-muted-foreground">
        <div class="flex items-center gap-1.5">
          <ShieldCheck class="size-3.5 text-emerald-500" />
          <span>Scores reflect frozen GroundingDINO detector and deterministic exact-match evaluation.</span>
        </div>
        <button
          type="button"
          class="h-7 px-3 rounded bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
