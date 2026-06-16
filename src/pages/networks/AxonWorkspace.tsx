// ─── Axon (AppLovin) Workspace — thin plugin ─────────────────────────────────
// Country bid management is preserved as an extraTab.
// Shell handles header, toolbar, Campaigns/Insights/Settings tabs.
import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Tooltip } from 'antd';
import { toast } from '@frontend-team/ui-kit';
import { Check, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { mockAxonCountryBids, type AxonCountryBid, mockCampaigns } from '@/shared/mock-data';
import { NetworkWorkspaceShell } from '@/components/networks/network-workspace-shell';
import { NETWORK_CONFIGS } from '@/shared/network-config';

// ─── Country bid management tab (Axon-specific) ───────────────────────────────
const CountryBidsTab: React.FC = () => {
  const [countryBids, setCountryBids] = useState<AxonCountryBid[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBidVal, setEditBidVal] = useState(0.8);

  useEffect(() => { setCountryBids(mockAxonCountryBids); }, []);

  const saveBid = (id: string) => {
    setCountryBids(prev => prev.map(c => c.id === id ? { ...c, baseBid: editBidVal } : c));
    setEditingId(null);
    toast.success('Country bid updated');
  };

  const applyRecommendation = (record: AxonCountryBid) => {
    if (!record.recommendation) return;
    const { action, percent } = record.recommendation;
    const newBid = parseFloat((
      action === 'INCREASE'
        ? record.baseBid * (1 + percent / 100)
        : record.baseBid * (1 - percent / 100)
    ).toFixed(3));
    setCountryBids(prev => prev.map(c =>
      c.id === record.id ? { ...c, baseBid: newBid, recommendation: undefined } : c
    ));
    toast.success(`Applied bid for ${record.countryName}: $${newBid}`);
  };

  const flagFor = (code: string) =>
    ({ US: '🇺🇸', JP: '🇯🇵', KR: '🇰🇷', VN: '🇻🇳' }[code] ?? '🌐');

  const columns = [
    {
      title: 'Country', dataIndex: 'countryName', key: 'countryName',
      render: (t: string, r: AxonCountryBid) => (
        <span className="font-semibold text-xs flex items-center gap-1.5">
          <span>{flagFor(r.countryCode)}</span>{t}
        </span>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <StatusBadge label={s} variant={statusToVariant(s)} />,
    },
    {
      title: 'Bid ($)', dataIndex: 'baseBid', key: 'baseBid', width: 150,
      render: (v: number, r: AxonCountryBid) => editingId === r.id ? (
        <div className="flex items-center gap-1">
          <InputNumber size="small" min={0.01} step={0.05} value={editBidVal} onChange={val => setEditBidVal(val || 0.1)} className="w-20" />
          <Button size="small" type="primary" className="bg-[var(--status-success)] border-none w-6 h-6 p-0 flex items-center justify-center" icon={<Check size={12} />} onClick={() => saveBid(r.id)} />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setEditingId(r.id); setEditBidVal(r.baseBid); }}>
          <span className="font-semibold text-xs">${v.toFixed(2)}</span>
          <Edit size={11} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100" />
        </div>
      ),
    },
    { title: 'Target CPA', dataIndex: 'targetCpa', key: 'targetCpa', width: 100, render: (v: number) => `$${v.toFixed(2)}` },
    {
      title: 'Actual CPA', dataIndex: 'actualCpa', key: 'actualCpa', width: 100,
      render: (v: number, r: AxonCountryBid) => (
        <span className={v > r.targetCpa ? 'text-[var(--status-error)] font-bold text-xs' : 'text-xs'}>${v.toFixed(2)}</span>
      ),
    },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 95, render: (v: number) => `$${v.toLocaleString()}` },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 90, render: (v: number) => v.toLocaleString() },
    {
      title: 'Recommendation', key: 'recommendation',
      render: (_: unknown, r: AxonCountryBid) => {
        if (!r.recommendation) return <span className="text-[var(--text-tertiary)] text-xs">—</span>;
        const isUp = r.recommendation.action === 'INCREASE';
        return (
          <div className="flex items-center gap-2 bg-[var(--surface-subtle)] p-1.5 rounded-lg border border-[var(--border-subtle)]">
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isUp ? 'text-[var(--status-success)]' : 'text-[var(--status-warning)]'}`}>
              {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {isUp ? '+' : '-'}{r.recommendation.percent}%
            </span>
            <Tooltip title={r.recommendation.reason}>
              <Button size="small" type="primary" className="bg-[var(--chart-4)] border-none text-[9px] h-6 px-2 font-bold rounded" onClick={() => applyRecommendation(r)}>
                Apply
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      className="nms-table"
      columns={columns}
      dataSource={countryBids}
      rowKey="id"
      pagination={false}
      scroll={{ x: 900 }}
    />
  );
};

import { useParams } from 'react-router-dom';
import { AxonCreativePerfTab } from '@/components/networks/axon/axon-creative-perf-tab';
import { AxonRoasOptimizerTab } from '@/components/networks/axon/axon-roas-optimizer-tab';

// ─── Axon Workspace (thin plugin) ────────────────────────────────────────────
export const AxonWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const campaigns = mockCampaigns.filter(
    (c: { network: string; projectId: string }) =>
      c.network === network && (!appId || c.projectId === appId)
  );

  const config = {
    ...NETWORK_CONFIGS['axon'],
    extraTabs: [
      {
        key: 'country-bids',
        label: `Country Bid Overrides`,
        children: <CountryBidsTab />,
      },
      {
        key: 'creative-performance',
        label: 'Creative Performance',
        children: <AxonCreativePerfTab />
      },
      {
        key: 'roas-optimizer',
        label: 'ROAS Optimizer',
        children: <AxonRoasOptimizerTab />
      }
    ],
  };

  return <NetworkWorkspaceShell config={config} campaigns={campaigns} />;
};

export default AxonWorkspace;
