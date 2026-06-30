// ─── ASA (Apple Search Ads) Workspace — thin plugin ──────────────────────────
// All shared shell/table/settings/insights logic lives in NetworkWorkspaceShell.
// ASA-specific keyword management tabs are preserved as extraTabs in asaConfig.
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, InputNumber, Select, Tooltip, Space } from '@/components/ui-kit-compat';
import { toast } from '@frontend-team/ui-kit';
import { Check, X, Ban, Star, Edit } from 'lucide-react';
import {
  mockAsaKeywords, mockAsaSearchTerms, mockAsaNegativeKeywords, mockCampaigns,
  type AsaKeyword, type AsaSearchTerm, type AsaNegativeKeyword,
} from '@/shared/mock-data';
import { NetworkWorkspaceShell } from '@/components/networks/network-workspace-shell';
import { NETWORK_CONFIGS } from '@/shared/network-config';
import { useParams } from 'react-router-dom';

// ─── ASA keyword management tabs (network-specific) ──────────────────────────
const AsaKeywordTabs: React.FC = () => {
  const { appId } = useParams<{ appId?: string }>();
  const [keywords, setKeywords] = useState<AsaKeyword[]>([]);
  const [searchTerms, setSearchTerms] = useState<AsaSearchTerm[]>([]);
  const [negatives, setNegatives] = useState<AsaNegativeKeyword[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBidVal, setEditBidVal] = useState(1.0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<AsaSearchTerm | null>(null);
  const [targetBid, setTargetBid] = useState(1.2);
  const [targetMatchType, setTargetMatchType] = useState<'EXACT' | 'BROAD'>('EXACT');

  useEffect(() => {
    const activeCampaignIds = mockCampaigns
      .filter((c) => !appId || c.projectId === appId)
      .map((c) => c.id);

    setKeywords(mockAsaKeywords.filter((k) => activeCampaignIds.includes(k.campaignId)));
    setSearchTerms(mockAsaSearchTerms.filter((t) => activeCampaignIds.includes(t.campaignId)));
    setNegatives(mockAsaNegativeKeywords.filter((n) => activeCampaignIds.includes(n.campaignId)));
  }, [appId]);

  const saveBid = (id: string) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, bid: editBidVal } : k));
    setEditingId(null);
    toast.success('Keyword bid updated');
  };

  const openAddKeywordFlow = (term: AsaSearchTerm) => {
    setSelectedTerm(term);
    setTargetBid(parseFloat((term.cpa * 1.5 || 1.2).toFixed(2)));
    setAddModalOpen(true);
  };

  const confirmAddKeyword = () => {
    if (!selectedTerm) return;
    const newKw: AsaKeyword = {
      id: `ak_new_${Date.now()}`, campaignId: selectedTerm.campaignId,
      adGroupId: selectedTerm.adGroupId, keywordText: selectedTerm.queryText,
      matchType: targetMatchType, status: 'ACTIVE', bid: targetBid,
      impressions: 0, clicks: 0, installs: 0, spend: 0, cpa: 0, roas: 0,
    };
    setKeywords([newKw, ...keywords]);
    setSearchTerms(prev => prev.filter(t => t.id !== selectedTerm.id));
    setAddModalOpen(false);
    toast.success(`Added keyword "${selectedTerm.queryText}"`);
  };

  const addNegative = (term: AsaSearchTerm) => {
    const newNeg: AsaNegativeKeyword = {
      id: `ank_${Date.now()}`, campaignId: term.campaignId, adGroupId: term.adGroupId,
      keywordText: term.queryText, matchType: 'EXACT', status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setNegatives([newNeg, ...negatives]);
    setSearchTerms(prev => prev.filter(t => t.id !== term.id));
    toast.warning(`Blocked keyword "${term.queryText}"`);
  };

  const kwColumns = [
    { title: 'Keyword', dataIndex: 'keywordText', key: 'keywordText', render: (t: string) => <span className="font-bold font-mono text-[var(--text-primary)]">{t}</span> },
    { title: 'Match', dataIndex: 'matchType', key: 'matchType', width: 100, render: (m: string) => <Tag color={m === 'EXACT' ? 'blue' : 'orange'} className="text-[10px] font-semibold">{m}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => <Tag color={s === 'ACTIVE' ? 'success' : 'default'}>{s}</Tag> },
    {
      title: 'Bid ($)', dataIndex: 'bid', key: 'bid', width: 140,
      render: (v: number, record: AsaKeyword) => editingId === record.id ? (
        <div className="flex items-center gap-1">
          <InputNumber size="small" min={0.01} step={0.1} value={editBidVal} onChange={val => setEditBidVal(val || 0.1)} className="w-20" />
          <Button size="small" type="primary" className="bg-[var(--status-success)] border-none w-6 h-6 p-0 flex items-center justify-center" icon={<Check size={12} />} onClick={() => saveBid(record.id)} />
          <Button size="small" type="text" danger className="w-6 h-6 p-0 flex items-center justify-center" icon={<X size={12} />} onClick={() => setEditingId(null)} />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setEditingId(record.id); setEditBidVal(record.bid); }}>
          <span className="font-semibold text-xs">${v.toFixed(2)}</span>
          <Edit size={11} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100" />
        </div>
      ),
    },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 80, render: (v: number) => v.toLocaleString() },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', width: 80, render: (v: number) => `$${v.toFixed(2)}` },
  ];

  const stColumns = [
    { title: 'Search Term', dataIndex: 'queryText', key: 'queryText', render: (t: string) => <span className="font-semibold">{t}</span> },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 80, render: (v: number) => v.toLocaleString() },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', width: 80, render: (v: number) => `$${v.toFixed(2)}` },
    {
      title: 'Actions', key: 'actions', width: 180,
      render: (_: unknown, record: AsaSearchTerm) => (
        <Space size="small">
          <Tooltip title="Add to Bid Keywords"><Button size="small" type="primary" className="bg-[var(--status-info)] border-none h-7" icon={<Star size={11} />} onClick={() => openAddKeywordFlow(record)}>Bid</Button></Tooltip>
          <Tooltip title="Add as Negative Keyword"><Button size="small" danger className="border-[var(--status-error-border)] text-[var(--status-error)] h-7" icon={<Ban size={11} />} onClick={() => addNegative(record)}>Block</Button></Tooltip>
        </Space>
      ),
    },
  ];

  const negColumns = [
    { title: 'Negative Keyword', dataIndex: 'keywordText', key: 'keywordText', render: (t: string) => <span className="font-bold text-[var(--status-error)] font-mono">{t}</span> },
    { title: 'Match', dataIndex: 'matchType', key: 'matchType', width: 100, render: (m: string) => <Tag color="red" className="text-[10px]">{m}</Tag> },
    { title: 'Added', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    { title: 'Action', key: 'action', width: 90, render: (_: unknown, record: AsaNegativeKeyword) => <Button size="small" type="text" danger onClick={() => setNegatives(prev => prev.filter(n => n.id !== record.id))}>Remove</Button> },
  ];

  return (
    <>
      {/* Keyword tabs rendered inline — exposed as insightsContent override via config if needed */}
      <div className="space-y-4 p-2">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Bid Keywords ({keywords.length})</div>
        <Table className="nms-table" columns={kwColumns} dataSource={keywords} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 700 }} size="small" />
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mt-4">Search Terms ({searchTerms.length})</div>
        <Table className="nms-table" columns={stColumns} dataSource={searchTerms} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 600 }} size="small" />
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mt-4">Negative Keywords ({negatives.length})</div>
        <Table className="nms-table" columns={negColumns} dataSource={negatives} rowKey="id" pagination={{ pageSize: 8 }} size="small" />
      </div>

      <Modal title="Add Bid Keyword" open={addModalOpen} onCancel={() => setAddModalOpen(false)} onOk={confirmAddKeyword} okText="Add Keyword" destroyOnClose>
        <div className="space-y-4 mt-3">
          <div className="font-bold text-[var(--text-primary)] font-mono bg-[var(--surface-subtle)] p-2 rounded-lg border border-[var(--border-subtle)]">{selectedTerm?.queryText}</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold mb-1">Bid ($)</div>
              <InputNumber className="w-full" min={0.01} step={0.1} value={targetBid} onChange={v => setTargetBid(v || 1.0)} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold mb-1">Match Type</div>
              <Select className="w-full" value={targetMatchType} onChange={(v) => setTargetMatchType(v as 'EXACT' | 'BROAD')} options={[{ value: 'EXACT', label: 'Exact Match' }, { value: 'BROAD', label: 'Broad Match' }]} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

import { AsaCreativeSetsTab } from '@/components/networks/asa/asa-creative-sets-tab';
import { AsaStorefrontTab } from '@/components/networks/asa/asa-storefront-tab';

// ─── ASA Workspace (thin plugin) ─────────────────────────────────────────────
export const AsaWorkspace: React.FC<{ network: string; networkLabel: string }> = ({ network }) => {
  const { appId } = useParams<{ appId?: string }>();
  const campaigns = mockCampaigns.filter(
    (c) => c.network === network && (!appId || c.projectId === appId)
  );

  const config = {
    ...NETWORK_CONFIGS['asa'],
    extraTabs: [
      {
        key: 'keyword-management',
        label: 'Keyword Management',
        children: <AsaKeywordTabs />,
      },
      {
        key: 'creative-sets',
        label: 'Creative Sets',
        children: <AsaCreativeSetsTab />,
      },
      {
        key: 'storefronts',
        label: 'Storefront Manager',
        children: <AsaStorefrontTab />,
      },
    ],
  };

  return (
    <NetworkWorkspaceShell
      config={config}
      campaigns={campaigns}
    />
  );
};

export default AsaWorkspace;
