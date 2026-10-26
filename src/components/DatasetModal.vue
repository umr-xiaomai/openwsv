<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUpRight, Check, Copy, X } from 'lucide-vue-next';
import { DATASET_DETAILS, type DatasetDetail } from '../data/datasetDetails';
import { UPSTREAM_REPO_LABEL, UPSTREAM_REPO_URL } from './links';

const props = defineProps<{
  datasetId: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const detail = computed<DatasetDetail | null>(() =>
  props.datasetId ? DATASET_DETAILS[props.datasetId] ?? null : null
);

const copiedCommand = ref(false);
const copiedSample = ref(false);

const formattedJson = computed(() => {
  if (!detail.value) return '';
  return JSON.stringify(detail.value.sampleData, null, 2);
});

const copyCommand = async () => {
  if (!detail.value) return;
  try {
    await navigator.clipboard.writeText(detail.value.cliCommand);
    copiedCommand.value = true;
    window.setTimeout(() => {
      copiedCommand.value = false;
    }, 1600);
  } catch {
    copiedCommand.value = false;
  }
};

const copySample = async () => {
  if (!formattedJson.value) return;
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    copiedSample.value = true;
    window.setTimeout(() => {
      copiedSample.value = false;
    }, 1600);
  } catch {
    copiedSample.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

watch(
  () => props.datasetId,
  (newVal) => {
    if (typeof document !== 'undefined') {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="detail"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`dataset-title-${detail.id}`"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        @click="emit('close')"
      />

      <!-- Dialog panel -->
      <div
        class="relative flex max-h-[90vh] w-full max-w-3xl flex-col border border-border bg-card shadow-2xl transition-all"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {{ detail.id }}
            </span>
            <h2
              :id="`dataset-title-${detail.id}`"
              class="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
            >
              {{ detail.name }}
            </h2>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ detail.subtitle }} · <span class="font-mono text-foreground/80">{{ detail.n }}</span>
            </p>
          </div>

          <button
            type="button"
            class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close dialog"
            @click="emit('close')"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Modal Scrollable Content -->
        <div class="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <!-- 1. Key Specs (clean horizontal grid, no nested card boxes) -->
          <div class="grid grid-cols-1 gap-3 border-b border-border/80 pb-4 text-xs sm:grid-cols-3">
            <div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Task Format</span>
              <div class="mt-1 font-medium text-foreground">{{ detail.taskFormat }}</div>
            </div>
            <div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Target Models</span>
              <div class="mt-1 font-medium text-foreground">{{ detail.targetModels }}</div>
            </div>
            <div>
              <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Associated Boards</span>
              <div class="mt-1 font-mono text-[11px] text-foreground">{{ detail.boards.join(' · ') }}</div>
            </div>
          </div>

          <!-- 2. Capabilities & Protocol -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <h4 class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Evaluated Capabilities
              </h4>
              <ul class="mt-2 space-y-1.5 text-xs text-foreground/90">
                <li
                  v-for="(cap, i) in detail.capabilities"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <span class="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/40" />
                  <span>{{ cap }}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Protocol & Rules
              </h4>
              <ul class="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li
                  v-for="(rule, i) in detail.protocolNotes"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <span class="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{{ rule }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 3. Sample Data Preview -->
          <div>
            <div class="flex items-center justify-between gap-2 pb-1.5">
              <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Sample JSON
              </span>
              <button
                type="button"
                class="inline-flex h-6 cursor-pointer items-center gap-1 border border-border bg-background px-2 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                @click="copySample"
              >
                <Check v-if="copiedSample" class="size-3 text-emerald-500" />
                <Copy v-else class="size-3" />
                <span>{{ copiedSample ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
            <pre
              class="max-h-48 overflow-x-auto border border-border bg-card/60 p-3 font-mono text-[11px] leading-relaxed text-foreground select-text"
            >{{ formattedJson }}</pre>
          </div>

          <!-- 4. Reproduction CLI Command -->
          <div>
            <div class="flex items-center justify-between gap-2 pb-1.5">
              <span class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                CLI Command
              </span>
              <button
                type="button"
                class="inline-flex h-6 cursor-pointer items-center gap-1 border border-border bg-background px-2 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                @click="copyCommand"
              >
                <Check v-if="copiedCommand" class="size-3 text-emerald-500" />
                <Copy v-else class="size-3" />
                <span>{{ copiedCommand ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
            <pre
              class="overflow-x-auto border border-border bg-card/60 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground"
            ><code>{{ detail.cliCommand }}</code></pre>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 sm:px-6">
          <a
            :href="UPSTREAM_REPO_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>View dataset in {{ UPSTREAM_REPO_LABEL }}</span>
            <ArrowUpRight class="size-3" />
          </a>

          <button
            type="button"
            class="inline-flex h-7 cursor-pointer items-center border border-border bg-background px-3 font-mono text-[11px] text-foreground transition-colors hover:bg-accent"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 160ms ease-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active :deep(.relative),
.modal-fade-leave-active :deep(.relative) {
  transition: transform 160ms ease-out;
}

.modal-fade-enter-from :deep(.relative),
.modal-fade-leave-to :deep(.relative) {
  transform: scale(0.98);
}
</style>
