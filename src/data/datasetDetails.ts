export interface DatasetDetail {
  id: string;
  name: string;
  n: string;
  desc: string;
  subtitle: string;
  status: 'active' | 'pending';
  boards: string[];
  targetModels: string;
  taskFormat: string;
  capabilities: string[];
  protocolNotes: string[];
  sampleTitle: string;
  sampleData: Record<string, unknown>;
  cliCommand: string;
}

export const DATASET_DETAILS: Record<string, DatasetDetail> = {
  'openwsv-t1': {
    id: 'openwsv-t1',
    name: 'Single-image relations',
    n: '1,612 questions',
    subtitle: 'Static single-image spatial multiple choice benchmark',
    status: 'active',
    desc: 'Single-image multiple choice from public data, including a 305-question relation subset.',
    boards: ['T1 Single-image relations', 'T1 Relation subset'],
    targetModels: 'Vision-Language Models (text-only 4-way multiple choice)',
    taskFormat: '4-way Multiple Choice (A / B / C / D)',
    capabilities: [
      '2D and 3D relative directional reasoning (left / right, front / behind, above / below)',
      'Containment and contact relations between target and landmark objects',
      'High-difficulty subset (305 questions) isolating fine-grained relation discrimination',
    ],
    protocolNotes: [
      '29 tasks reference images omitted from the public release; scored as not covered and excluded from the accuracy denominator.',
      'Deterministic exact-match scoring across 1,000 bootstrap draws with 95% confidence intervals.',
    ],
    sampleTitle: 'Task Prompt & Schema (JSON)',
    sampleData: {
      task_id: 'spatialmqa_0412',
      suite: 'spatialmqa',
      image: 'images/single/0412.png',
      question: 'Which object is situated directly to the left of the yellow cylinder?',
      options: {
        A: 'The green metallic sphere',
        B: 'The red wooden cube',
        C: 'The blue rubber cone',
        D: 'No object is to the left',
      },
      ground_truth: 'B',
      relation_category: 'relative_direction_3d',
      subset: 'relation_305',
    },
    cliCommand:
      'python -m starlife_eval.wsv run --suite spatialmqa --model <id> --adapter openai --base-url "$OPENAI_BASE_URL" --api-key "$OPENAI_API_KEY"',
  },

  'openwsv-pairs': {
    id: 'openwsv-pairs',
    name: 'Structured world state',
    n: '1,000 test pairs',
    subtitle: 'High-fidelity temporal before/after pairs with complete physics GT',
    status: 'active',
    desc: 'Synthetic before/after pairs; GT includes presence, change, relations, relative position, contact and support.',
    boards: ['Structured State Foundation', 'T4/T6 Text Projections'],
    targetModels: 'Structured World-State Models (e.g. StarLife WSV)',
    taskFormat: 'Structured Scene Graph & DAG JSON Generation',
    capabilities: [
      'Physical contact topology and Directed Acyclic Support Graph (Support DAG)',
      '3D displacement and metric displacement thresholding under non-convex clutter',
      'Entity presence, occluded object recovery, and bounding box alignment with frozen detector',
    ],
    protocolNotes: [
      'Detector weights are frozen (GroundingDINO-tiny, sha256 pinned).',
      'Evaluates support graph precision, recall, F1, and physical exclusivity constraints.',
    ],
    sampleTitle: 'Structured Scene Graph Annotation (JSON)',
    sampleData: {
      pair_id: 'pair_0782',
      frame_before: 'frames/0782_before.png',
      frame_after: 'frames/0782_after.png',
      entities: [
        { id: 'cyan_prism', category: 'prism', bbox: [120, 310, 240, 480] },
        { id: 'red_sphere', category: 'sphere', bbox: [215, 290, 305, 380] },
      ],
      state_transitions: {
        displacement: { red_sphere: [0.42, -0.15, 0.0] },
        contact_changes: [
          { edge: ['red_sphere', 'cyan_prism'], before: false, after: true },
        ],
        support_dag: [
          { parent: 'table', child: 'cyan_prism' },
          { parent: 'cyan_prism', child: 'red_sphere' },
        ],
      },
    },
    cliCommand:
      'python -m starlife_eval.wsv run --suite pairs_test --model <id> --detector grounding-dino-tiny',
  },

  'openwsv-t4t6': {
    id: 'openwsv-t4t6',
    name: 'Change and replay probes',
    n: '1,000 + 1,000 questions',
    subtitle: 'Text projections of physical change & after-state facts',
    status: 'active',
    desc: 'Text projections of the same test pairs: what changed (T4) and after-state facts (T6).',
    boards: ['T4 Spatial change', 'T6 State replay', 'Overall'],
    targetModels: 'Text-only VLMs vs Structured World-State Models',
    taskFormat: 'Paired Image 4-way Multiple Choice',
    capabilities: [
      'T4 Spatial change: Identifies what spatial, contact, or support relation changed between frames',
      'T6 State replay: Probes facts about the final world state after physical transitions occur',
      'Enables fair, un-biased comparison between text VLMs and graph-based models on identical physical scenes',
    ],
    protocolNotes: [
      'Models must answer all covered pairs; unattempted tasks are marked [coverage] and omitted from accuracy denominator.',
      'Contributes equally to the composite Overall board.',
    ],
    sampleTitle: 'Change Probe Sample (JSON)',
    sampleData: {
      probe_id: 'probe_t4_0192',
      source_pair: 'pair_0192',
      probe_type: 'T4_spatial_change',
      question:
        'Comparing the initial and final frames, what spatial change occurred to the purple cylinder?',
      options: {
        A: 'It was knocked down and rolled behind the grey box',
        B: 'It moved on top of the yellow cube and established support',
        C: 'Its position remained completely unchanged',
        D: 'It lost contact with the ground plane',
      },
      ground_truth: 'B',
      harness_boxes: false,
    },
    cliCommand:
      'python -m starlife_eval.wsv run --suite t4t6 --model <id> --adapter openai --base-url "$OPENAI_BASE_URL" --api-key "$OPENAI_API_KEY"',
  },

  'openwsv-t5t7': {
    id: 'openwsv-t5t7',
    name: 'Relation change and cross-frame',
    n: '600 + 400 questions',
    subtitle: 'Relational state transitions & disjoint camera frustum pairs',
    status: 'active',
    desc: 'Additive synthetic suites with full before/after relation GT (T5) and disjoint cross-frame pairs (T7).',
    boards: ['T5 Relation change', 'T7 Cross-frame disjoint', 'Overall'],
    targetModels: 'Text-only VLMs & Structured Models',
    taskFormat: 'Temporal & Cross-Frustum Multiple Choice',
    capabilities: [
      'T5 Relation change (600 tasks): Evaluates complex multi-object contact gain/loss transitions',
      'T7 Cross-frame disjoint (400 tasks): Evaluates pairs with non-overlapping view frustums and severe camera shifts',
      'Cross-view object re-identification and spatial invariance verification',
    ],
    protocolNotes: [
      'Additive benchmark suite part of openwsv-data-1.1 release.',
      'Requires strict spatial consistency without shared background landmark cues in T7.',
    ],
    sampleTitle: 'Relation Change Probe Sample (JSON)',
    sampleData: {
      task_id: 'rel_change_0531',
      suite: 't5_relation_change',
      relation_transition: {
        subject: 'golden_sphere',
        object: 'blue_block',
        before_state: 'in_front_of',
        after_state: 'supported_by',
      },
      question:
        'Select the statement that correctly describes the contact evolution between the golden sphere and blue block.',
      options: {
        A: 'The golden sphere moved onto the blue block, gaining support',
        B: 'The blue block moved away, breaking all contact',
        C: 'Both objects remained in static contact',
        D: 'The golden sphere was occluded by a new barrier',
      },
      ground_truth: 'A',
    },
    cliCommand:
      'python -m starlife_eval.wsv run --suite t5t7 --model <id> --adapter openai --base-url "$OPENAI_BASE_URL" --api-key "$OPENAI_API_KEY"',
  },

  'openwsv-abstract': {
    id: 'openwsv-abstract',
    name: 'Abstract geometry',
    n: 'Not built yet',
    subtitle: 'Rotation, orthographic projection, and mental spatial completion',
    status: 'pending',
    desc: 'Rotation/projection/completion, text-only models.',
    boards: ['T8 Abstract geometry (Pending)'],
    targetModels: 'Text-only VLMs & Vision Models',
    taskFormat: 'Pure Synthetic Geometric Probes',
    capabilities: [
      '3D mental rotation matching (Shepard-Metzler style shapes)',
      'Orthographic to perspective multi-view projection alignment',
      'Polyhedral surface net folding and intersection reasoning',
      'Volumetric occlusion reasoning without natural language semantic bias',
    ],
    protocolNotes: [
      'Status: In development. In accordance with benchmark rules, no numbers or mock scores are rendered until frozen release.',
      'Planned release in OpenWSV v1.2 suite.',
    ],
    sampleTitle: 'Planned Suite Specification (JSON)',
    sampleData: {
      status: 'pending_development',
      target_suite: 'abstract_geometry_v1',
      planned_tasks: 1000,
      planned_categories: [
        'mental_rotation_3d',
        'orthographic_projection',
        'polyhedral_net_folding',
        'volumetric_intersection',
      ],
      target_release: 'OpenWSV v1.2',
    },
    cliCommand:
      '# Suite under construction — track upstream repository for updates\npython -m starlife_eval.wsv list-suites --include-experimental',
  },
};
