<script setup lang="ts">
import { BENCHMARK, REPRO } from '../data/openwsv';

const NAV_ITEMS = [
  { id: 'leaderboard', label: '主榜' },
  { id: 'protocol', label: '评测协议' },
  { id: 'datasets', label: '数据集' },
  { id: 'repro', label: '复现' },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <footer class="mt-20 border-t border-border bg-card/40">
    <div class="mx-auto max-w-6xl px-4 py-9 sm:px-6">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
        <div>
          <div class="flex items-center gap-2.5">
            <svg
              class="h-5 w-auto shrink-0 text-foreground"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" />
              <line x1="16" y1="2" x2="16" y2="30" />
              <line x1="2" y1="10" x2="30" y2="22" />
              <line x1="30" y1="10" x2="2" y2="22" />
            </svg>
            <span class="text-[15px] font-semibold tracking-tight text-foreground">
              {{ BENCHMARK.name }}
            </span>
            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {{ BENCHMARK.short }}
            </span>
          </div>
          <p class="mt-2 font-mono text-[11px] text-muted-foreground">
            WSV · Open World-State Vision Benchmark
          </p>
          <p class="mt-2 max-w-md text-[12px] leading-relaxed text-muted-foreground">
            同一批题、同一份 GT、同一套冻结框架，评测多模态模型与结构化世界模型的空间理解、物品关系与状态变化能力。
          </p>
        </div>

        <nav class="flex flex-col gap-1.5" aria-label="页脚导航">
          <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Navigate
          </span>
          <button
            v-for="item in NAV_ITEMS"
            :key="item.id"
            type="button"
            class="w-fit cursor-pointer text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            @click="scrollTo(item.id)"
          >
            {{ item.label }}
          </button>
          <a
            :href="REPRO.repo"
            target="_blank"
            rel="noopener noreferrer"
            class="w-fit text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            starlife_eval ↗
          </a>
        </nav>

        <dl class="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-2 font-mono text-[11px]">
          <dt class="text-muted-foreground/70">更新</dt>
          <dd class="text-foreground/90">{{ BENCHMARK.updated }}</dd>
          <dt class="text-muted-foreground/70">框架</dt>
          <dd class="text-foreground/90">{{ BENCHMARK.framework }}</dd>
          <dt class="text-muted-foreground/70">数据版本</dt>
          <dd class="text-foreground/90">v{{ BENCHMARK.version }}</dd>
          <dt class="text-muted-foreground/70">许可</dt>
          <dd class="text-foreground/90">CC BY 4.0</dd>
          <dt class="text-muted-foreground/70">联系</dt>
          <dd class="text-foreground/90">contact@example.com（占位）</dd>
        </dl>
      </div>

      <div
        class="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border/60 pt-4 font-mono text-[10px] text-muted-foreground/80"
      >
        <span>
          data · src/data/openwsv.generated.json · 由 {{ BENCHMARK.framework }} 冻结包生成
        </span>
        <span>静态站点 · 运行时无 API 调用 · 不收集访问数据</span>
      </div>
    </div>
  </footer>
</template>