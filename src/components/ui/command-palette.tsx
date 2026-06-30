// ─── CommandPalette — global ⌘K / Ctrl+K quick navigation modal ─────────────
import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui-kit-compat';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Rocket } from 'lucide-react';
import { mockProjects } from '@/shared/mock-data';
import { ACTIVE_NETWORKS, isActiveNetworkKey } from '@/shared/navigation';
import type { ActiveNetworkKey } from '@/shared/navigation';

interface PaletteItem {
  key: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function buildItems(navigate: ReturnType<typeof useNavigate>): PaletteItem[] {
  const items: PaletteItem[] = [
    {
      key: 'dashboard',
      label: 'Global Dashboard',
      group: 'Quick Actions',
      icon: <LayoutDashboard size={14} />,
      action: () => navigate('/'),
    },

  ];

  mockProjects.forEach(app => {
    app.networks
      .filter(isActiveNetworkKey)
      .forEach((netKey: ActiveNetworkKey) => {
        items.push({
          key: `${app.id}-${netKey}`,
          label: `${app.name} → ${ACTIVE_NETWORKS[netKey].label}`,
          group: 'Workspaces',
          icon: <span className="text-sm">{app.icon}</span>,
          action: () => navigate(`/apps/${app.id}/networks/${netKey}`),
        });
      });

    items.push({
      key: `${app.id}-new-campaign`,
      label: `New Campaign — ${app.name}`,
      group: 'Create',
      icon: <Rocket size={14} />,
      action: () => navigate(`/apps/${app.id}/networks/${app.networks[0]}/campaigns/new`),
    });
  });

  return items;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const allItems = useMemo(() => buildItems(navigate), [navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    filtered.forEach(item => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    });
    return map;
  }, [filtered]);

  const handleSelect = (item: PaletteItem) => {
    item.action();
    onClose();
    setQuery('');
  };

  const handleClose = () => {
    onClose();
    setQuery('');
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {/* Search input */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
        <Search size={16} className="text-[var(--text-tertiary)] flex-shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && handleClose()}
          placeholder="Search apps, networks, actions..."
          className="flex-1 text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
        <kbd className="text-[10px] text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
          ESC
        </kbd>
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto py-2">
        {groups.size === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-[var(--text-disabled)]">No results</div>
        ) : (
          Array.from(groups.entries()).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 py-1 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                {group}
              </div>
              {items.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-muted)] text-left transition-colors"
                >
                  <span className="text-[var(--text-tertiary)] flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
