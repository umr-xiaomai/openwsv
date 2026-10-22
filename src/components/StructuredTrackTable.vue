<script setup lang="ts">
import raw from '../data/structured-track.generated.json';

interface Metric {
  value: number;
  ci95: [number, number] | null;
  n?: number;
}

interface StructuredRow {
  id: string;
  name: string;
  family: string;
  provider: string;
  mode: string;
  label: string;
  metrics: {
    change_top1: Metric;
    change_macro_f1: Metric;
    relation_type: Metric;
    rel_pos: Metric;
    attrs: Metric;
  };
  n: number;
  notes: string;
}

const meta = raw.meta as {
  protocol: string;
  track: string;
  dataset: string;
  split: string;
  nPairs: number;
  sampleSeed: number;
  generated: string;
  source: string;
  note: string;
};

const rows = raw.models as StructuredRow[];

const formatPct = (value: number): string => `${Math.round(value * 100) / 100}%`;
const formatCi = (ci: [number, number] | null): string =>
  ci ? `[${ci[0].toFixed(1)}–${ci[1].toFixed(1)}]` : '—';

const COLUMNS = [
  { key: 'change_top1', label: 'Change top-1' },
  { key: 'change_macro_f1', label: 'Change macro-F1' },
  { key: 'relation_type', label: 'Relation type' },
  { key: 'rel_pos', label: 'Spatial position' },
  { key: 'attrs', label: 'Contact & support' },
] as const;
</script>

<template>
  <div data-structured-track-view class="mt-10">
    <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div class="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {{ meta.protocol }} task matrix · structured-input track · {{ meta.dataset }}
      </div>
      <span class="text-[11px] font-mono text-muted-foreground">
        {{ rows.length }} entries · {{ meta.nPairs }} test pairs · seed {{ meta.sampleSeed }}
      </span>
    </div>

    <p
      data-structured-track-scope
      class="mb-4 max-w-3xl text-[12px] leading-relaxed text-muted-foreground"
    >
      Separate track for models that take <span class="font-mono text-foreground">before/after frames + detector boxes</span>
      and return structured events instead of text. It is <span class="text-foreground">not comparable</span>
      with the SpatialMQA rows above: different inputs (ground-truth boxes, no detector in the loop),
      different answer format, different sample ({{ meta.nPairs }} test pairs). CI: 95% bootstrap over
      pairs, 1,000 draws. Event F1 and state consistency are not scored in this run.
    </p>

    <div class="overflow-x-auto border border-border">
      <table class="w-full border-collapse text-[13px]">
        <thead>
          <tr class="border-b border-border bg-muted/40">
            <th class="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Model
            </th>
            <th class="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Mode
            </th>
            <th
              v-for="column in COLUMNS"
              :key="column.key"
              class="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              {{ column.label }}
            </th>
            <th class="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              n
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            data-structured-row
            :data-model="row.id"
            :data-mode="row.mode"
            class="border-b border-border/60 last:border-0 hover:bg-accent/40"
          >
            <td class="px-3 py-2">
              <div class="font-medium text-foreground">{{ row.name }}</div>
              <div class="mt-0.5 text-[11px] text-muted-foreground">{{ row.label }}</div>
            </td>
            <td class="px-3 py-2">
              <span class="font-mono text-[11px] text-muted-foreground">{{ row.mode }}</span>
            </td>
            <td
              v-for="column in COLUMNS"
              :key="column.key"
              class="px-3 py-2 text-right"
              :data-metric="column.key"
              :data-value="row.metrics[column.key].value"
            >
              <span class="font-mono text-foreground">{{ formatPct(row.metrics[column.key].value) }}</span>
              <div class="font-mono text-[10px] text-muted-foreground">
                {{ formatCi(row.metrics[column.key].ci95) }}
              </div>
            </td>
            <td class="px-3 py-2 text-right font-mono text-muted-foreground">{{ row.n }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="mt-3 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
      <li v-for="row in rows" :key="`note-${row.id}`">
        <span class="font-mono text-foreground">{{ row.mode }}</span>: {{ row.notes }}
      </li>
      <li>{{ meta.note }}</li>
      <li>
        Source:
        <a class="underline decoration-dotted underline-offset-2 hover:text-foreground" :href="meta.source">
          {{ meta.source }}
        </a>
        · generated {{ meta.generated }} · split {{ meta.split }}
      </li>
    </ul>
  </div>
</template>
