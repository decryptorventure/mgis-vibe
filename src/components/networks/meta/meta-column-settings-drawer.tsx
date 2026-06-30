// Column settings drawer â€” toggle visible columns, assign heatmap colors per metric
import React from 'react';
import { Checkbox, Drawer, Popover, Switch } from '@/components/ui-kit-compat';
import { Palette, X } from 'lucide-react';
import { Button, cn } from '@frontend-team/ui-kit';
import type { MetaEntity, MetaColumnKey, MetaColumnConfig, HeatmapColor } from './meta-types';
import {
  META_REPORT_COLUMNS,
  HEATMAP_COLORS,
  DEFAULT_VISIBLE_BY_ENTITY,
} from './meta-table-config';

// Inline color swatch popover for picking a heatmap color on a metric column
export const HeatmapColorPicker: React.FC<{
  column: MetaColumnConfig;
  selectedColor?: HeatmapColor;
  onSelect: (colorId: string) => void;
  onRemove: () => void;
}> = ({ column, selectedColor, onSelect, onRemove }) => {
  const content = (
    <div className="w-[180px]">
      <div className="px-1 pb-3 text-xs font-bold uppercase tracking-wide text_tertiary">Color heatmap</div>
      <div className="grid grid-cols-4 gap-3 px-1 pb-4">
        {HEATMAP_COLORS.map(color => {
          const isSelected = selectedColor?.id === color.id;
          return (
            <button
              key={color.id}
              type="button"
              aria-label={`Use ${color.label} heatmap for ${column.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(color.id);
              }}
              className={cn(
                'w-6 h-6 radius_round border cursor-pointer transition-shadow',
                isSelected ? 'border_blue shadow-[0_0_0_3px_var(--ds-border-focus)]' : 'border-transparent hover:shadow-sm',
              )}
              style={{ backgroundColor: `rgb(${color.rgb})` }}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="w-full border-0 border-t border_secondary bg-transparent px-1 pt-3 flex items-center gap-2 text-sm font-semibold text_secondary cursor-pointer hover:text_primary"
      >
        <X size={14} />
        Remove Heatmap
      </button>
    </div>
  );

  return (
    <Popover placement="bottomRight" trigger="click" content={content} overlayInnerStyle={{ padding: 12 }}>
      <button
        type="button"
        className={cn(
          'border-0 bg-transparent p-0 cursor-pointer inline-flex items-center icon_tertiary hover:fg_blue_accent',
          selectedColor && 'fg_accent_primary',
        )}
        aria-label={`Choose heatmap color for ${column.label}`}
        onClick={event => event.stopPropagation()}
      >
        <Palette size={14} />
      </button>
    </Popover>
  );
};

interface ColumnSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  entity: MetaEntity;
  visibleKeys: MetaColumnKey[];
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
  onVisibleKeysChange: (keys: MetaColumnKey[]) => void;
  onHeatmapColorsChange: (colors: Partial<Record<MetaColumnKey, string>>) => void;
}

export const ColumnSettingsDrawer: React.FC<ColumnSettingsDrawerProps> = ({
  open,
  onClose,
  entity,
  visibleKeys,
  heatmapColors,
  onVisibleKeysChange,
  onHeatmapColorsChange,
}) => {
  const metricColumns = META_REPORT_COLUMNS.filter(column => column.metric);
  const defaultHeatmapColor = HEATMAP_COLORS.find(color => color.id === 'orange') ?? HEATMAP_COLORS[0];

  const toggleVisible = (key: MetaColumnKey, checked: boolean) => {
    if (checked) {
      onVisibleKeysChange(Array.from(new Set([...visibleKeys, key])));
      return;
    }
    if (['action', 'entity'].includes(key)) return;
    onVisibleKeysChange(visibleKeys.filter(item => item !== key));
  };

  const toggleHeatmap = (key: MetaColumnKey, checked: boolean) => {
    if (checked) {
      onHeatmapColorsChange({ ...heatmapColors, [key]: defaultHeatmapColor.id });
      return;
    }
    const next = { ...heatmapColors };
    delete next[key];
    onHeatmapColorsChange(next);
  };

  return (
    <Drawer
      title="Customize columns"
      open={open}
      onClose={onClose}
      width={420}
      extra={(
        <Button
          type="button"
          variant="border"
          size="s"
          onClick={() => {
            onVisibleKeysChange(DEFAULT_VISIBLE_BY_ENTITY[entity]);
            onHeatmapColorsChange({});
          }}
        >
          Reset
        </Button>
      )}
    >
      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase text_tertiary mb-2">Visible columns</div>
          <div className="space-y-1.5">
            {META_REPORT_COLUMNS.map(column => (
              <label key={column.key} className="flex items-center justify-between gap-3 p-2 radius_6 hover:bg_secondary cursor-pointer">
                <span className="text-sm text_primary">{column.label}</span>
                <Checkbox
                  checked={visibleKeys.includes(column.key)}
                  disabled={['action', 'entity'].includes(column.key)}
                  onChange={event => toggleVisible(column.key, event.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase text_tertiary mb-2">Color heatmap</div>
          <div className="space-y-1.5">
            {metricColumns.map(column => (
              <label key={column.key} className="flex items-center justify-between gap-3 p-2 radius_6 hover:bg_secondary cursor-pointer">
                <span className="text-sm text_primary">{column.label}</span>
                <Switch
                  size="small"
                  checked={Boolean(heatmapColors[column.key])}
                  onChange={checked => toggleHeatmap(column.key, checked)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
