// meta-batch-prompt-criteria.tsx — free-text "describe your batch" box, mock-parsed into criteria
// (ports the prompt-to-criteria concept from the retired AI Bulk Create flow — third-party AI
// model integration is future work; parsing logic lives in meta-batch-prompt-parser.ts)
import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@frontend-team/ui-kit';
import { parseBatchPrompt } from './meta-batch-prompt-parser';
import type { PromptCriteriaResult } from './meta-batch-prompt-parser';
import type { BatchTheme } from './meta-batch-types';
import type { MetaTemplate } from './meta-types';

interface Props {
  templates: MetaTemplate[];
  themes: BatchTheme[];
  onApply: (result: PromptCriteriaResult) => void;
}

export const BatchPromptCriteria: React.FC<Props> = ({ templates, themes, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [assumptions, setAssumptions] = useState<string[]>([]);

  const handleApply = () => {
    if (!prompt.trim()) return;
    const result = parseBatchPrompt(prompt, templates, themes);
    setAssumptions(result.assumptions);
    onApply(result);
  };

  return (
    <div className="border border_blue bg_blue_subtle radius_8 p-3 mb-3 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <Bot size={14} className="fg_blue_accent" />
        <span className="text-xs font-semibold text_primary">Describe your batch</span>
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="e.g. Sexy Phone and Mistakes themes, min 6 creatives, install CTA"
        aria-label="Describe your batch in plain text"
        rows={2}
        className="w-full border border_primary radius_8 px-2.5 py-1.5 text-[11px] text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary resize-none"
      />
      <div className="flex justify-end mt-1.5">
        <Button type="button" variant="primary" size="s" className="gap-1.5" onClick={handleApply} disabled={!prompt.trim()}>
          <Sparkles size={12} />
          Apply to Criteria
        </Button>
      </div>
      {assumptions.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border_blue pt-2">
          {assumptions.map(a => (
            <div key={a} className="text-[10px] text_secondary">{a}</div>
          ))}
        </div>
      )}
    </div>
  );
};
