<script setup lang="ts">
import { computed, ref } from 'vue';
import raw from '../data/spatialmqa.generated.json';

type MetricKey = 'overall' | 'test' | 'validation';

interface SpatialMqaSplit {
  accuracy: number;
  n: number;
}

interface SpatialMqaModel {
  id: string;
  name: string;
  family: string;
  provider: string;
  mode: string;
  accuracy: number;
  ci95: [number, number];
  coverage: number;
  n: number;
  nTotal: number;
  complete: boolean;
  bySplit: {
    test: SpatialMqaSplit;
    validation: SpatialMqaSplit;
  };
}

interface BarCi {
  value: number;
  lo: number;
  hi: number;
}

interface BarRow {
  model: SpatialMqaModel;
  value: number;
  ci: BarCi | null;
}

interface MetricOption {
  key: MetricKey;
  label: string;
}

const METRICS: MetricOption[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'test', label: 'test' },
  { key: 'validation', label: 'validation' },
];

const META = raw.meta as { nTotal: number; dataset: string; capability: string };
const MODELS = raw.models as SpatialMqaModel[];

const props = withDefaults(
  defineProps<{
    /** Test-only: preselect a metric tab (defaults to Overall). */
    initialMetric?: MetricKey;
  }>(),
  { initialMetric: 'overall' },
);

const activeMetric = ref<MetricKey>(props.initialMetric);

const valueFor = (model: SpatialMqaModel, key: MetricKey): number =>
  key === 'overall' ? model.accuracy : model.bySplit[key].accuracy;

const ciFor = (model: SpatialMqaModel, key: MetricKey): BarCi | null =>
  key === 'overall'
    ? { value: model.accuracy, lo: model.ci95[0], hi: model.ci95[1] }
    : null;

const rows = computed<BarRow[]>(() =>
  MODELS.map((model) => ({
    model,
    value: valueFor(model, activeMetric.value),
    ci: ciFor(model, activeMetric.value),
  })).sort((a, b) => b.value - a.value),
);

const widthOf = (row: BarRow): number => Math.min(100, Math.max(0, row.value));

const FAMILY_COLORS: Record<string, string> = {
  Qwen: 'var(--color-qwen)',
  DeepSeek: 'var(--color-deepseek)',
  GLM: 'var(--color-zhipu)',
  MiniMax: 'var(--color-minimax)',
  MiMo: 'var(--color-xiaomi)',
};

const familyColor = (model: SpatialMqaModel): string =>
  FAMILY_COLORS[model.family] ?? 'var(--muted-foreground)';

const isIncompleteCoverage = (model: SpatialMqaModel): boolean =>
  model.coverage < 100 || !model.complete;

const fmt2 = (value: number): string => value.toFixed(2);

const ciTitle = (interval: BarCi | null): string =>
  interval ? `95% CI ${fmt2(interval.lo)}–${fmt2(interval.hi)}` : '95% CI not computed for split views';

const ciFull = (interval: BarCi): string => `[${fmt2(interval.lo)}–${fmt2(interval.hi)}]`;

const ciHalf = (interval: BarCi): string => {
  const round1 = (value: number) => Number(value.toFixed(1));
  return `±${((round1(interval.hi) - round1(interval.lo)) / 2).toFixed(1)}`;
};

const legendFamilies = computed(() => {
  const map = new Map<string, { name: string; count: number; model: SpatialMqaModel }>();
  for (const model of MODELS) {
    const entry = map.get(model.family);
    if (entry) {
      entry.count += 1;
    } else {
      map.set(model.family, { name: model.family, count: 1, model });
    }
  }
  return [...map.values()];
});

const legendLabel = (entry: { name: string; count: number }): string =>
  entry.count > 1 ? `${entry.name}(×${entry.count})` : entry.name;

const activeNote = computed(() => {
  if (activeMetric.value === 'overall') {
    return `Overall: T1 accuracy on ${META.nTotal.toLocaleString('en-US')} SpatialMQA items (single-image multiple choice). Whiskers show the 95% confidence interval over the items.`;
  }
  if (activeMetric.value === 'test') {
    return 'test: accuracy on the held-out test split. test/validation views have no CI whiskers — bars only.';
  }
  return 'validation: accuracy on the validation split. test/validation views have no CI whiskers — bars only.';
});
</script>

<template>
  <section
    data-spatialmqa-bars
    class="mt-8 border border-border bg-card/40 p-4 sm:p-5"
  >
    <div
      class="inline-flex max-w-full flex-wrap border border-border bg-background p-0.5"
      role="group"
      aria-label="Select SpatialMQA metric"
      data-spatialmqa-metric-tabs
    >
      <button
        v-for="metric in METRICS"
        :key="metric.key"
        type="button"
        data-spatialmqa-metric-tab
        :data-spatialmqa-metric-key="metric.key"
        class="h-6 px-2 text-[11px] transition-colors cursor-pointer"
        :class="
          activeMetric === metric.key
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        "
        :aria-pressed="activeMetric === metric.key"
        @click="activeMetric = metric.key"
      >
        {{ metric.label }}
      </button>
    </div>

    <div class="bars mt-3" :data-active-spatialmqa-metric="activeMetric">
      <div class="relative pb-5">
        <div class="chart-grid" aria-hidden="true">
          <span v-for="tick in [0, 25, 50, 75, 100]" :key="`grid-${tick}`" />
        </div>

        <div class="relative space-y-0.5">
          <div
            v-for="row in rows"
            :key="row.model.id"
            data-spatialmqa-bar-row
            :data-model-id="row.model.id"
            :data-value="fmt2(row.value)"
            :data-bar-width="`${widthOf(row).toFixed(2)}%`"
            :title="ciTitle(row.ci)"
            class="bar-row group rounded-[3px] px-0.5 transition-colors hover:bg-accent/40 focus-visible:bg-accent/40"
          >
            <span
              class="bar-label text-muted-foreground group-hover:text-foreground"
              :title="`${row.model.name}${isIncompleteCoverage(row.model) ? ' — coverage below 100%, not treated as a final score' : ''}`"
              data-spatialmqa-bar-label
            >
              {{ row.model.name }}
              <span
                v-if="isIncompleteCoverage(row.model)"
                data-coverage-incomplete
                class="coverage-flag"
              >[coverage]</span>
            </span>

            <div class="relative h-4 min-w-0">
              <div
                data-spatialmqa-bar-fill
                :data-bar-color="familyColor(row.model)"
                class="bar-fill h-4 rounded-[3px]"
                :style="{
                  width: `${widthOf(row)}%`,
                  '--bar-fill': familyColor(row.model),
                  '--bar-opacity': '0.7',
                }"
              />
              <div
                v-if="row.ci"
                data-ci-whisker
                :data-ci-value="fmt2(row.ci.value)"
                :data-ci-lo="fmt2(row.ci.lo)"
                :data-ci-hi="fmt2(row.ci.hi)"
                class="ci-layer pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                <template v-if="row.ci.hi > row.ci.lo">
                  <span
                    data-ci-range
                    class="ci-range absolute top-1/2 h-[1.5px] -translate-y-1/2"
                    :style="{
                      left: `${row.ci.lo.toFixed(2)}%`,
                      width: `${(row.ci.hi - row.ci.lo).toFixed(2)}%`,
                    }"
                  />
                  <span
                    data-ci-cap
                    class="ci-cap absolute top-1/2 h-[6px] w-[1.5px] -translate-y-1/2"
                    :style="{ left: `${row.ci.lo.toFixed(2)}%` }"
                  />
                  <span
                    data-ci-cap
                    class="ci-cap absolute top-1/2 h-[6px] w-[1.5px] -translate-y-1/2"
                    :style="{ left: `${row.ci.hi.toFixed(2)}%` }"
                  />
                </template>
                <span
                  data-ci-point
                  class="ci-point absolute top-1/2 h-[10px] w-[1.5px] -translate-y-1/2"
                  :style="{ left: `${row.ci.value.toFixed(2)}%` }"
                />
              </div>
            </div>

            <span class="value-cell font-mono text-foreground">
              <span data-spatialmqa-bar-value>{{ fmt2(row.value) }}</span>
              <span
                v-if="row.ci"
                data-ci-label
                class="ci-label text-muted-foreground"
              >
                <span data-ci-label-full class="ci-label-full">{{ ciFull(row.ci) }}</span>
                <span data-ci-label-short class="ci-label-short">{{ ciHalf(row.ci) }}</span>
              </span>
            </span>
          </div>
        </div>

        <div class="axis-labels mt-1" aria-hidden="true">
          <span v-for="tick in [0, 25, 50, 75, 100]" :key="`label-${tick}`" data-axis-label>{{ tick }}</span>
        </div>
      </div>
    </div>

    <div
      data-family-legend
      class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-none text-muted-foreground"
    >
      <span
        v-for="entry in legendFamilies"
        :key="`legend-${entry.name}`"
        data-legend-item
        :data-family="entry.name"
        class="inline-flex items-center gap-1"
      >
        <span
          data-legend-dot
          :data-legend-color="familyColor(entry.model)"
          class="inline-block size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: familyColor(entry.model) }"
          aria-hidden="true"
        />
        <span data-legend-text>{{ legendLabel(entry) }}</span>
      </span>
    </div>

    <p
      data-spatialmqa-chart-note
      class="mt-2 min-h-[2.75rem] text-[12px] leading-relaxed text-muted-foreground"
    >
      {{ activeNote }}
    </p>

    <p data-spatialmqa-chart-note class="mt-1 text-[11px] leading-relaxed text-muted-foreground">
      T1 single-task readout, not a composite ranking. MindEdit(T3) and StarLife in-house models are
      pending.
    </p>
  </section>
</template>

<style scoped>
.bars {
  --bar-label-w: 118px;
  --bar-value-w: 92px;
  --bar-gap: 8px;
}

.bar-row {
  display: grid;
  grid-template-columns: var(--bar-label-w) minmax(0, 1fr) var(--bar-value-w);
  align-items: center;
  gap: var(--bar-gap);
  min-height: 26px;
}

.bar-label {
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.coverage-flag {
  margin-left: 3px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  color: var(--muted-foreground);
}

.value-cell {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 3px;
  font-size: 10px;
  white-space: nowrap;
}

.ci-label {
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.ci-label-short {
  display: none;
}

.ci-layer {
  opacity: 0.65;
  transition: opacity 150ms ease-out;
}

.group:hover .ci-layer {
  opacity: 1;
}

.ci-point {
  background-color: var(--foreground);
  opacity: 0.9;
}

.ci-range,
.ci-cap {
  background-color: var(--foreground);
  opacity: 0.4;
}

.bar-fill {
  background-color: var(--bar-fill);
  opacity: var(--bar-opacity, 1);
  transition:
    width 300ms ease-out,
    opacity 300ms ease-out;
}

.group:hover .bar-fill {
  opacity: 1;
}

.chart-grid {
  position: absolute;
  top: 0;
  right: calc(var(--bar-value-w) + var(--bar-gap));
  bottom: 22px;
  left: calc(var(--bar-label-w) + var(--bar-gap));
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.chart-grid span {
  border-left: 1px solid var(--border);
  opacity: 0.7;
}

.axis-labels {
  display: flex;
  justify-content: space-between;
  margin-right: calc(var(--bar-value-w) + var(--bar-gap));
  margin-left: calc(var(--bar-label-w) + var(--bar-gap));
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  color: var(--muted-foreground);
  opacity: 0.8;
}

@media (min-width: 640px) {
  .bars {
    --bar-label-w: 160px;
    --bar-value-w: 140px;
  }
}

@media (max-width: 639px) {
  .ci-label-full {
    display: none;
  }

  .ci-label-short {
    display: inline;
  }
}
</style>
