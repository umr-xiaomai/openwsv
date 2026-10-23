<script setup lang="ts">
import SectionHeader from './SectionHeader.vue';
import CapabilityMatrix from './CapabilityMatrix.vue';
import LeaderboardBars from './LeaderboardBars.vue';
import LeaderboardTable from './LeaderboardTable.vue';
import {
  LEADERBOARDS,
  capabilityOf,
  fmtCount,
  metricLabel,
  sortedRows,
  type Leaderboard,
} from '../data/openwsv';

const boardTitle = (board: Leaderboard): string =>
  board.suite === 'spatialmqa_relation'
    ? 'T1-relation · 关系子集'
    : `${board.capability} · ${capabilityOf(board.capability)?.name ?? board.capability}`;

const boardKinds = (board: Leaderboard): string =>
  Array.from(new Set(board.rows.map((row) => row.kind)))
    .map((kind) => (kind === 'vlm' ? '零样本 VLM' : '结构化世界模型'))
    .join(' · ');
</script>

<template>
  <section id="leaderboard" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="01" title="主榜" eyebrow="Leaderboard · capability matrix">
      同一批题、同一份 GT、同一套冻结框架。能力矩阵按 T1–T8 列出评分口径与出分状态；当前已出分的能力为
      T1（SpatialMQA 及关系子集），其余能力标 pending，不显示分数、不参与排名。
    </SectionHeader>

    <CapabilityMatrix />

    <p class="mt-6 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
      已出分能力按 suite 分板呈现：同一模型在不同 suite 的分数口径不同，不可直接相加或拼接成综合分。
      每板为横状对比图 + 明细表，明细表固定披露
      <span class="font-mono text-foreground/80">uses harness boxes</span>
      列。
    </p>

    <article
      v-for="board in LEADERBOARDS"
      :id="`board-${board.suite}`"
      :key="board.suite"
      class="mt-9 scroll-mt-20"
    >
      <div
        class="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-border/70 pb-2.5"
      >
        <div>
          <div class="flex flex-wrap items-baseline gap-2">
            <h3 class="text-[15px] font-medium tracking-tight text-foreground">
              {{ boardTitle(board) }}
            </h3>
            <span class="font-mono text-[10px] text-muted-foreground">
              {{ board.suite }}
            </span>
          </div>
          <p class="mt-1 font-mono text-[10px] text-muted-foreground">
            n = {{ fmtCount(board.n) }} · 指标 {{ metricLabel(board.metric) }} · {{ boardKinds(board) }}
          </p>
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span class="inline-flex h-5 items-center border border-border bg-background px-1.5">
            {{ sortedRows(board).length }} 个模型
          </span>
          <span class="inline-flex h-5 items-center border border-border bg-background px-1.5">
            冻结框架出分
          </span>
        </div>
      </div>

      <LeaderboardBars :board="board" />
      <LeaderboardTable :board="board" />
    </article>
  </section>
</template>