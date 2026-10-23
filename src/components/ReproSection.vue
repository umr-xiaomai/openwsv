<script setup lang="ts">
import { ref } from 'vue';
import { ArrowUpRight, Check, Copy, ExternalLink, Github, Terminal } from 'lucide-vue-next';
import SectionHeader from './SectionHeader.vue';
import { BENCHMARK, DATASETS, REPRO, SUITE_OPTIONS } from '../data/openwsv';

const copied = ref(false);

const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(REPRO.command);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    copied.value = false;
  }
};

const releaseUrl = REPRO.release ?? REPRO.repo;
</script>

<template>
  <section id="repro" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="04" title="复现" eyebrow="Reproduce · one command">
      所有结果都能用冻结包的命令行入口重跑。命令按 suite 与模型 id 执行，结果 JSON 契约、bootstrap CI 与
      McNemar 检验的实现都在
      <span class="font-mono text-foreground/90">starlife_eval</span>
      仓库中，原始响应单独存档。
    </SectionHeader>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <!-- 命令 -->
      <div class="border border-border bg-card/40">
        <div
          class="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-2.5"
        >
          <span class="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Terminal class="size-3.5" />
            bash · {{ BENCHMARK.framework }}
          </span>
          <button
            type="button"
            class="inline-flex h-6 cursor-pointer items-center gap-1.5 border border-border bg-background px-2 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            @click="copyCommand"
          >
            <Check v-if="copied" class="size-3 text-emerald-300" />
            <Copy v-else class="size-3" />
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>

        <pre
          data-repro-command
          class="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-foreground"
        ><span class="select-none text-muted-foreground/60">$ </span>{{ REPRO.command }}</pre>

        <div class="border-t border-border px-4 py-3">
          <div class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            --suite 可选
          </div>
          <div class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="suite in SUITE_OPTIONS"
              :key="suite"
              class="inline-flex h-5 items-center border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground"
            >
              {{ suite }}
            </span>
          </div>
          <p class="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            <span class="font-mono text-foreground/80">&lt;id&gt;</span>
            取主榜中的模型 id（如
            <span class="font-mono text-foreground/80">qwen3.8-flash</span>
            ）。三套 suite：
            <span class="font-mono">{{ DATASETS.map((d) => d.id).join(' · ') }}</span>
          </p>
        </div>
      </div>

      <!-- 链接 -->
      <aside class="flex flex-col border border-border bg-card/40">
        <div class="border-b border-border bg-muted/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Artifacts
        </div>
        <div class="divide-y divide-border/60">
          <a
            :href="REPRO.repo"
            target="_blank"
            rel="noopener noreferrer"
            data-repro-repo
            class="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
          >
            <span>
              <span class="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <Github class="size-3.5" />
                评测仓库
              </span>
              <span class="mt-1 block font-mono text-[10px] text-muted-foreground">
                TYWIM/starlife_eval
              </span>
            </span>
            <ArrowUpRight class="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </a>

          <a
            :href="releaseUrl"
            target="_blank"
            rel="noopener noreferrer"
            data-repro-release
            class="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
          >
            <span>
              <span class="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <ExternalLink class="size-3.5" />
                原始响应 release
              </span>
              <span class="mt-1 block font-mono text-[10px] text-muted-foreground">
                openwsv-1.0 · 逐题原始输出
              </span>
            </span>
            <ArrowUpRight class="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </a>

          <a
            :href="`${REPRO.repo}#readme`"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
          >
            <span>
              <span class="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <ExternalLink class="size-3.5" />
                结果 JSON 契约
              </span>
              <span class="mt-1 block font-mono text-[10px] text-muted-foreground">
                workspace schema · CI · McNemar
              </span>
            </span>
            <ArrowUpRight class="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </a>
        </div>

        <p class="mt-auto border-t border-border px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          单次完整 suite 运行约 1–3 小时（取决于模型与并发）。命令不联网时使用缓存响应回放；加
          <span class="font-mono text-foreground/80">--live</span>
          才发起真实调用。
        </p>
      </aside>
    </div>
  </section>
</template>