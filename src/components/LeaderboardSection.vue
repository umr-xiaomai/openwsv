<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Search,
  SlidersHorizontal,
  Table2,
  BarChart2,
  Columns,
  Scale,
  Copy,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-vue-next';
import SectionHeader from './SectionHeader.vue';
import LeaderboardBars from './LeaderboardBars.vue';
import LeaderboardTable from './LeaderboardTable.vue';
import ModelCompareModal from './ModelCompareModal.vue';
import {
  BOARDS,
  COMPOSITE,
  DEFAULT_BOARD,
  findBoard,
  fmtCount,
  isPending,
  rowsOf,
  modelProvider,
  type Board,
  type BoardRow,
} from '../data/openwsv';

const activeId = ref(DEFAULT_BOARD);
const activeBoard = computed<Board>(() => findBoard(activeId.value) ?? BOARDS[0]);

// Controls
const searchQuery = ref('');
const archFilter = ref<'all' | 'vlm' | 'structured' | 'covered'>('all');
const viewMode = ref<'split' | 'table' | 'chart'>('split');
const sortBy = ref<'value-desc' | 'value-asc' | 'ci-spread' | 'coverage-desc' | 'label-asc'>('value-desc');

// Model comparison state
const selectedModels = ref<BoardRow[]>([]);
const isCompareOpen = ref(false);

const toggleSelectModel = (row: BoardRow) => {
  const index = selectedModels.value.findIndex((m) => m.id === row.id);
  if (index >= 0) {
    selectedModels.value.splice(index, 1);
  } else {
    selectedModels.value.push(row);
  }
};

const removeModelFromCompare = (modelId: string) => {
  selectedModels.value = selectedModels.value.filter((m) => m.id !== modelId);
  if (selectedModels.value.length === 0) {
    isCompareOpen.value = false;
  }
};

const clearSelection = () => {
  selectedModels.value = [];
};

// Copy board JSON
const copiedBoard = ref(false);
const copyBoardJson = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(activeBoard.value, null, 2));
    copiedBoard.value = true;
    setTimeout(() => {
      copiedBoard.value = false;
    }, 1600);
  } catch {
    // ignore
  }
};

// Filtered and sorted rows
const processedRows = computed<BoardRow[]>(() => {
  let list = rowsOf(activeBoard.value).slice();

  // 1. Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((r) => {
      const provider = modelProvider(r.id).toLowerCase();
      return r.label.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || provider.includes(q);
    });
  }

  // 2. Architecture / Coverage Filter
  if (archFilter.value === 'vlm') {
    list = list.filter((r) => !r.usesHarnessBoxes);
  } else if (archFilter.value === 'structured') {
    list = list.filter((r) => r.usesHarnessBoxes);
  } else if (archFilter.value === 'covered') {
    list = list.filter((r) => r.coverage === 1);
  }

  // 3. Sorting
  list.sort((a, b) => {
    if (sortBy.value === 'value-desc') return b.value - a.value;
    if (sortBy.value === 'value-asc') return a.value - b.value;
    if (sortBy.value === 'coverage-desc') return (b.coverage ?? 0) - (a.coverage ?? 0);
    if (sortBy.value === 'ci-spread') {
      const spreadA = a.ci ? Math.abs(a.ci[1] - a.ci[0]) : 0;
      const spreadB = b.ci ? Math.abs(b.ci[1] - b.ci[0]) : 0;
      return spreadA - spreadB;
    }
    if (sortBy.value === 'label-asc') return a.label.localeCompare(b.label);
    return 0;
  });

  return list;
});

/** Tab labels */
const tabLabel = (board: Board): string => (board.id === 'overall' ? 'Overall' : board.label);

const nLabel = (board: Board): string => {
  const parts: string[] = [];
  if (board.n != null) parts.push(`n = ${fmtCount(board.n)}`);
  if (!isPending(board)) parts.push('accuracy');
  return parts.join(' · ');
};
</script>

<template>
  <section id="leaderboard" class="mt-14 scroll-mt-20 sm:mt-20">
    <SectionHeader index="01" title="Leaderboard" />

    <p class="mb-4 text-[12px] leading-relaxed text-muted-foreground">
      <span class="font-mono text-foreground/85">{{ COMPOSITE.label }}</span>
      = {{ COMPOSITE.method }}
    </p>

    <!-- Board tabs -->
    <div
      class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="tablist"
      aria-label="Leaderboard boards"
    >
      <button
        v-for="board in BOARDS"
        :key="board.id"
        type="button"
        role="tab"
        :aria-selected="activeId === board.id"
        :data-board-tab="board.id"
        :data-pending="String(isPending(board))"
        class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 border px-2.5 text-[12px] rounded transition-colors"
        :class="
          activeId === board.id
            ? 'border-foreground bg-foreground text-background font-medium'
            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40'
        "
        @click="activeId = board.id"
      >
        <span>{{ tabLabel(board) }}</span>
        <span
          v-if="isPending(board)"
          class="font-mono text-[9px] uppercase tracking-wider"
          :class="activeId === board.id ? 'text-background/70' : 'text-muted-foreground/70'"
        >
          pending
        </span>
      </button>
    </div>

    <!-- Active board wrapper -->
    <div class="mt-4" :data-active-board="activeBoard.id">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div class="flex flex-wrap items-baseline gap-2">
          <h3 class="text-[16px] font-semibold tracking-tight text-foreground">
            {{ activeBoard.label }}
          </h3>
          <span v-if="activeBoard.note" class="font-mono text-[11px] text-muted-foreground">
            {{ activeBoard.note }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="nLabel(activeBoard)" class="font-mono text-[10px] text-muted-foreground">
            {{ nLabel(activeBoard) }}
          </span>
          <button
            v-if="!isPending(activeBoard)"
            type="button"
            class="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground border border-border px-2 py-0.5 rounded transition-colors"
            :title="'Copy raw JSON for ' + activeBoard.label"
            @click="copyBoardJson"
          >
            <Check v-if="copiedBoard" class="size-3 text-emerald-500" />
            <Copy v-else class="size-3" />
            <span>{{ copiedBoard ? 'Copied' : 'JSON' }}</span>
          </button>
        </div>
      </div>

      <!-- Pending board placeholder -->
      <template v-if="isPending(activeBoard)">
        <div
          data-pending-board
          class="border border-border bg-card/40 px-6 py-14 text-center rounded-lg"
        >
          <div class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            pending
          </div>
          <div class="mt-2 text-[16px] font-medium text-foreground">Not measured yet</div>
          <p class="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            This board has no scores yet, so no numbers are shown.
          </p>
          <p v-if="activeBoard.n != null" class="mt-1 font-mono text-[11px] text-muted-foreground">
            Planned n = {{ fmtCount(activeBoard.n) }}
          </p>
          <p v-if="activeBoard.note" class="mt-1 font-mono text-[11px] text-muted-foreground">
            {{ activeBoard.note }}
          </p>
        </div>
      </template>

      <!-- Scored board -->
      <template v-else>
        <!-- Artificial Analysis Style Interactive Controls Toolbar -->
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3 border border-border bg-card/70 p-2.5 rounded-t-lg">
          <!-- Left: Search Input -->
          <div class="relative flex-1 min-w-[200px] max-w-sm">
            <Search class="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search models or providers..."
              class="h-8 w-full rounded border border-border bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              @click="searchQuery = ''"
            >
              <X class="size-3" />
            </button>
          </div>

          <!-- Middle: Architecture Filter Pills -->
          <div class="flex items-center gap-1 text-xs">
            <button
              type="button"
              class="h-7 px-2.5 rounded text-[11px] font-medium transition-colors"
              :class="archFilter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              @click="archFilter = 'all'"
            >
              All ({{ rowsOf(activeBoard).length }})
            </button>
            <button
              type="button"
              class="h-7 px-2.5 rounded text-[11px] font-medium transition-colors"
              :class="archFilter === 'vlm' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              title="Text-only Multimodal Large Language Models (No boxes provided)"
              @click="archFilter = 'vlm'"
            >
              Text VLMs
            </button>
            <button
              type="button"
              class="h-7 px-2.5 rounded text-[11px] font-medium transition-colors"
              :class="archFilter === 'structured' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              title="Structured World-State Models consuming GroundingDINO boxes"
              @click="archFilter = 'structured'"
            >
              Structured
            </button>
            <button
              type="button"
              class="h-7 px-2.5 rounded text-[11px] font-medium transition-colors"
              :class="archFilter === 'covered' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              title="Models with 100% test suite coverage"
              @click="archFilter = 'covered'"
            >
              100% Coverage
            </button>
          </div>

          <!-- Right: View Mode Toggle -->
          <div class="flex items-center gap-1 border border-border rounded p-0.5 bg-background">
            <button
              type="button"
              class="h-6 px-2 rounded flex items-center gap-1 text-[11px] transition-colors"
              :class="viewMode === 'split' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'"
              title="Split View (Chart + Table)"
              @click="viewMode = 'split'"
            >
              <Columns class="size-3" />
              <span>Split</span>
            </button>
            <button
              type="button"
              class="h-6 px-2 rounded flex items-center gap-1 text-[11px] transition-colors"
              :class="viewMode === 'chart' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'"
              title="Visual Chart Only"
              @click="viewMode = 'chart'"
            >
              <BarChart2 class="size-3" />
              <span>Chart</span>
            </button>
            <button
              type="button"
              class="h-6 px-2 rounded flex items-center gap-1 text-[11px] transition-colors"
              :class="viewMode === 'table' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'"
              title="Detailed Table Only"
              @click="viewMode = 'table'"
            >
              <Table2 class="size-3" />
              <span>Table</span>
            </button>
          </div>
        </div>

        <!-- Leaderboard Visualizations according to View Mode -->
        <div class="space-y-0">
          <LeaderboardBars
            v-if="viewMode === 'split' || viewMode === 'chart'"
            :board="activeBoard"
            :rows="processedRows"
          />
          <LeaderboardTable
            v-if="viewMode === 'split' || viewMode === 'table'"
            :board="activeBoard"
            :rows="processedRows"
            :selected-model-ids="selectedModels.map((m) => m.id)"
            @toggle-select-model="toggleSelectModel"
          />
        </div>

        <!-- Sticky Floating Model Comparison Bar (Artificial Analysis Style) -->
        <div
          v-if="selectedModels.length > 0"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-border bg-card/95 px-4 py-2.5 shadow-2xl backdrop-blur-md"
        >
          <div class="flex items-center gap-2">
            <Scale class="size-4 text-foreground" />
            <span class="text-xs font-semibold text-foreground">
              {{ selectedModels.length }} model{{ selectedModels.length > 1 ? 's' : '' }} selected
            </span>
          </div>

          <button
            type="button"
            class="inline-flex h-7 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            @click="isCompareOpen = true"
          >
            <span>Compare Head-to-Head</span>
          </button>

          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-foreground px-1"
            @click="clearSelection"
          >
            Clear
          </button>
        </div>

        <!-- Head-to-Head Comparison Modal -->
        <ModelCompareModal
          :is-open="isCompareOpen"
          :models="selectedModels"
          @close="isCompareOpen = false"
          @remove-model="removeModelFromCompare"
        />

        <div class="mt-3 flex flex-wrap items-center justify-between text-[11px] leading-relaxed text-muted-foreground px-1">
          <span>Not covered ≠ wrong; accuracy is reported with a 95% bootstrap CI.</span>
          <span class="font-mono">Showing {{ processedRows.length }} of {{ rowsOf(activeBoard).length }} models</span>
        </div>
      </template>
    </div>
  </section>
</template>
