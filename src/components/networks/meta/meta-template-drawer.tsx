// Template drawer â€” list and edit campaign templates
import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui-kit-compat';
import { Copy, Edit3, FileText, Plus, Trash2, X } from 'lucide-react';
import { Button, Card, toast } from '@frontend-team/ui-kit';
import type { MetaPage, MetaTemplate } from './meta-types';
import { META_TEMPLATES } from './meta-table-config';
import { TemplateEditForm } from './meta-template-forms';

interface TemplateDrawerProps {
  open: boolean;
  onClose: () => void;
  templates: MetaTemplate[];
  pages: MetaPage[];
  onChange: (templates: MetaTemplate[]) => void;
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({ open, onClose, templates, pages, onChange }) => {
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [activeTemplate, setActiveTemplate] = useState<MetaTemplate>(templates[0] ?? META_TEMPLATES[0]);

  const openEdit = (template: MetaTemplate) => {
    setActiveTemplate(template);
    setMode('edit');
  };

  useEffect(() => {
    if (templates.length > 0 && !templates.some(t => t.id === activeTemplate.id)) {
      setActiveTemplate(templates[0]);
    }
  }, [activeTemplate.id, templates]);

  const saveTemplate = () => {
    const exists = templates.some(t => t.id === activeTemplate.id);
    const next = exists
      ? templates.map(t => t.id === activeTemplate.id ? activeTemplate : t)
      : [{ ...activeTemplate, id: `tpl-${Date.now()}` }, ...templates];
    onChange(next);
    toast.success('Template changes saved');
    setMode('list');
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button type="button" className="bg-transparent border-0 cursor-pointer text_secondary" onClick={() => setMode('list')} aria-label="Back to templates">
              <X size={16} />
            </button>
          )}
          <span className="text-base font-semibold text_primary">Campaign Templates</span>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: 0, background: 'var(--ds-bg-canvas-secondary)' }, footer: { padding: 12 } }}
      footer={mode === 'edit' ? (
        <div className="flex items-center justify-between">
          <Button type="button" variant="border" size="m" className="gap-1.5" onClick={() => setMode('list')}>
            <X size={14} /> Back to list
          </Button>
          <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={saveTemplate}>
            <FileText size={14} /> Save Changes
          </Button>
        </div>
      ) : undefined}
      extra={mode === 'list' ? (
        <Button type="button" variant="primary" size="m" className="gap-1.5" onClick={() => {
          setActiveTemplate({ id: `tpl-new-${Date.now()}`, name: 'New Meta Template', objective: 'Sales', age: '18-65', attribution: '7d click / 1d view', placements: ['Facebook', 'Instagram'] });
          setMode('edit');
        }}>
          <Plus size={14} /> Create Template
        </Button>
      ) : null}
    >
      {mode === 'list' ? (
        <div className="p-5 space-y-3">
          {templates.map(template => (
            <Card key={template.id} className="radius_8 border border_primary bg_primary overflow-hidden p-0">
              <div className="p-4 bg_blue_subtle border-b border_blue">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 radius_8 bg_info_contrast fg_on_contrast flex items-center justify-center font-bold">
                      {template.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text_primary truncate">{template.name}</div>
                      <div className="text-xs text_tertiary">Created 6/12/2026</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="dim" size="icon-s" aria-label="Edit template" onClick={() => openEdit(template)}><Edit3 size={13} /></Button>
                    <Button type="button" variant="dim" size="icon-s" aria-label="Duplicate template" onClick={() => onChange([{ ...template, id: `${template.id}-copy-${Date.now()}`, name: `${template.name} Copy` }, ...templates])}>
                      <Copy size={13} />
                    </Button>
                    <Button type="button" variant="danger" size="icon-s" aria-label="Delete template" onClick={() => onChange(templates.filter(t => t.id !== template.id))}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_amber_subtle fg_amber_strong border border_amber">{template.objective}</span>
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_blue_subtle fg_blue_strong border border_blue">Age {template.age}</span>
                <span className="text-[11px] font-medium px-2 py-1 radius_4 bg_secondary border border_secondary text_secondary">{template.attribution}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <TemplateEditForm
          activeTemplate={activeTemplate}
          pages={pages}
          onTemplateChange={updater => setActiveTemplate(updater)}
        />
      )}
    </Drawer>
  );
};
