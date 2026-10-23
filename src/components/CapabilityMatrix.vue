<script setup lang="ts">
import { CAPABILITIES, PENDING_COUNT, SHIPPED_COUNT, metricLabel, suiteLabel } from '../data/openwsv';
</script>

<template>
  <div data-capability-matrix class="border border-border bg-card/40">
    <div
      class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-muted/20 px-4 py-2.5"
    >
      <div class="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        能力矩阵 · T1–T8
      </div>
      <div class="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          shipped {{ SHIPPED_COUNT }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block size-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
          pending {{ PENDING_COUNT }}
        </span>
      </div>
    </div>

    <div class="w-full overflow-x-auto">
      <table class="w-full min-w-[820px] border-collapse text-left text-xs" data-capability-table>
        <thead>
          <tr class="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <th class="py-2 pl-4 pr-2 text-left">ID</th>
            <th class="py-2 px-2 text-left">能力</th>
            <th class="py-2 px-2 text-left">状态</th>
            <th class="py-2 px-2 text-left">指标</th>
            <th class="py-2 px-2 text-left">suite</th>
            <th class="py-2 pl-2 pr-4 text-left">说明</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/60">
          <tr
            v-for="capability in CAPABILITIES"
            :key="capability.id"
            :data-capability-id="capability.id"
            :data-status="capability.status"
            class="transition-colors hover:bg-accent/30"
          >
            <td class="py-2.5 pl-4 pr-2 align-top font-mono text-[11px] text-foreground/80">
              {{ capability.id }}
            </td>
            <td class="py-2.5 px-2 align-top">
              <span class="text-[13px] font-medium text-foreground">{{ capability.name }}</span>
            </td>
            <td class="py-2.5 px-2 align-top">
              <span
                class="inline-flex h-5 items-center border px-1.5 font-mono text-[10px] uppercase tracking-wider"
                :class="
                  capability.status === 'shipped'
                    ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300'
                    : 'border-border bg-muted/30 text-muted-foreground'
                "
              >
                {{ capability.status }}
              </span>
            </td>
            <td class="py-2.5 px-2 align-top font-mono text-[11px] text-muted-foreground">
              {{ capability.status === 'shipped' ? metricLabel(capability.metric) : '—' }}
            </td>
            <td class="py-2.5 px-2 align-top">
              <div v-if="capability.suites.length > 0" class="flex flex-wrap gap-1">
                <a
                  v-for="suite in capability.suites"
                  :key="suite"
                  :href="`#board-${suite}`"
                  class="inline-flex h-5 items-center border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {{ suiteLabel(suite) }}
                </a>
              </div>
              <span v-else class="font-mono text-[11px] text-muted-foreground/70">—</span>
            </td>
            <td class="py-2.5 pl-2 pr-4 align-top text-[11px] leading-relaxed text-muted-foreground">
              {{ capability.note }}
              <a
                v-if="capability.status === 'shipped' && capability.suites.length > 0"
                :href="`#board-${capability.suites[0]}`"
                class="ml-1.5 whitespace-nowrap font-mono text-[10px] text-foreground/80 underline decoration-border underline-offset-2 hover:text-foreground"
              >
                查看榜单 →
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="border-t border-border px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
      shipped = 已用冻结框架出分；pending = 协议已定、尚未出分。pending 能力不显示分数，也不参与排名。
    </p>
  </div>
</template>