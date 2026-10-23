<script setup lang="ts">
import {
  fmtCi,
  fmtCount,
  fmtCoverage,
  fmtPct,
  isIncompleteCoverage,
  kindLabel,
  metricLabel,
  sortedRows,
  type Leaderboard,
} from '../data/openwsv';

defineProps<{ board: Leaderboard }>();
</script>

<template>
  <div class="w-full overflow-x-auto border border-t-0 border-border bg-card">
    <table class="w-full min-w-[760px] border-collapse text-left text-xs" data-leaderboard-table>
      <thead>
        <tr class="border-b border-border bg-muted/20 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <th class="w-10 py-2.5 pl-4 pr-2 text-left">#</th>
          <th class="py-2.5 px-2 text-left">模型</th>
          <th class="py-2.5 px-2 text-right">{{ metricLabel(board.metric) }}</th>
          <th class="py-2.5 px-2 text-left">95% CI</th>
          <th class="py-2.5 px-2 text-right">覆盖率</th>
          <th class="py-2.5 pl-2 pr-4 text-left" title="该行模型是否读取冻结检测器输出的 bbox">
            uses harness boxes
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60">
        <tr
          v-for="(row, index) in sortedRows(board)"
          :key="row.id"
          data-leaderboard-row
          :data-model-id="row.id"
          :data-kind="row.kind"
          :data-uses-harness-boxes="String(row.usesHarnessBoxes)"
          class="transition-colors hover:bg-accent/40"
        >
          <td class="py-2.5 pl-4 pr-2 font-mono text-[11px] tabular-nums text-muted-foreground/70">
            {{ index + 1 }}
          </td>
          <td class="py-2.5 px-2">
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="font-medium text-foreground">{{ row.label }}</span>
              <span class="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {{ kindLabel(row.kind) }}
              </span>
            </div>
          </td>
          <td class="py-2.5 px-2 text-right">
            <span class="font-mono text-[14px] font-semibold tabular-nums text-foreground">
              {{ fmtPct(row.value) }}
            </span>
          </td>
          <td class="py-2.5 px-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            {{ fmtCi(row.ci) }}
          </td>
          <td class="py-2.5 px-2 text-right font-mono text-[11px] tabular-nums">
            <span class="text-foreground">{{ fmtCoverage(row.coverage) }}</span>
            <span
              v-if="isIncompleteCoverage(row)"
              class="ml-1 text-[9px] text-foreground/60"
              title="覆盖率低于 100%，不视为最终分"
            >
              [coverage]
            </span>
          </td>
          <td class="py-2.5 pl-2 pr-4">
            <span
              class="font-mono text-[11px]"
              :class="row.usesHarnessBoxes ? 'text-foreground' : 'text-muted-foreground/80'"
              :title="
                row.usesHarnessBoxes
                  ? '读取冻结检测器的 bbox（结构化世界模型行）'
                  : '只看原始图像与题面，不读取框架检测框（VLM 行）'
              "
            >
              {{ row.usesHarnessBoxes }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="mt-2 text-[11px] leading-relaxed text-muted-foreground">
    {{ metricLabel(board.metric) }} 基于 n = {{ fmtCount(board.n) }} 的完整回答；
    覆盖率 = 完整回答题数 / 总题数，低于 100% 的行不视为最终分。
    <span class="font-mono text-foreground/80">uses harness boxes</span>
    = 该行是否读取冻结检测器
    <span class="font-mono">GroundingDINO-tiny</span>
    的 bbox：VLM 行只看原始图像与题面，标 false；结构化世界模型行使用同一套框，标 true，两类行不混排。
  </p>
</template>