<script setup lang="ts">
import SectionHeader from './SectionHeader.vue';
import {
  DATASETS,
  LEADERBOARDS,
  SHIPPED_COUNT,
  fmtCount,
  sumLeaderboardN,
} from '../data/openwsv';

const suiteMap: Record<string, string[]> = {
  'openwsv-t1': ['spatialmqa', 'spatialmqa_relation'],
  'openwsv-pairs': ['pairs'],
  'openwsv-abstract': ['abstract'],
};

const suitesOf = (id: string): string[] => suiteMap[id] ?? [];

const isShipped = (id: string): boolean =>
  LEADERBOARDS.some((board) => suitesOf(id).includes(board.suite));

const statusOf = (id: string): { label: string; shipped: boolean } => {
  if (isShipped(id)) return { label: '已出分', shipped: true };
  if (id === 'openwsv-abstract') return { label: '仅文本模型', shipped: false };
  return { label: '待跑', shipped: false };
};

const unitOf = (id: string): string => (id === 'openwsv-pairs' ? '对' : '题');

const sizeLabel = (dataset: (typeof DATASETS)[number]): string =>
  dataset.n > 0 ? `${fmtCount(dataset.n)} ${unitOf(dataset.id)}` : '题量待定';
</script>

<template>
  <section id="datasets" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="03" title="数据集" eyebrow="Datasets · three suites">
      三套 suite 共用同一冻结框架与同一判分口径。每套按
      <span class="font-mono text-foreground/90">85% 公开 / 15% 私有 holdout</span>
      切分：公开部分随题面发布，私有部分只在发布前做一次性核验，不参与调参、不公开题目。
      已出分 {{ SHIPPED_COUNT }} 项能力；suite 尚未出分时只描述数据，不显示任何分数。
    </SectionHeader>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article
        v-for="dataset in DATASETS"
        :key="dataset.id"
        :data-dataset-id="dataset.id"
        class="flex flex-col border border-border bg-card/40 p-4 transition-colors hover:border-foreground/20"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {{ dataset.id }}
          </span>
          <span
            class="inline-flex h-5 shrink-0 items-center border px-1.5 font-mono text-[9px] uppercase tracking-wider"
            :class="
              statusOf(dataset.id).shipped
                ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300'
                : 'border-border bg-muted/30 text-muted-foreground'
            "
          >
            {{ statusOf(dataset.id).label }}
          </span>
        </div>

        <h3 class="mt-2.5 text-[15px] font-medium tracking-tight text-foreground">
          {{ dataset.name }}
        </h3>
        <div class="mt-1 font-mono text-[11px] text-foreground/70">{{ sizeLabel(dataset) }}</div>

        <p class="mt-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">
          {{ dataset.desc }}
        </p>

        <div class="mt-3 flex flex-wrap gap-1 border-t border-border/60 pt-2.5">
          <span
            v-for="suite in suitesOf(dataset.id)"
            :key="suite"
            class="inline-flex h-5 items-center border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground"
          >
            {{ suite }}
          </span>
          <span
            v-if="suitesOf(dataset.id).length === 0"
            class="font-mono text-[10px] text-muted-foreground/60"
          >
            suite 未定
          </span>
        </div>
      </article>
    </div>

    <p class="mt-3 text-[11px] leading-relaxed text-muted-foreground">
      已出分题量合计
      <span class="font-mono text-foreground/80">{{ fmtCount(sumLeaderboardN()) }}</span>
      题（SpatialMQA 1,612 + 关系子集 305）；不同 suite 的题面与切分独立，分数不可跨 suite 相加。
    </p>
  </section>
</template>