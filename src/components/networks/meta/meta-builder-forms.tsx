// Shared builder primitives — BuilderCard and BuilderTreeItem
// Forms live in meta-campaign-settings-form, meta-adset-settings-form, meta-creative-form
import React from 'react';
import { cn } from '@frontend-team/ui-kit';

// Sidebar nav item used by MetaBuilderDrawer and other wizard drawers
export const BuilderTreeItem: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2 text-left px-3 py-2 radius_8 border cursor-pointer',
      active
        ? 'bg_blue_subtle border_blue fg_blue_strong'
        : 'bg_primary border-transparent text_primary hover:state_bg_button_tertiary_soft',
    )}
  >
    {icon}
    <span className="text-sm font-medium truncate">{label}</span>
  </button>
);

// Card wrapper for grouped form sections
export const BuilderCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg_primary border border_primary radius_8 p-5 space-y-4">
    {title && (
      <div className="text-sm font-semibold text_primary -mb-1 pb-3 border-b border_secondary">
        {title}
      </div>
    )}
    {children}
  </div>
);
