<script setup lang="ts">
import { ArrowDownRight, Database, ShieldCheck } from 'lucide-vue-next';
import {
  BENCHMARK,
  LEADERBOARDS,
  MODEL_COUNT,
  PENDING_COUNT,
  SHIPPED_COUNT,
} from '../data/openwsv';

defineEmits<{
  (e: 'navigate', targetId: string): void;
}>();

const stats = [
  { label: '能力矩阵', value: 'T1–T8' },
  { label: '已出分能力', value: `${SHIPPED_COUNT} / ${SHIPPED_COUNT + PENDING_COUNT}` },
  { label: '已出分 suite', value: String(LEADERBOARDS.length) },
  { label: '参评模型', value: String(MODEL_COUNT) },
];
</script>

<template>
  <section id="top" class="relative overflow-hidden border-b border-border">
    <!-- 轻网格背景：只在 Hero 内，信息密度视觉基底 -->
    <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
      <div
        class="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        <span class="inline-flex items-center gap-1.5">
          <span class="inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Open World-State Vision Benchmark
        </span>
        <span class="text-border">/</span>
        <span>framework {{ BENCHMARK.framework }}</span>
        <span class="text-border">/</span>
        <span>v{{ BENCHMARK.version }} · {{ BENCHMARK.updated }}</span>
      </div>

      <div class="mt-6 grid grid-cols-1 items-end gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <h1
            class="flex items-center gap-3 text-[52px] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground sm:gap-5 sm:text-[76px]"
          >
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="h-[0.78em] w-auto shrink-0"
            >
              <circle cx="24" cy="24" r="20" stroke-dasharray="3 3" opacity="0.35" />
              <polygon points="24,6 42,16 42,32 24,42 6,32 6,16" />
              <line x1="24" y1="6" x2="24" y2="42" />
              <line x1="6" y1="16" x2="42" y2="32" />
              <line x1="42" y1="16" x2="6" y2="32" />
              <circle cx="24" cy="24" r="3.5" fill="currentColor" />
            </svg>
            <span>OpenWSV</span>
          </h1>

          <p class="mt-4 font-mono text-[13px] tracking-[0.04em] text-muted-foreground sm:text-sm">
            WSV · Open World-State Vision Benchmark
          </p>

          <p class="mt-6 max-w-3xl text-pretty text-[15px] leading-relaxed text-foreground/90 sm:text-base">
            同一批题、同一份 GT、同一套冻结框架，评测多模态模型与结构化世界模型的空间理解、物品关系与状态变化能力。
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-9 cursor-pointer items-center gap-2 bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
              @click="$emit('navigate', 'leaderboard')"
            >
              <span>查看主榜</span>
              <ArrowDownRight class="size-3.5" />
            </button>
            <button
              type="button"
              class="inline-flex h-9 cursor-pointer items-center gap-2 border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              @click="$emit('navigate', 'protocol')"
            >
              <span>评测协议</span>
              <ShieldCheck class="size-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              class="inline-flex h-9 cursor-pointer items-center gap-2 border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              @click="$emit('navigate', 'datasets')"
            >
              <span>数据集</span>
              <Database class="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-px border border-border bg-border font-mono">
          <div v-for="stat in stats" :key="stat.label" class="bg-background px-3.5 py-3">
            <dt class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {{ stat.label }}
            </dt>
            <dd class="mt-1.5 text-base font-semibold tracking-tight text-foreground tabular-nums">
              {{ stat.value }}
            </dd>
          </div>
        </dl>
      </div>

      <div
        class="mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-[11px] leading-relaxed text-muted-foreground"
      >
        <span>
          所有分数均为冻结框架
          <span class="font-mono text-foreground">{{ BENCHMARK.framework }}</span>
          的单次发布快照；pending 能力不显示分数，待跑能力不参与排名。
        </span>
        <span class="font-mono text-[10px] text-muted-foreground/80">
          data · src/data/openwsv.generated.json
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-grid {
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.16;
  mask-image: radial-gradient(ellipse 80% 70% at 30% 10%, black 30%, transparent 78%);
}
</style>