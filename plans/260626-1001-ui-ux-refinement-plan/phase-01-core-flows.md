---
phase: 1
title: "Core Feature Flows"
status: pending
priority: P1
dependencies: []
---

# Phase 01: Core Feature Flows

## Overview

Fix the two highest-traffic flows — Campaign Wizard and Automation Rule Editor — where UX gaps cause the most friction. Both flows lack inline validation, submission feedback, and key guardrails that prevent user error.

## Requirements

**Campaign Wizard (`src/pages/campaign-create-page.tsx` + `src/components/campaign-wizard/`)**
- Inline validation on each step's required fields (validate on blur, not only at submit)
- Step completion indicator: show ✓ / ✗ on step sidebar items based on required fields filled
- "Next" button disabled when required fields on current step are empty
- Submission loading state on final step: spinner + disabled button during mock API call
- "Discard Changes" confirmation dialog when user clicks away from an in-progress wizard (unsaved changes guard)
- Draft auto-save UX: show "Draft saved" pill in wizard header (reuse existing localStorage auto-save, just surface it)
- Review step: show per-section validation summary (highlight incomplete sections with `fg_error` icon)

**Automation Rule Editor (`src/components/automation/rule-editor-modal.tsx`)**
- Template preview panel: when hovering/focusing a template card in `rule-template-picker.tsx`, show a popover preview of the rule's conditions/actions before "Use Template" is clicked
- Network change warning: if user changes the network field after conditions/actions are set, show an inline warning `"Changing network will reset your condition and action"` with confirm/cancel
- Schedule validation: `interval` field — enforce min=1, show `fg_error` helper text if set to 0 or empty
- Multi-condition support: "Add Condition" button (AND logic) with remove button per condition row; same for actions
- Save loading state: spinner on "Save Rule" button during the mock save delay

**Form Patterns (global — apply during this phase)**
- Required field markers: `<span className="fg_error">*</span>` on all required labels (check campaign wizard + rule editor)
- Error placement: errors must appear immediately below the relevant input, not just at form top
- Helper text: add `text_tertiary text-xs mt-1` helper for complex inputs (budget, interval, postback URL)

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/campaign-create-page.tsx` | Add `completedSteps` state, disable Next, add unsaved-changes guard |
| `src/components/campaign-wizard/campaign-wizard-modal.tsx` | "Draft saved" pill in header |
| `src/components/campaign-wizard/wizard-step-basics.tsx` | Inline validation on name + objective |
| `src/components/campaign-wizard/wizard-step-budget.tsx` | Budget ≥ 0 validation, helper text |
| `src/components/campaign-wizard/wizard-step-tracking.tsx` | URL format validation on blur |
| `src/components/campaign-wizard/wizard-step-review.tsx` | Per-section validation summary |
| `src/components/automation/rule-editor-modal.tsx` | Schedule validation, save loading, multi-condition |
| `src/components/automation/rule-condition-builder.tsx` | Add Condition / Remove button |
| `src/components/automation/rule-action-builder.tsx` | Add Action / Remove button |
| `src/components/automation/rule-template-picker.tsx` | Popover preview on hover/focus |

## Implementation Steps

### 1. Campaign Wizard — Step Validation State

In `campaign-create-page.tsx`:
```tsx
// Track which steps have all required fields filled
const [stepValid, setStepValid] = useState<Record<number, boolean>>({});
// Validate current step's required fields on each state change
// Pass setStepValid down to each step component
// Disable "Next" when !stepValid[currentStep]
```

In step sidebar: replace plain step number with `✓` (fg_success) or `●` (neutral) icon based on stepValid.

### 2. Unsaved Changes Guard

```tsx
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (hasChanges) { e.preventDefault(); e.returnValue = ''; }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [hasChanges]);
```

Also intercept the modal's `onCancel` to show `ConfirmModal` if `hasChanges`.

### 3. Draft Saved Pill

In wizard header area:
```tsx
{lastSaved && (
  <span className="text-xs text_tertiary flex items-center gap-1">
    <Check size={12} className="fg_success" />
    Draft saved {formatRelativeTime(lastSaved)}
  </span>
)}
```

### 4. Rule Editor — Template Preview

In `rule-template-picker.tsx`, wrap each card:
```tsx
<Tooltip content={<TemplatePreview template={t} />} side="right">
  <div className="cursor-pointer ...">...</div>
</Tooltip>
```

`TemplatePreview` shows: condition summary + action summary in a small `bg_secondary radius_8 p-3` panel.

### 5. Rule Editor — Network Change Warning

```tsx
const handleNetworkChange = (newNetwork: string) => {
  if (condition.type || action.type) {
    setPendingNetwork(newNetwork);
    setShowNetworkWarning(true);
  } else {
    setNetwork(newNetwork);
  }
};
```

Inline warning block (not a modal) below the network selector:
```tsx
{showNetworkWarning && (
  <div className="radius_8 border border_amber bg_amber_subtle p-3 text-xs flex gap-3">
    <AlertTriangle size={14} className="fg_warning shrink-0 mt-0.5" />
    <span className="text_secondary">Changing network will reset your condition and action.</span>
    <div className="flex gap-2 ml-auto">
      <button onClick={cancel} className="fg_link font-medium">Cancel</button>
      <button onClick={confirm} className="fg_error font-medium">Reset & Change</button>
    </div>
  </div>
)}
```

### 6. Multi-Condition/Action

Add state: `conditions: Condition[]`, `actions: Action[]` (arrays).
Render each in a loop with a `×` remove button (disabled when only 1 remains).
Add `+ Add Condition` / `+ Add Action` button at bottom of each section.

## Success Criteria

- [ ] Campaign wizard "Next" is disabled when required fields on current step are empty
- [ ] Step sidebar shows ✓ for completed steps
- [ ] Leaving in-progress wizard shows confirmation dialog
- [ ] "Draft saved X min ago" appears in wizard header after first change
- [ ] Review step shows ✗ icon next to sections with missing required fields
- [ ] Schedule interval < 1 shows inline error below the input
- [ ] Network change after condition/action set shows inline warning with Cancel/Reset options
- [ ] Template card hover shows preview popover with condition + action summary
- [ ] Rule editor supports multiple conditions and multiple actions
- [ ] All modified files ≤ 200 LOC (split if needed)
- [ ] `npm run build` passes with 0 errors

## Risk Assessment

- **Multi-condition state refactor**: rule-editor-modal.tsx holds single condition/action state; refactoring to arrays may require updating `rule-conditions.ts` type definitions. Low risk — isolated to automation files.
- **Step validation in wizard**: needs passing `onValidChange` callback to each step; existing step components are clean functional components, straightforward to add.
- **ConfirmModal usage**: already exists in `src/components/ui/ConfirmModal.tsx` — reuse it.
