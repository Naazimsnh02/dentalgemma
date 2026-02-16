# AGENTS.md — DentalGemma

## Build / Lint / Test (all run from `dentalgemma-app/`)
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with next/core-web-vitals + next/typescript)
- **Test all:** `npm test`
- **Single test:** `npx jest path/to/file.test.ts`
- **Test watch:** `npm run test:watch`

## Architecture
- **`dentalgemma-app/`** — Next.js 16 (React 19, App Router, RSC) frontend + API routes. Uses shadcn/ui (new-york style), Tailwind CSS v4, Zustand for state (`store/`), Zod for validation. Path alias `@/*` maps to project root.
- **`dentalgemma-app/app/api/`** — Route handlers: `analyze-xray/`, `assess-case/`, `chat/`, `agent/`, `dentists/`, `health/`, `research/`. These proxy to a Modal.com GPU backend.
- **`scripts/modal_dentalgemma.py`** — Modal.com deployment serving the fine-tuned `dentalgemma-1.5-4b-it` model (based on MedGemma) with FastAPI endpoints. Deploy: `modal deploy scripts/modal_dentalgemma.py`.
- **`finetune/`** — Jupyter notebooks and datasets for fine-tuning the model.

## Code Style
- TypeScript strict mode. Use `@/` path aliases for imports. React components in `components/` (subdirs: `ui/`, `agentic/`, `case/`, `xray/`, `voice/`, `layout/`, `shared/`).
- UI primitives from `@/components/ui` (shadcn). Utility: `cn()` from `@/lib/utils` for class merging (clsx + tailwind-merge).
- Tests in `__tests__/` or colocated `*.test.ts(x)` files; use `@testing-library/react` + Jest.
- Python (scripts/finetune): type hints, Pydantic models for request validation, bfloat16 inference.
