<script setup lang="ts">
import { ArrowDownRight, Terminal, Award, Layers, ShieldCheck, Sparkles } from 'lucide-vue-next';
import {
  BENCHMARK,
  BOARDS,
  MODEL_COUNT,
  SHIPPED_BOARDS,
  getOverallLeader,
  fmtPct,
} from '../data/openwsv';

defineEmits<{
  (e: 'navigate', targetId: string): void;
}>();

const leader = getOverallLeader();

const meta = [
  `${BOARDS.length} boards`,
  `${SHIPPED_BOARDS.length} scored`,
  `${MODEL_COUNT} models`,
  `framework ${BENCHMARK.framework}`,
];
</script>

<template>
  <section id="top" class="relative overflow-hidden border-b border-border">
    <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
      <h1
        class="flex items-center gap-3 text-[48px] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground sm:gap-5 sm:text-[68px]"
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

      <p class="mt-3 font-mono text-[13px] tracking-[0.04em] text-muted-foreground sm:text-sm">
        Independent World-State Vision & Grounding Benchmark
      </p>

      <p class="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/90 sm:text-base">
        One shared task set, one ground truth and one frozen framework: text-only VLMs and
        structured world-state models are evaluated under byte-identical conditions on spatial understanding,
        object relations and physical state changes.
      </p>

      <!-- Action buttons -->
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
          @click="$emit('navigate', 'leaderboard')"
        >
          <span>Explore Leaderboard</span>
          <ArrowDownRight class="size-3.5" />
        </button>
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          @click="$emit('navigate', 'repro')"
        >
          <span>Reproduce Results</span>
          <Terminal class="size-3.5 text-muted-foreground" />
        </button>
        <span class="font-mono text-[11px] text-muted-foreground sm:ml-2">
          {{ meta.join(' · ') }}
        </span>
      </div>

      <!-- Artificial Analysis Style KPI Insights Ticker -->
      <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <!-- Top Performer -->
        <div class="rounded-lg border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs transition-colors hover:border-foreground/30">
          <div class="flex items-center justify-between text-muted-foreground mb-1">
            <span class="text-[11px] font-medium tracking-wide uppercase">Top Performer</span>
            <Award class="size-3.5 text-amber-500" />
          </div>
          <div class="font-mono text-base font-bold text-foreground truncate">
            {{ leader?.label ?? 'gemini-3.8-flash' }}
          </div>
          <div class="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground font-mono">
            <span class="text-emerald-500 font-semibold">{{ leader ? fmtPct(leader.value) : '93.98%' }}</span>
            <span>· Overall Score</span>
          </div>
        </div>

        <!-- Task Scale -->
        <div class="rounded-lg border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs transition-colors hover:border-foreground/30">
          <div class="flex items-center justify-between text-muted-foreground mb-1">
            <span class="text-[11px] font-medium tracking-wide uppercase">Evaluated Scale</span>
            <Layers class="size-3.5 text-sky-500" />
          </div>
          <div class="font-mono text-base font-bold text-foreground">
            3,000 Tasks
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground font-mono">
            Across T4–T7 capabilities
          </div>
        </div>

        <!-- Dual Architecture -->
        <div class="rounded-lg border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs transition-colors hover:border-foreground/30">
          <div class="flex items-center justify-between text-muted-foreground mb-1">
            <span class="text-[11px] font-medium tracking-wide uppercase">Dual Architecture</span>
            <Sparkles class="size-3.5 text-purple-500" />
          </div>
          <div class="font-mono text-base font-bold text-foreground">
            VLM vs World
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground font-mono">
            Directly cross-aligned
          </div>
        </div>

        <!-- Integrity -->
        <div class="rounded-lg border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs transition-colors hover:border-foreground/30">
          <div class="flex items-center justify-between text-muted-foreground mb-1">
            <span class="text-[11px] font-medium tracking-wide uppercase">Rigor & Fidelity</span>
            <ShieldCheck class="size-3.5 text-emerald-500" />
          </div>
          <div class="font-mono text-base font-bold text-foreground">
            Deterministic
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground font-mono">
            0 LLM judge · 1k bootstrap
          </div>
        </div>
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
