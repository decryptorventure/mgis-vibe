// Overview tab content for AxonWorkspace — trend chart, country bids, campaign health, signals, ROAS cohort
import React from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { BarChart3, Globe2, Lightbulb, Target } from 'lucide-react';
import { Card } from '@frontend-team/ui-kit';
import { mockAxonCountryBids, mockAxonCreativePerfs, mockAxonROASCohorts } from '@/shared/mock-data';
import {
  AXON_COLOR, formatCurrency,
  type AxonCampaignRow, type AxonTab, type ReportMode,
} from '@/components/networks/axon/axon-types';
import { PanelTitle, RecommendationBadge } from '@/components/networks/axon/axon-ui-atoms';

interface Props {
  reportMode: ReportMode;
  filteredCampaigns: AxonCampaignRow[];
  trendData: { label: string; spend: number; installs: number }[];
  stats: { recommendations: number; creativeScore: number };
  onTabChange: (key: AxonTab) => void;
  onSetCampaignDetail: (row: AxonCampaignRow) => void;
}

export const AxonWorkspaceOverviewTab: React.FC<Props> = ({
  reportMode, filteredCampaigns, trendData, stats, onTabChange, onSetCampaignDetail,
}) => {
  const topCountries = [...mockAxonCountryBids].sort((a, b) => b.spend - a.spend);
  const topCreatives = [...mockAxonCreativePerfs].sort((a, b) => b.aiScore - a.aiScore);
  const selectedRoas = mockAxonROASCohorts.find(r => r.cohort === 'D7');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-5">
        <Card className="radius_8 border border_primary p-5">
          <PanelTitle icon={<BarChart3 size={16} />} title="Campaign delivery trend" subtitle={`${reportMode === 'cohort' ? 'Cohort' : 'Real-time'} view`} />
          <div className="h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="axonSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AXON_COLOR} stopOpacity={0.34} />
                    <stop offset="95%" stopColor={AXON_COLOR} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <RTooltip formatter={(v: number, name: string) => [name === 'spend' ? formatCurrency(v) : v.toLocaleString(), name === 'spend' ? 'Spend' : 'Installs']} />
                <Area type="monotone" dataKey="spend" stroke={AXON_COLOR} fill="url(#axonSpend)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="installs" stroke={`${AXON_COLOR}99`} fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="radius_8 border border_primary p-5">
          <PanelTitle icon={<Globe2 size={16} />} title="Country bid priorities" subtitle="Top geos by spend" />
          <div className="h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountries.map(c => ({ name: c.countryCode, spend: c.spend }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <RTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                  {topCountries.map((c, i) => <Cell key={c.id} fill={i === 0 ? AXON_COLOR : `${AXON_COLOR}${i === 1 ? 'B0' : '78'}`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
        <Card className="radius_8 border border_primary p-4">
          <PanelTitle icon={<Target size={16} />} title="Campaign health" subtitle="Top campaigns by spend" />
          <div className="mt-4 space-y-3">
            {filteredCampaigns.slice(0, 5).map(c => (
              <button key={c.id} type="button" onClick={() => onSetCampaignDetail(c)}
                className="w-full bg_primary border border_primary radius_8 px-3 py-3 text-left cursor-pointer hover:bg_secondary">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold fg_blue_accent truncate">{c.name}</div>
                    <div className="text-xs text_tertiary mt-0.5">ID {c.axonId} | {c.platform} | {c.goalType}</div>
                  </div>
                  <RecommendationBadge value={c.recommendation} />
                </div>
                <div className="grid grid-cols-4 gap-3 mt-2.5 text-sm">
                  {([['Spend', formatCurrency(c.spend)], ['Installs', c.installs.toLocaleString()], ['eCPI', formatCurrency(c.ecpi)], ['ROAS', `${c.roas.toFixed(2)}x`]] as [string, string][]).map(([l, v]) => (
                    <div key={l}><div className="text-[11px] text_tertiary">{l}</div><div className="font-semibold text_primary">{v}</div></div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="radius_8 border border_primary p-4">
            <PanelTitle icon={<Lightbulb size={16} />} title="Operational signals" subtitle="What to inspect next" />
            <div className="space-y-2.5 mt-4">
              {([
                ['Manage campaigns', `${filteredCampaigns.length} campaigns`, () => onTabChange('campaigns')],
                ['Review bid signals', `${stats.recommendations} ready`, () => filteredCampaigns[0] && onSetCampaignDetail(filteredCampaigns[0])],
                ['Check creative scores', `Top: ${topCreatives[0]?.aiScore ?? 0}/100`, () => filteredCampaigns[0] && onSetCampaignDetail(filteredCampaigns[0])],
                ['Run automation', 'Country + creative rules', () => onTabChange('automation')],
              ] as [string, string, () => void][]).map(([title, sub, onClick]) => (
                <button key={title} type="button" onClick={onClick}
                  className="w-full text-left border border_primary radius_8 px-3 py-2.5 bg_secondary cursor-pointer hover:bg_primary">
                  <div className="text-sm font-semibold text_primary">{title}</div>
                  <div className="text-xs text_tertiary mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
          </Card>
          <Card className="radius_8 border border_primary p-4">
            <PanelTitle icon={<Target size={16} />} title="ROAS cohort snapshot" subtitle="D7 cohort health" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {([
                ['Predicted', selectedRoas ? `${(selectedRoas.predictedROAS * 100).toFixed(0)}%` : '-', ''],
                ['Actual', selectedRoas ? `${(selectedRoas.actualROAS * 100).toFixed(0)}%` : '-', 'fg_emerald_strong'],
                ['Users', selectedRoas?.users.toLocaleString() ?? '-', ''],
              ] as [string, string, string][]).map(([l, v, cls]) => (
                <div key={l} className="radius_8 bg_secondary border border_secondary p-3">
                  <div className="text-xs text_tertiary">{l}</div>
                  <div className={`text-lg font-semibold mt-1 ${cls || 'text_primary'}`}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

