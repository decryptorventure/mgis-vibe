// Column builder — pure factory for Ant Design ColumnsType for Meta report tables.
// All state deps passed explicitly; no closures over component state.
import { Switch, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CircleAlert, Edit3, Folder, Play } from 'lucide-react';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import type { MetaEntity, MetaReportRow, MetaColumnKey, MetaColumnConfig, HeatmapColor } from './meta-types';
import { ENTITY_META, META_REPORT_COLUMNS, HEATMAP_COLORS } from './meta-table-config';
import { META_COLUMN_HELP } from './meta-column-help-text';
import { isCampaign, isAdSet, getAdSetCampaignName, getAdSetName, getMetricValue, formatMetricValue, getHeatmapStyle, getPacingStatus, PACING_META } from './meta-metric-helpers';
import { HeatmapColorPicker } from './meta-column-settings-drawer';
import type { Campaign, AdSet, Ad } from '@/shared/mock-data';

export interface ColumnBuilderConfig {
  entity: MetaEntity;
  visibleColumnKeys: MetaColumnKey[];
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
  campaigns: Campaign[];
  adSets: AdSet[];
  onStatusChange: (entity: MetaEntity, id: string, enabled: boolean) => void;
  onUpdateHeatmapColor: (colorId: string, columnKey: MetaColumnKey) => void;
  onRemoveHeatmapColor: (columnKey: MetaColumnKey) => void;
  onDrillCampaign: (id: string) => void;
  onDrillAdSet: (id: string, campaignId: string) => void;
  onEditCampaign: (record: Campaign) => void;
  onEditAdSet: (record: AdSet) => void;
  onEditAd: (record: Ad) => void;
}

function getHeatmapDomains(rows: MetaReportRow[]): Partial<Record<MetaColumnKey, { min: number; max: number }>> {
  const domains: Partial<Record<MetaColumnKey, { min: number; max: number }>> = {};
  META_REPORT_COLUMNS.forEach(col => {
    if (!col.metric) return;
    const values = rows.map(r => getMetricValue(r, col.key)).filter((v): v is number => typeof v === 'number' && v > 0);
    if (values.length === 0) return;
    domains[col.key] = { min: Math.min(...values), max: Math.max(...values) };
  });
  return domains;
}

function ColumnTitle({ column, label, heatmapColors, onUpdateHeatmapColor, onRemoveHeatmapColor }: {
  column: MetaColumnConfig;
  label: string;
  heatmapColors: Partial<Record<MetaColumnKey, string>>;
  onUpdateHeatmapColor: (colorId: string, columnKey: MetaColumnKey) => void;
  onRemoveHeatmapColor: (columnKey: MetaColumnKey) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1 min-w-0">
      {META_COLUMN_HELP[column.key] ? (
        <Tooltip placement="top" title={<div className="max-w-[280px] text-xs leading-5">{META_COLUMN_HELP[column.key]}</div>}>
          <span className="inline-flex items-center gap-1 min-w-0 cursor-help">
            <span className="truncate">{label}</span>
            <CircleAlert size={13} className="text_tertiary shrink-0" />
          </span>
        </Tooltip>
      ) : (
        <span className="truncate">{label}</span>
      )}
      <div className="shrink-0">
        {column.metric && (
          <HeatmapColorPicker
            column={column}
            selectedColor={HEATMAP_COLORS.find(c => c.id === heatmapColors[column.key])}
            onSelect={colorId => onUpdateHeatmapColor(colorId, column.key)}
            onRemove={() => onRemoveHeatmapColor(column.key)}
          />
        )}
      </div>
    </div>
  );
}

function EntityNameCell({ record, campaigns, adSets, onDrillCampaign, onDrillAdSet, onEditCampaign, onEditAdSet, onEditAd }: {
  record: MetaReportRow; campaigns: Campaign[]; adSets: AdSet[];
  onDrillCampaign: (id: string) => void;
  onDrillAdSet: (id: string, campaignId: string) => void;
  onEditCampaign: (r: Campaign) => void;
  onEditAdSet: (r: AdSet) => void;
  onEditAd: (r: Ad) => void;
}) {
  if (isCampaign(record)) return (
    <div className="flex items-center justify-between gap-2">
      <button type="button" className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate" onClick={() => onDrillCampaign(record.id)}>{record.name}</button>
      <button type="button" className="border-0 bg-transparent p-0 cursor-pointer text_tertiary shrink-0" onClick={() => onEditCampaign(record)} aria-label={`Edit ${record.name}`}><Edit3 size={13} /></button>
    </div>
  );

  if (isAdSet(record)) return (
    <div className="min-w-0">
      <button type="button" className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate" onClick={() => onDrillAdSet(record.id, record.campaignId)}>{record.name}</button>
      <div className="text-xs text_tertiary truncate">{getAdSetCampaignName(record, campaigns)}</div>
      <button type="button" className="mt-1 border-0 bg-transparent p-0 text-xs font-semibold fg_blue_accent cursor-pointer" onClick={() => onEditAdSet(record)}>Edit ad set</button>
    </div>
  );

  const ad = record as Ad;
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 radius_8 bg_secondary border border_secondary flex items-center justify-center icon_tertiary shrink-0">
        {ad.type === 'VIDEO' ? <Play size={16} /> : <Folder size={16} />}
      </div>
      <div className="min-w-0">
        <button type="button" className="bg-transparent border-0 p-0 text-left fg_blue_accent font-semibold cursor-pointer hover:underline truncate max-w-60" onClick={() => onEditAd(ad)}>{ad.name}</button>
        <div className="text-xs text_tertiary truncate">{getAdSetName(ad, adSets)}</div>
      </div>
    </div>
  );
}

export function buildMetaColumns<T extends MetaReportRow>(targetEntity: MetaEntity, rows: T[], config: ColumnBuilderConfig): ColumnsType<T> {
  const entityLabel = ENTITY_META[targetEntity].singular;
  const heatmapDomains = getHeatmapDomains(rows);
  const { visibleColumnKeys, heatmapColors } = config;
  const titleProps = { heatmapColors, onUpdateHeatmapColor: config.onUpdateHeatmapColor, onRemoveHeatmapColor: config.onRemoveHeatmapColor };

  return META_REPORT_COLUMNS.filter(col => visibleColumnKeys.includes(col.key)).map(col => {
    const title = <ColumnTitle column={col} label={col.key === 'entity' ? entityLabel : col.label} {...titleProps} />;

    if (col.key === 'action') return {
      title, key: col.key, width: col.width, fixed: col.fixed,
      render: (_: unknown, record: T) => <Switch size="small" checked={record.status === 'ACTIVE'} onChange={checked => config.onStatusChange(targetEntity, record.id, checked)} />,
    };

    if (col.key === 'entity') return {
      title, key: col.key, width: col.width, fixed: col.fixed,
      render: (_: unknown, record: T) => (
        <EntityNameCell record={record} campaigns={config.campaigns} adSets={config.adSets}
          onDrillCampaign={config.onDrillCampaign} onDrillAdSet={config.onDrillAdSet}
          onEditCampaign={config.onEditCampaign} onEditAdSet={config.onEditAdSet} onEditAd={config.onEditAd} />
      ),
    };

    if (col.key === 'status') return {
      title, key: col.key, width: col.width,
      render: (_: unknown, record: T) => <StatusBadge label={record.status} variant={statusToVariant(record.status)} />,
    };

    if (col.key === 'amountSpent') return {
      title, key: col.key, width: col.width, align: 'right' as const,
      render: (_: unknown, record: T) => {
        const value = getMetricValue(record, col.key);
        const selectedColor: HeatmapColor | undefined = HEATMAP_COLORS.find(c => c.id === heatmapColors[col.key]);
        const pacing = PACING_META[getPacingStatus(record)];
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span className="inline-flex justify-end px-2 py-1 radius_4" style={getHeatmapStyle(value, col.key, selectedColor, heatmapDomains[col.key])}>
              {formatMetricValue(col.key, value)}
            </span>
            {isCampaign(record) && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${pacing.cls}`}>
                {pacing.label}
              </span>
            )}
          </div>
        );
      },
    };

    return {
      title, key: col.key, width: col.width, align: col.metric ? ('right' as const) : ('left' as const),
      render: (_: unknown, record: T) => {
        const value = getMetricValue(record, col.key);
        const selectedColor: HeatmapColor | undefined = HEATMAP_COLORS.find(c => c.id === heatmapColors[col.key]);
        return (
          <span className="inline-flex min-w-0 justify-end px-2 py-1 radius_4" style={getHeatmapStyle(value, col.key, selectedColor, heatmapDomains[col.key])}>
            {formatMetricValue(col.key, value)}
          </span>
        );
      },
    };
  }) as ColumnsType<T>;
}
