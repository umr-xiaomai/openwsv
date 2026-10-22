<script setup lang="ts">
import raw from '../data/spatialmqa.generated.json';

interface SplitResult {
  accuracy: number;
  n: number;
}

interface SpatialMqaRow {
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
    test: SplitResult;
    validation: SplitResult;
  };
}

const meta = raw.meta as {
  protocol: string;
  dataset: string;
  capability: string;
  nTotal: number;
  generated: string;
};

const rows = (raw.models as SpatialMqaRow[])
  .slice()
  .sort((a, b) => b.accuracy - a.accuracy);

const formatPct = (value: number): string => `${Math.round(value * 100) / 100}%`;
const formatCount = (value: number): string => value.toLocaleString('en-US');
const isIncompleteCoverage = (row: SpatialMqaRow): boolean => row.coverage < 100 || !row.complete;
</script>

<template>
  <div data-spatialmqa-view>
    <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div class="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {{ meta.protocol }} task matrix · {{ meta.capability }} · {{ meta.dataset }}
      </div>
      <span class="text-[11px] font-mono text-muted-foreground">
        {{ rows.length }} models · {{ formatCount(meta.nTotal) }} items
      </span>
    </div>

    <p data-spatialmqa-scope class="mb-4 max-w-3xl text-[12px] leading-relaxed text-muted-foreground">
      T1 single-task view: {{ meta.dataset }} is a single-image multiple-choice task. This is one
      capability in the v2 task matrix, not a composite ranking. Rows with coverage below 100% are
      marked <span class="font-mono text-foreground">[coverage]</span> and are not treated as final
      scores. MindEdit(T3) is pending; StarLife in-house models are pending.
    </p>

    <div
      role="region"
      aria-label="SpatialMQA v2 results table"
      class="w-full overflow-x-auto border border-border bg-card"
    >
      <table class="w-full min-w-[720px] text-left text-xs border-collapse" data-spatialmqa-table>
        <thead>
          <tr class="border-b border-border bg-muted/20 text-muted-foreground font-mono">
            <th class="py-2.5 pl-4 pr-3 min-w-[210px]">Model</th>
            <th class="py-2.5 px-3 text-right">Accuracy</th>
            <th class="py-2.5 px-3">95% CI</th>
            <th class="py-2.5 px-3 text-right">Coverage</th>
            <th class="py-2.5 px-3 text-right">test</th>
            <th class="py-2.5 pl-3 pr-4 text-right">validation</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/60">
          <tr
            v-for="row in rows"
            :key="row.id"
            data-spatialmqa-row
            :data-model-id="row.id"
            class="hover:bg-accent/40 transition-colors"
          >
            <td class="py-3 pl-4 pr-3">
              <div class="flex items-center gap-2">
                <span class="font-medium text-foreground">{{ row.name }}</span>
                <span class="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  zero-shot
                </span>
              </div>
              <div class="mt-0.5 text-[10px] font-mono text-muted-foreground">
                {{ row.provider }}
              </div>
            </td>
            <td class="py-3 px-3 text-right">
              <span
                data-spatialmqa-accuracy
                class="font-mono text-[15px] font-semibold tabular-nums text-foreground"
              >
                {{ formatPct(row.accuracy) }}
              </span>
            </td>
            <td class="py-3 px-3 font-mono tabular-nums text-muted-foreground">
              {{ formatPct(row.ci95[0]) }} – {{ formatPct(row.ci95[1]) }}
            </td>
            <td class="py-3 px-3 text-right font-mono tabular-nums">
              <span class="text-foreground">{{ formatPct(row.coverage) }}</span>
              <span
                v-if="isIncompleteCoverage(row)"
                data-coverage-incomplete
                class="ml-1 text-[10px] text-foreground/70"
                title="Coverage below 100% — not treated as a final score"
              >
                [coverage]
              </span>
            </td>
            <td class="py-3 px-3 text-right font-mono tabular-nums">
              <span class="text-foreground">{{ formatPct(row.bySplit.test.accuracy) }}</span>
              <span class="block text-[10px] text-muted-foreground">
                n={{ formatCount(row.bySplit.test.n) }}
              </span>
            </td>
            <td class="py-3 pl-3 pr-4 text-right font-mono tabular-nums">
              <span class="text-foreground">{{ formatPct(row.bySplit.validation.accuracy) }}</span>
              <span class="block text-[10px] text-muted-foreground">
                n={{ formatCount(row.bySplit.validation.n) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p data-spatialmqa-note class="mt-2 text-[11px] leading-relaxed text-muted-foreground">
      Accuracy is the percentage of complete responses on {{ formatCount(meta.nTotal) }} items;
      95% CI is a bootstrap interval. Coverage is complete responses / {{ formatCount(meta.nTotal) }}.
      This table is a T1 task readout, not a composite leaderboard score.
    </p>
  </div>
</template>
