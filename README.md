# OpenWSV — World-State Vision Benchmark

OpenWSV (short: **WSV**) is a horizontal benchmark that evaluates, under **one frozen
framework**, two model classes on the same tasks:

- **text-only multimodal models (VLMs)**: multiple-choice / short-answer / JSON answers;
- **structured world-state models**: consume a before/after frame pair plus the
  **framework-provided object boxes**, and emit structured slots, object-pair relations and
  events.

Scores are comparable only because every framework component is byte-identical: one dataset
hash set, one detector (GroundingDINO-tiny, weights pinned by `sha256`), one prompt version and
one deterministic scorer. This repository contains **both** the frozen evaluation framework
and the static leaderboard site.

The T4/T6 text suites are **text projections of the structured pairs GT**: they ask the same
atomic facts (what changed, what the after state is) with the same images, so text VLMs and
structured world-state models can be scored on the same underlying tasks. T5/T7 add
relation-change and cross-frame suites from the additive `openwsv-data-1.1` bundle.

## Layout

```
src/starlife_eval/               # frozen evaluation framework (library + CLI)
  wsv/                           # config / detector / tasks / prompts / adapters / scoring / runner / cli
  wsv/suites/                    # frozen task files (jsonl, shipped in the package)
  verifiers/                     # structured scoring helpers (pair protocol)
tests/                           # offline unit tests (pytest, no network / GPU)
data/openwsv-data-1.0/           # frozen image/suite bundle, 13 parts + hashes
scripts/wsv/                     # join + verify, derive suites, generator, runner wrappers, site data
scripts/wsv/gen/                 # openwsv-scene-1.0.0 generator for T5/T7 frames
docs/OPENWSV.md                  # frozen protocol and reproduction details
docs/OPENWSV_DATA.md             # data bundle contents, generation and verification
src/, index.html, vite.config.ts # leaderboard frontend (Vue 3 + Vite 6 + Tailwind CSS 4)
```

## The frozen five

| Item | Value | Where it lives |
| --- | --- | --- |
| Dataset | sha256 of every suite jsonl (shipped in the package) | `src/starlife_eval/wsv/suites/*.jsonl` |
| Detector | GroundingDINO-tiny, weights sha256 pinned, `box_threshold=0.2`, `text_threshold=0.2` | `src/starlife_eval/wsv/config.py::DETECTOR` |
| Prompt | `openwsv-1` | `src/starlife_eval/wsv/prompts.py::PROMPT_VERSION` |
| Scorer | deterministic, no LLM judge | `src/starlife_eval/wsv/scoring.py` |
| Seeds | sampling `20261020`, bootstrap `20261022` | `src/starlife_eval/wsv/config.py::SEEDS` |

## Suites

| suite | n | description | applies to |
| --- | ---: | --- | --- |
| `spatialmqa` | 1,612 | single-image multiple-choice spatial relation questions (T1) | text VLMs |
| `spatialmqa_relation` | 305 | the "Where is/are the X located relative to the Y?" subset (T1-relation) | text VLMs |
| `pairs` | 1,000 | before/after frame pairs from the `dataset_spatial_v3` test split (T4–T6) | structured world-state models |
| `change` | 1,000 | T4: one "what happened to the X?" question per test pair, derived from the pairs GT | text VLMs (paired with `pairs`) |
| `relation_change` | 600 | T5: before/after relation-change questions on synthetic pairs (`openwsv-data-1.1`) | text VLMs |
| `state_replay` | 1,000 | T6: after-state fact probes on the same test pairs (existence / relation / rel_pos / contact) | text VLMs (paired with `pairs`) |
| `cross_frame` | 400 | T7: disjoint cross-frame questions ("X only in image 1, Y only in image 2") | text VLMs |

`pairs` ground truth is produced by the synthetic scene generator (`spatial3d-1.0.0`, fixed
seeds) — not real footage; relation/change/contact labels come from the generator.
`change` and `state_replay` are deterministic projections of exactly that GT
(`scripts/wsv/derive_text_suites.py`), so every text question has a structured counterpart.
`relation_change` and `cross_frame` come from the additive `openwsv-scene-1.0.0` generator
(`scripts/wsv/gen/`), also seeded and regenerable byte-for-byte.

## Data bundle (clone and reproduce)

The benchmark data ships **in this repository** under `data/openwsv-data-1.0/` as 13 parts
(494.6 MB total). The joined zip must hash to
`971090ee15347b016f5c4afd92b6a711481d81de169c9d45d55e64a6fef2ad63`; the join script verifies
the whole-zip hash, checks every file against `SHA256SUMS`, and unpacks:

```bash
python scripts/wsv/join_data.py --dest ./openwsv-data-1.0.zip --extract-to ./data
export OPENWSV_DATA_ROOT=$PWD/data/openwsv-data-1.0
```

Contents: 1,583 single-image question images, 2,000 frames (1,000 before/after test pairs),
both suite jsonl files, and a per-file `SHA256SUMS`. 29 tasks reference images missing from the
public release; they are scored as **not covered** and excluded from the accuracy denominator.

### T5 / T7 additive bundle

`openwsv-data-1.1` (1,200 T5 frames + 800 T7 frames) is **not committed** — it is regenerated
deterministically by the shipped generator (pure Python + numpy + Pillow, no external assets,
no network):

```bash
python -m scripts.wsv.gen.build --force --determinism-check   # writes data/openwsv-data-1.1/
```

Generator version `openwsv-scene-1.0.0`, seed `20261020`; the generated suite files are also
byte-reproducible. T5/T7 evaluation needs both bundles under the same data root, so run with
`--data-root data` (the suites reference `openwsv-data-1.0/...` and `openwsv-data-1.1/...`).

## Quick start

```bash
python -m venv .venv && . .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev,detector]"

python -m starlife_eval.wsv --list-suites
```

### Text VLM through an OpenAI-compatible gateway

The framework only needs an OpenAI-compatible `POST /chat/completions` endpoint; images are
sent inline as base64 `data:` URLs. That endpoint can be a cloud provider or a **local
llama.cpp / vLLM server** for GGUF weights (use a multimodal model + `mmproj` for the image
suites; the framework itself does not load weights).

```bash
python -m starlife_eval.wsv run --suite spatialmqa --model <id> \
  --adapter openai --base-url http://127.0.0.1:8080/v1 --api-key <key> \
  --out reports/openwsv/spatialmqa__<id>.json

# T4–T7 (needs both data bundles)
python -m starlife_eval.wsv run --suite change --model <id> \
  --adapter openai --base-url http://127.0.0.1:8080/v1 --api-key <key> \
  --data-root data --out reports/openwsv-v2/
```

### Structured world-state model

```bash
python -m starlife_eval.wsv run --suite pairs --model <id> \
  --adapter wsv --api-url http://127.0.0.1:8890 --api-key <key> \
  --out reports/openwsv/pairs__<id>.json
```

`--api-key-env NAME` reads secrets from the environment instead of argv.

## Result JSON contract

```json
{"framework": {"version": "openwsv-1", "dataset_sha256": {},
               "detector": {"model": "IDEA-Research/grounding-dino-tiny",
                            "revision": "<pinned>", "weights_sha256": "<pinned>",
                            "box_threshold": 0.2, "text_threshold": 0.2},
               "prompt_version": "openwsv-1", "scorer": "starlife_eval@<commit>",
               "seed": 20261020, "bootstrap_seed": 20261022},
 "suite": "change", "n": 1000,
 "model": {"id": "<id>", "kind": "vlm", "uses_harness_boxes": false, "adapter": "openai"},
 "metrics": {"accuracy": 0.0, "coverage": 1.0, "ci95": [0.0, 0.0]},
 "per_task": [{"task_id": "...", "covered": true, "pred": 0, "gold": 1, "error": null}]}
```

**Not covered ≠ wrong**: empty output, timeout and unparseable answers are recorded as
`covered=false` and removed from the accuracy denominator; coverage is reported separately.
Every accuracy carries a 95% task-level bootstrap CI (1,000 iterations, `seed=20261022`).

## Leaderboard site

The frontend is static and data-driven by `src/data/openwsv.generated.json` (boards / protocol /
datasets / repro payload). Metrics that were not measured are `pending`, never `0` and never
estimated; no SOTA / #1 wording is used.

```bash
pnpm install
pnpm dev        # local preview
pnpm build      # production build in dist/
pnpm exec tsc --noEmit
```

The payload is regenerated from result JSONs with `python scripts/wsv/build_site_data.py`.

## License and data notes

- Code: MIT (see `LICENSE`).
- Data: synthetic scenes generated by `spatial3d-1.0.0` (pairs) and `openwsv-scene-1.0.0`
  (T5/T7); the spatial-relation question set is derived from its public dataset under the
  original license. T4/T6 suites are deterministic text projections of the pairs GT and add
  no images.
- The benchmark reports metrics, coverage and CIs only; it makes no composite ranking claim
  beyond the published composite definition.