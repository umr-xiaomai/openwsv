<script setup lang="ts">
import {
  fmtCi,
  fmtCoverage,
  fmtPct,
  isIncompleteCoverage,
  sortedRows,
  type Board,
} from '../data/openwsv';

defineProps<{ board: Board }>();
</script>

<template>
  <div class="w-full overflow-x-auto border border-t-0 border-border bg-card">
    <table class="w-full min-w-[680px] border-collapse text-left text-xs" data-leaderboard-table>
      <thead>
        <tr class="border-b border-border bg-muted/20 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <th class="py-2.5 pl-4 pr-2 text-left">Model</th>
          <th class="py-2.5 px-3 text-right">Score</th>
          <th class="py-2.5 px-3 text-left">95% CI</th>
          <th class="py-2.5 px-3 text-right">Coverage</th>
          <th class="py-2.5 pl-3 pr-4 text-left" title="Whether the row's model reads bounding boxes from the frozen detector">
            uses harness boxes
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60">
        <tr
          v-for="row in sortedRows(board)"
          :key="row.id"
          data-leaderboard-row
          :data-model-id="row.id"
          :data-uses-harness-boxes="String(row.usesHarnessBoxes)"
          class="transition-colors hover:bg-accent/40"
        >
          <td class="py-2.5 pl-4 pr-2">
            <span class="font-medium text-foreground">{{ row.label }}</span>
          </td>
          <td class="py-2.5 px-3 text-right">
            <span class="font-mono text-[14px] font-semibold tabular-nums text-foreground">
              {{ fmtPct(row.value) }}
            </span>
          </td>
          <td class="py-2.5 px-3 font-mono text-[11px] tabular-nums text-muted-foreground">
            {{ fmtCi(row.ci) }}
          </td>
          <td class="py-2.5 px-3 text-right font-mono text-[11px] tabular-nums">
            <span class="text-foreground">{{ fmtCoverage(row.coverage) }}</span>
            <span
              v-if="isIncompleteCoverage(row)"
              class="ml-1 text-[9px] text-foreground/60"
              :title="`Coverage ${fmtCoverage(row.coverage)}: unanswered tasks are excluded from the denominator`"
            >
              [coverage]
            </span>
          </td>
          <td class="py-2.5 pl-3 pr-4">
            <span
              class="font-mono text-[11px]"
              :class="row.usesHarnessBoxes ? 'text-foreground' : 'text-muted-foreground/80'"
              :title="
                row.usesHarnessBoxes
                  ? 'Reads bounding boxes from the frozen detector (structured world-state model rows)'
                  : 'Sees raw input only; does not read framework boxes (VLM rows)'
              "
            >
              {{ row.usesHarnessBoxes }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
