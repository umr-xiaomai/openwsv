<script setup lang="ts">
import SectionHeader from './SectionHeader.vue';
import { BENCHMARK, PROTOCOL } from '../data/openwsv';

const pad = (index: number): string => String(index + 1).padStart(2, '0');
</script>

<template>
  <section id="protocol" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="02" title="评测协议" eyebrow="Protocol · frozen five">
      出分结果只有在同一冻结框架下才可比。OpenWSV 把数据、检测器、提示词、判分器与种子五件套冻结在
      <span class="font-mono text-foreground/90">{{ BENCHMARK.framework }}</span>
      里随结果一起发布；任何组件变更都必须重新出分，并递增框架版本。
    </SectionHeader>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <!-- 五件套清单 -->
      <div data-protocol-components class="border border-border bg-card/40">
        <div
          class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border bg-muted/20 px-4 py-2.5"
        >
          <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            冻结五件套
          </span>
          <span class="font-mono text-[10px] text-muted-foreground">
            {{ BENCHMARK.framework }} · v{{ BENCHMARK.version }}
          </span>
        </div>

        <div class="divide-y divide-border/60">
          <div
            v-for="(component, index) in PROTOCOL.components"
            :key="component.name"
            :data-protocol-component="component.name"
            class="grid grid-cols-[auto_1fr] gap-x-4 px-4 py-3"
          >
            <div class="flex flex-col items-start gap-1">
              <span class="font-mono text-[10px] tabular-nums text-muted-foreground/70">
                {{ pad(index) }}
              </span>
              <span class="whitespace-nowrap text-[13px] font-medium text-foreground">
                {{ component.name }}
              </span>
            </div>
            <p class="min-w-0 self-center break-all font-mono text-[10.5px] leading-relaxed text-muted-foreground">
              {{ component.frozen }}
            </p>
          </div>
        </div>

        <p class="border-t border-border px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {{ PROTOCOL.notes }}
        </p>
      </div>

      <!-- 为什么检测器属于框架 -->
      <aside data-protocol-detector-note class="border border-border bg-card/40 p-4 sm:p-5">
        <div class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          检测器为什么属于框架
        </div>
        <h3 class="mt-2 text-[15px] font-medium leading-snug text-foreground">
          框是题面的一部分，不是参赛者的自由度
        </h3>
        <p class="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
          如果允许每支队伍自选检测器，分数差异就会混入检测质量本身：同一个空间关系题，框的位置一旦不同，题目难度就变了。OpenWSV 把
          <span class="font-mono text-foreground/90">GroundingDINO-tiny</span>
          的权重、阈值、前后处理与输出 bbox 一起冻结，作为题面的一部分下发。
        </p>
        <ul class="mt-3 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
          <li class="flex gap-2">
            <span class="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-foreground/50" aria-hidden="true" />
            <span>VLM 行不读取这些框（<span class="font-mono text-foreground/80">uses harness boxes = false</span>），只看原始图像与题面。</span>
          </li>
          <li class="flex gap-2">
            <span class="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-foreground/50" aria-hidden="true" />
            <span>结构化世界模型行使用同一套框（<span class="font-mono text-foreground/80">true</span>），两种行单独成组，不混排。</span>
          </li>
          <li class="flex gap-2">
            <span class="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-foreground/50" aria-hidden="true" />
            <span>于是两类模型的差异只来自世界状态推理本身，而不是检测器。</span>
          </li>
        </ul>
        <div class="mt-4 border border-border bg-background px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
          组件变更 → 重新出分 → 递增 {{ BENCHMARK.framework }} 版本号
        </div>
      </aside>
    </div>
  </section>
</template>