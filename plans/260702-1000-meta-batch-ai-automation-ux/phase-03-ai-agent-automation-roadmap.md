# Phase 3: Path to 100% AI-Agent-Driven Automation

**STATUS: BACKLOG — not built in the 2026-07-02 cook pass.** Confirmed "AI Agent" = third-party model integration (plan.md decision #4); real execution depends on that integration + a real Meta API, neither of which exist yet in this mock-data-only codebase. Building L2–L4 UI now would be speculative screens with nothing behind them (YAGNI violation). This file stays as the roadmap for whoever picks up agent integration next.

North-star roadmap, not a single sprint. FE builds the "agent control surface" — the screens a human needs to trust and supervise an agent — while actual agent/model logic and real Meta API integration are backend/infra work outside this repo's current frontend-only, mock-data stage (see plan.md open question #4).

## Autonomy levels (progressive rollout, not a single jump)

| Level | Description | Human role |
|---|---|---|
| L0 (current) | Human picks every template/theme/copy manually | Operator |
| L1 Assisted | Agent suggests theme groupings, copy variants, naming patterns; human accepts/edits/rejects each | Editor |
| L2 Supervised | Human states intent in natural language ("launch 5 Summer-theme variants on Account A+B, install objective"); agent proposes a full batch plan as a diff; human approves before it runs | Approver |
| L3 Guarded autonomy | Agent runs on trigger (e.g. new creative uploaded) and auto-drafts a batch; auto-executes only within pre-approved guardrails (budget cap, allowed accounts, max campaign count); escalates exceptions | Exception handler |
| L4 Full autonomy | Agent runs end-to-end against a one-time policy config; human only monitors + can override/kill | Monitor |

Ship L1→L2 before L3→L4 — each level's UI is additive on top of the last, and trust has to be earned incrementally (this mirrors the `AI Interaction — Feedback Loop` UX guideline: agents need visible accept/reject/regenerate affordances, not silent autonomy).

## Requirements

1. **Reconcile with existing "AI Bulk Create"** — `meta-bulk-create-drawer.tsx` / `meta-bulk-generation.ts` (in `src/pages/networks/`) may already cover part of L1; confirm before building a second parallel bulk-creation UI (open question #3)
2. **Approval queue** — list of agent-proposed batches awaiting human review, diff-style (what changed vs a manual baseline, plus plain-language rationale per decision — not raw model internals)
3. **Guardrail settings panel** — budget ceilings, allowed accounts/objectives, max campaigns per run, blackout windows; this is the "steering wheel" the human keeps even at L4
4. **Audit trail** — every agent action (proposed / approved / edited / rejected / executed) logged with actor (agent vs human) + timestamp; required for trust and rollback, feeds into existing `ChangeLogs.tsx` page pattern if reusable
5. **Kill switch** — pause-all-agents control, always reachable (candidate: pin into `AppHeader.tsx` or `NetworkContextBar.tsx`, not buried in a drawer)
6. **Multi-run monitoring dashboard** — at L3/L4 scale, multiple concurrent autonomous runs need an overview, not a single job list. Use a funnel/stage visualization (queued → validating → running → done/error) per the `chart` domain research (Funnel/Flow chart type — 3-8 stages, always show conversion/drop-off count per stage, provide linear-list a11y fallback), not just the current single progress bar
7. **Escalation notifications** — when an agent hits a guardrail boundary or repeated failures, surface via existing `NotificationDrawer.tsx` rather than a new notification system

## Files likely touched (new screens, mostly additive)

- New: `src/pages/networks/meta/meta-agent-approval-queue.tsx` (or under `src/components/networks/meta/`) — pending-proposal list + diff view, reuses `BatchHistoryPanel`/`BatchRunDetail` visual patterns
- New: `src/components/networks/meta/meta-agent-guardrails-panel.tsx` — settings form (reuse `ui-kit-compat` Form patterns already used in `meta-campaign-settings-form.tsx`)
- New: `src/components/networks/meta/meta-agent-audit-log.tsx` — timeline view (reuse `ui-kit-compat` Timeline, already imported elsewhere)
- New: `src/components/networks/meta/meta-agent-monitor-dashboard.tsx` — multi-run funnel/status view
- `src/components/layout/AppHeader.tsx` or `NetworkContextBar.tsx` — kill switch entry point
- `src/components/ui/NotificationDrawer.tsx` — extend for agent-escalation notification type (verify existing notification model supports a new source type before adding one)

## Dependencies (blocking, not FE-owned)

- Real Meta API integration (or a sandboxed equivalent) — Phase 2's `runJob()` interface is the seam; nothing in Phase 3 can execute for real without it
- Agent backend/orchestration — decision needed on build-vs-integrate (open question #4)
- Real error taxonomy from Meta Ads API — needed so guardrail violations and audit entries are meaningful, not mock-random

## Validation

This phase is roadmap-level; concrete acceptance criteria get defined per-level when each is scoped as its own plan. Do not attempt to build L3/L4 UI before L1/L2 ship and get real usage — premature autonomy UI without a working agent behind it just adds unused screens (YAGNI).

## Unresolved Questions specific to this phase

- Does "AI Agent" here mean an in-house LLM-backed service this team builds, or integration with an existing automation/agent platform? Changes whether Phase 3 needs new backend API contracts designed now or later.
- Should agent proposals be versioned (diffable against prior proposals) or always presented fresh?
- What's the rollback/undo model for campaigns an agent already created at L3/L4 — does Meta Ads API support pause/delete that the audit trail should expose as an action?
