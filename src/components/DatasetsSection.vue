<script setup lang="ts">
import { ref } from 'vue';
import { ArrowUpRight } from 'lucide-vue-next';
import SectionHeader from './SectionHeader.vue';
import DatasetModal from './DatasetModal.vue';
import { DATASETS } from '../data/openwsv';

const activeDatasetId = ref<string | null>(null);
</script>

<template>
  <section id="datasets" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="03" title="Datasets" />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article
        v-for="dataset in DATASETS"
        :key="dataset.id"
        :data-dataset-id="dataset.id"
        role="button"
        tabindex="0"
        class="group relative flex cursor-pointer flex-col border border-border bg-card/40 p-4 transition-all hover:border-foreground/40 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
        @click="activeDatasetId = dataset.id"
        @keydown.enter.prevent="activeDatasetId = dataset.id"
        @keydown.space.prevent="activeDatasetId = dataset.id"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {{ dataset.id }}
          </span>
          <ArrowUpRight
            class="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
          />
        </div>
        <h3 class="mt-2 text-[15px] font-medium tracking-tight text-foreground">
          {{ dataset.name }}
        </h3>
        <div class="mt-1 font-mono text-[11px] text-foreground/70">{{ dataset.n }}</div>
        <p class="mt-3 text-[12px] leading-relaxed text-muted-foreground">{{ dataset.desc }}</p>
      </article>
    </div>

    <!-- Deep-dive technical detail modal -->
    <DatasetModal :dataset-id="activeDatasetId" @close="activeDatasetId = null" />
  </section>
</template>

