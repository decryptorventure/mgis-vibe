import React from 'react';
import { Tabs as UiTabs, Steps as UiSteps, cn } from '@frontend-team/ui-kit';

export interface TabsProps {
  activeKey?: string;
  value?: string;
  defaultActiveKey?: string;
  items?: { key?: string; value?: string; label: React.ReactNode; children?: React.ReactNode }[];
  onChange?: (key: string) => void;
  className?: string;
  size?: string;
}

export function Tabs({ activeKey, value, defaultActiveKey, items = [], onChange, className }: TabsProps) {
  return (
    <UiTabs
      value={activeKey ?? value}
      defaultValue={defaultActiveKey}
      onValueChange={onChange}
      variant="underline"
      className={className}
      items={items.map((item) => ({
        value: item.key ?? item.value ?? String(item.label),
        label: item.label,
        content: item.children,
      }))}
    />
  );
}

interface StepsProps {
  current?: number;
  currentStep?: number;
  direction?: 'vertical' | 'horizontal';
  items?: { title?: React.ReactNode; description?: React.ReactNode; disabled?: boolean; status?: string }[];
  onChange?: (step: number) => void;
  size?: 'small' | 'default';
  className?: string;
}

export function Steps({ current, currentStep, direction, items = [], onChange, className }: StepsProps) {
  return (
    <button type="button" className={cn('w-full border-0 bg-transparent p-0 text-left', className)} onClick={() => onChange?.((current ?? currentStep ?? 0) + 1)}>
      <UiSteps
        currentStep={current ?? currentStep ?? 0}
        orientation={direction === 'vertical' ? 'vertical' : 'horizontal'}
        steps={items.map((item) => ({ content: item.title, secondaryContent: item.description }))}
      />
    </button>
  );
}

type MenuItem = { key: string; label: React.ReactNode; icon?: React.ReactNode; children?: MenuItem[] };

interface MenuProps {
  items?: MenuItem[];
  selectedKeys?: string[];
  defaultOpenKeys?: string[];
  mode?: string;
  inlineCollapsed?: boolean;
  onClick?: (event: { key: string }) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Menu({ items = [], selectedKeys = [], defaultOpenKeys = [], inlineCollapsed, onClick, className, style }: MenuProps) {
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(() => new Set(defaultOpenKeys));

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <nav className={cn('flex flex-col gap-0.5', className)} style={style}>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openGroups.has(item.key);
        const isSelected = selectedKeys.includes(item.key);
        const anyChildSelected = hasChildren && item.children!.some(c => selectedKeys.includes(c.key));

        if (hasChildren) {
          return (
            <div key={item.key}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border-0 px-3 py-2 text-left body_s transition-colors',
                  anyChildSelected ? 'text_primary' : 'text_secondary',
                  'bg-transparent hover:bg_secondary',
                )}
                onClick={() => toggleGroup(item.key)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!inlineCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <svg
                      className={cn('ml-auto h-3 w-3 flex-shrink-0 transition-transform text_tertiary', isOpen && 'rotate-90')}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              {isOpen && !inlineCollapsed && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border_secondary pl-2">
                  {item.children!.map(child => (
                    <button
                      key={child.key}
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md border-0 px-2.5 py-1.5 text-left body_s transition-colors',
                        selectedKeys.includes(child.key) ? 'bg_tertiary text_primary font-medium' : 'bg-transparent text_secondary hover:bg_secondary',
                      )}
                      onClick={() => onClick?.({ key: child.key })}
                    >
                      <span className="flex-shrink-0">{child.icon}</span>
                      <span className="truncate">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            className={cn(
              'flex w-full items-center gap-2 rounded-md border-0 px-3 py-2 text-left body_s transition-colors',
              isSelected ? 'bg_tertiary text_primary font-medium' : 'bg-transparent text_secondary hover:bg_secondary',
            )}
            onClick={() => onClick?.({ key: item.key })}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!inlineCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

export function Collapse({ items = [], className }: { items?: { key: string; label: React.ReactNode; children: React.ReactNode }[]; className?: string; activeKey?: string | string[]; expandIconPosition?: string; ghost?: boolean }) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <details key={item.key} className="rounded-lg border border_primary bg_primary p-3">
          <summary className="cursor-pointer body_s font-semibold text_primary">{item.label}</summary>
          <div className="mt-3">{item.children}</div>
        </details>
      ))}
    </div>
  );
}
