# Phase 5: Network-Aware Automation & Rules

**Priority:** P2  
**Status:** Pending  
**Effort:** ~6h  
**Parallelism:** Runs after Phase 1; independent of Phases 2, 3, 4

## Context Links

- Plan overview: [plan.md](./plan.md)
- Current rules page: `src/pages/NetworkRules.tsx`
- Current automation page: `src/pages/Automation.tsx`
- Mock data: `src/shared/mock-data.ts` (NetworkRule interface)
- Network config: `src/shared/network-config.ts` (created in Phase 3, or define independently)

## Overview

Upgrade the rules/automation system so rule conditions and actions are **aware of which network they apply to**. Currently `NetworkRules.tsx` shows a generic rule editor with network as just a filter tag. This phase adds network-specific condition templates (Google impression share, Meta relevance score, Axon country bid, etc.) and splits the automation log view to show per-network execution history.

## Key Insights

- Current `NetworkRule` interface in `mock-data.ts`: `{ id, name, network, condition, action, status, lastTriggered }`  — `condition` and `action` are plain strings
- Need to evolve: typed `RuleCondition` and `RuleAction` objects that are network-aware
- `NetworkRules.tsx` shows: rule list table + create/edit modal — the modal is where network-aware fields go
- `Automation.tsx` shows execution logs — add network filter + per-network execution timeline
- Budget pacing alert rule is a new template: "Alert when spend > X% of budget" — high value, low complexity

## Requirements

### Functional

**Network Rules page**
- Rule list table: Name | Network | Condition summary | Action | Status | Last Triggered
- Network filter chip bar at top (All | Google | Meta | ASA | Axon | Moloco)
- Create/Edit rule modal with 3 sections:
  1. **Trigger**: network selector → condition type dropdown (network-specific list) → threshold input
  2. **Action**: action type dropdown (network-specific list) → action params
  3. **Schedule**: evaluation frequency (Every 15min | Hourly | Daily)
- "Use Template" button: pre-fills common rule patterns per network

**Network-specific condition types**

| Network | Condition types |
|---------|----------------|
| All networks | `spend > X`, `cpa > X`, `roas < X`, `installs < X`, `budget_pct > X%` |
| Google | `impression_share < X%`, `quality_score < X` |
| Meta | `relevance_score < X`, `frequency > X` |
| ASA | `search_match_rate < X%`, `keyword_cpa > X` |
| Axon | `country_bid_cpa[country] > X`, `recommendation_count > X` |
| Moloco | `blocked_publisher_pct > X%`, `exchange_cpa[exchange] > X` |

**Network-specific action types**

| Network | Action types |
|---------|-------------|
| All networks | `pause_campaign`, `increase_budget X%`, `decrease_budget X%`, `send_alert` |
| Google | `adjust_target_cpi X`, `pause_asset_group` |
| Meta | `increase_lookalike_pct`, `switch_to_advantage_plus` |
| Axon | `adjust_country_bid[country] X`, `apply_axon_recommendation` |
| Moloco | `add_to_publisher_blocklist`, `adjust_exchange_bid[exchange] X` |

**Rule Templates** (pre-built common patterns)

| Template name | Network | Condition | Action |
|--------------|---------|-----------|--------|
| Budget Pacing Alert | All | `budget_pct > 80%` | `send_alert` |
| High CPA Pause | All | `cpa > $X` | `pause_campaign` |
| Low ROAS Scale Down | All | `roas < 1.5x` | `decrease_budget 20%` |
| Google Impression Share | Google | `impression_share < 30%` | `increase_budget 15%` |
| Meta Frequency Cap | Meta | `frequency > 3.5` | `pause_campaign` |
| Axon Country Bid Optimize | Axon | `country_bid_cpa > $X` | `adjust_country_bid -10%` |

**Automation page (execution log)**
- Network filter tabs (All | per-network)
- Timeline view: rule name → triggered at → condition met → action taken → result
- Status badges: `Success` | `Failed` | `Skipped`
- Per-network execution summary card at top (total rules, triggered today, success rate)

### Non-Functional
- Rule editor modal < 200 lines
- `rule-conditions.ts` is single source of truth for all condition/action definitions
- No new npm dependencies

## Architecture

```
src/shared/
└── rule-conditions.ts        (NEW — typed condition/action definitions per network)

src/components/automation/    (NEW directory)
├── rule-editor-modal.tsx     (create/edit rule with network-aware fields)
├── rule-condition-builder.tsx (condition type selector + threshold input)
├── rule-action-builder.tsx   (action type selector + params input)
└── rule-template-picker.tsx  (template gallery modal)

src/pages/
├── NetworkRules.tsx          (refactored — uses new components)
└── Automation.tsx            (refactored — add network tabs + summary cards)
```

### Rule Condition Type

```typescript
// src/shared/rule-conditions.ts

export interface ConditionDef {
  key: string;                    // 'cpa_gt', 'impression_share_lt', etc.
  label: string;                  // 'CPA >'
  networks: string[] | 'all';     // which networks this applies to
  paramLabel: string;             // 'Threshold ($)'
  paramType: 'number' | 'percent' | 'country-select';
  defaultValue: number;
}

export interface ActionDef {
  key: string;
  label: string;
  networks: string[] | 'all';
  paramLabel?: string;
  paramType?: 'number' | 'percent' | 'country-select' | 'none';
}

export const CONDITION_DEFS: ConditionDef[] = [ ... ];
export const ACTION_DEFS: ActionDef[] = [ ... ];

export function getConditionsForNetwork(network: string): ConditionDef[] {
  return CONDITION_DEFS.filter(c => c.networks === 'all' || c.networks.includes(network));
}

export function getActionsForNetwork(network: string): ActionDef[] {
  return ACTION_DEFS.filter(a => a.networks === 'all' || a.networks.includes(network));
}
```

### Updated NetworkRule interface

```typescript
// Extend in mock-data.ts
export interface NetworkRule {
  id: string;
  name: string;
  network: string;
  conditionKey: string;       // references ConditionDef.key
  conditionParam: number;     // threshold value
  conditionParamExtra?: string; // e.g., country code for Axon
  actionKey: string;          // references ActionDef.key
  actionParam?: number;       // e.g., budget % adjustment
  scheduleMinutes: number;    // 15 | 60 | 1440
  status: 'active' | 'paused';
  lastTriggered?: string;
  triggerCount: number;
}
```

## Related Code Files

### Create
- `src/shared/rule-conditions.ts`
- `src/components/automation/rule-editor-modal.tsx`
- `src/components/automation/rule-condition-builder.tsx`
- `src/components/automation/rule-action-builder.tsx`
- `src/components/automation/rule-template-picker.tsx`

### Modify
- `src/pages/NetworkRules.tsx` — add network filter chips, replace inline modal with `RuleEditorModal`, add "Templates" button
- `src/pages/Automation.tsx` — add network filter tabs, add summary cards per network, add timeline-style log entries
- `src/shared/mock-data.ts` — extend `NetworkRule` interface + update mock data to use typed `conditionKey`/`actionKey`

## Implementation Steps

1. **Create `rule-conditions.ts`**
   - Define `ConditionDef[]` covering all networks (shared + per-network conditions from requirements table)
   - Define `ActionDef[]` covering all networks
   - Export `getConditionsForNetwork()` and `getActionsForNetwork()` helpers
   - Export `RULE_TEMPLATES` array with 6 pre-built templates

2. **Update `NetworkRule` interface in `mock-data.ts`**
   - Replace `condition: string` / `action: string` with typed fields
   - Update all mock rule objects to use `conditionKey` and `actionKey` values

3. **Create `rule-condition-builder.tsx`**
   - Props: `network: string`, `value: { conditionKey, conditionParam, conditionParamExtra? }`, `onChange`
   - Renders: condition type `Select` (filtered by network) + threshold `InputNumber` + optional extra param
   - When network changes: reset condition to first valid condition for that network

4. **Create `rule-action-builder.tsx`**
   - Props: `network: string`, `value: { actionKey, actionParam? }`, `onChange`
   - Renders: action type `Select` (filtered by network) + optional param `InputNumber`

5. **Create `rule-template-picker.tsx`**
   - Modal showing template cards (name, description, condition → action preview)
   - Filter by network
   - "Use Template" sets parent form values

6. **Create `rule-editor-modal.tsx`**
   - Form with 3 sections: Trigger (`RuleConditionBuilder`) | Action (`RuleActionBuilder`) | Schedule (Radio.Group)
   - Network selector at top — drives available conditions and actions
   - "Use Template" button → opens `RuleTemplatePicker`
   - Submit → `message.success`; in create mode: adds to mock rule list

7. **Refactor `NetworkRules.tsx`**
   - Add network filter chip bar (`FilterChip` components, existing shared component)
   - Replace inline create/edit form with `<RuleEditorModal>`
   - Update table `condition` / `action` column renderers to use `CONDITION_DEFS`/`ACTION_DEFS` labels
   - Table action: "Edit" opens `RuleEditorModal` with pre-filled rule data

8. **Refactor `Automation.tsx`**
   - Add network filter `Tabs` at top
   - Add summary cards row: Total Rules | Triggered Today | Success Rate | Failed Today
   - Update execution log table: add `network` column with `NetworkBadge`, add timeline-style left border color per status
   - Add "Condition Met" and "Action Taken" columns with human-readable text from `rule-conditions.ts` labels

## Todo List

- [ ] Create `rule-conditions.ts` with all condition/action defs and `RULE_TEMPLATES`
- [ ] Update `NetworkRule` interface in `mock-data.ts` + update mock data objects
- [ ] Create `rule-condition-builder.tsx`
- [ ] Create `rule-action-builder.tsx`
- [ ] Create `rule-template-picker.tsx`
- [ ] Create `rule-editor-modal.tsx`
- [ ] Refactor `NetworkRules.tsx` — add filter chips + use new modal
- [ ] Refactor `Automation.tsx` — add network tabs + summary cards + richer log table
- [ ] Verify TypeScript compile — no errors

## Success Criteria

- Creating a Google rule: condition dropdown shows Google-specific options (impression share, quality score) + shared options
- Creating a Meta rule: condition dropdown shows Meta-specific options (relevance score, frequency)
- "Use Template" pre-fills all rule fields correctly
- Rule list filters correctly by network chip
- Automation page shows per-network execution summary cards
- Automation log shows human-readable condition/action text (not raw keys)
- All new files < 200 lines

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `conditionKey` values in mock data don't match `CONDITION_DEFS` keys | Medium | Define keys as TypeScript `const` enum in `rule-conditions.ts`; mock data references same constants |
| `RuleConditionBuilder` network change clears valid condition | Low | On network change, check if current `conditionKey` is still valid; only reset if not |
| Automation timeline view gets too tall with many log entries | Low | Paginate at 20 rows; virtual scroll not needed at mock scale |

## Security Considerations

- Rules trigger automated actions (pause campaigns, adjust budgets) — internal tool, no approval workflow needed now
- Future consideration: add rule approval gate before live API integration
