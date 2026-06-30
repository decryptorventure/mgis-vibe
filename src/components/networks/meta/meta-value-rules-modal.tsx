// Manage Value Rule Sets modal — list view + create form (extracted to meta-value-rules-create-form)
import React, { useState } from 'react';
import { Modal } from '@/components/ui-kit-compat';
import { Button } from '@frontend-team/ui-kit';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { CreateForm } from './meta-value-rules-create-form';

interface RuleSet { name: string; rules: number }

// TODO: replace with RTK Query when API is available
const MOCK_RULE_SETS: RuleSet[] = [
  { name: 'FOCUS PT 95%', rules: 1 },
  { name: 'FOCUS ES 95%', rules: 1 },
  { name: 'Focus EN 98%', rules: 1 },
  { name: 'ES - Increase US 90%', rules: 1 },
  { name: 'FOCUS ASIA 95%', rules: 1 },
  { name: '20% - 55+', rules: 1 },
];

interface Props { open: boolean; onClose: () => void }

export const MetaValueRulesModal: React.FC<Props> = ({ open, onClose }) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [ruleSets, setRuleSets] = useState<RuleSet[]>(MOCK_RULE_SETS);

  const handleClose = () => { setMode('list'); onClose(); };

  return (
    <Modal open={open} onCancel={handleClose} title="Manage Value Rule Sets" width={540} footer={null}>
      {mode === 'list' ? (
        <div className="space-y-2 pb-1">
          {ruleSets.map(rs => (
            <div key={rs.name} className="flex items-center justify-between px-3 py-2.5 border border_primary radius_8 bg_primary">
              <div>
                <span className="body_s font-semibold text_primary">{rs.name}</span>
                <span className="ml-2 text-xs text_tertiary">{rs.rules} active rule</span>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="s" className="w-7 h-7 p-0 flex items-center justify-center" aria-label="Edit rule set">
                  <Pencil size={13} className="text_secondary" />
                </Button>
                <Button
                  type="button" variant="ghost" size="s"
                  className="w-7 h-7 p-0 flex items-center justify-center fg_error"
                  aria-label="Delete rule set"
                  onClick={() => setRuleSets(prev => prev.filter(r => r.name !== rs.name))}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text_tertiary pt-1">Maximum 6 rule sets allowed. Delete an existing one to create a new rule set.</p>
          <Button type="button" variant="border" size="s" className="mt-2 gap-1.5" onClick={() => setMode('create')}>
            <Plus size={13} />Create new rule set
          </Button>
        </div>
      ) : (
        <CreateForm
          onCancel={() => setMode('list')}
          onCreate={(name) => { setRuleSets(prev => [...prev, { name, rules: 1 }]); setMode('list'); }}
        />
      )}
    </Modal>
  );
};
