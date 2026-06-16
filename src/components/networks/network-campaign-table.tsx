// ─── NetworkCampaignTable — shared campaign table with configurable columns ───
import React, { useState, useMemo } from 'react';
import { Tag, Button, Drawer, Statistic, Row, Col, Descriptions, Popover, InputNumber } from 'antd';
import { toast } from '@frontend-team/ui-kit';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Play, Pause, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import { DataTable } from '@/components/ui/DataTable';
import type { NetworkConfig } from '@/shared/network-config';
import type { Campaign } from '@/shared/mock-data';

interface NetworkCampaignTableProps {
  config: NetworkConfig;
  campaigns: Campaign[];
  /** Optional expandable row config (e.g. Meta AdSet hierarchy) */
  expandable?: object;
}

export const NetworkCampaignTable: React.FC<NetworkCampaignTableProps> = ({
  config,
  campaigns,
  expandable,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkBudgetVal, setBulkBudgetVal] = useState<number>(10);
  const [budgetPopoverOpen, setBudgetPopoverOpen] = useState(false);

  const openDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  };

  const handleBulkStatus = (status: 'ACTIVE' | 'PAUSED') => {
    toast.success(`Updated ${selectedRowKeys.length} campaigns to ${status === 'ACTIVE' ? 'Active' : 'Paused'}`);
    setSelectedRowKeys([]);
  };

  const handleBulkBudget = (dir: 'up' | 'down') => {
    toast.success(`${dir === 'up' ? 'Increased' : 'Decreased'} budget by ${bulkBudgetVal}% for ${selectedRowKeys.length} campaigns`);
    setSelectedRowKeys([]);
    setBudgetPopoverOpen(false);
  };

  const baseColumns = useMemo<ColumnsType<Campaign>>(() => [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <button
          onClick={() => openDetail(record)}
          className="text-primary-600 font-medium hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <StatusBadge label={s} variant={statusToVariant(s)} />,
    },
    { title: 'Budget', dataIndex: 'budget', key: 'budget', width: 100, render: (v: number) => `$${v.toLocaleString()}` },
    { title: 'Spend', dataIndex: 'spend', key: 'spend', width: 100, render: (v: number) => `$${v.toLocaleString()}` },
    { title: 'Impressions', dataIndex: 'impressions', key: 'impressions', width: 120, render: (v: number) => v.toLocaleString() },
    { title: 'Clicks', dataIndex: 'clicks', key: 'clicks', width: 90, render: (v: number) => v.toLocaleString() },
    { title: 'Installs', dataIndex: 'installs', key: 'installs', width: 90, render: (v: number) => v.toLocaleString() },
    { title: 'CPA', dataIndex: 'cpa', key: 'cpa', width: 80, render: (v: number) => `$${v.toFixed(2)}` },
    { title: 'ROAS', dataIndex: 'roas', key: 'roas', width: 80, render: (v: number) => `${v.toFixed(1)}x` },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: Campaign) => (
        <div className="flex gap-1">
          {record.status === 'ACTIVE' ? (
            <Button size="small" icon={<Pause size={12} />} onClick={() => toast.info(`Pausing ${record.name}`)} />
          ) : (
            <Button size="small" type="primary" icon={<Play size={12} />} onClick={() => toast.info(`Resuming ${record.name}`)} />
          )}
        </div>
      ),
    },
  ], []);

  const allColumns = useMemo<ColumnsType<Campaign>>(() => {
    const actionIdx = baseColumns.findIndex(c => c.key === 'actions');
    const before = baseColumns.slice(0, actionIdx);
    const after = baseColumns.slice(actionIdx);
    return [...before, ...config.extraColumns, ...after] as ColumnsType<Campaign>;
  }, [baseColumns, config.extraColumns]);

  return (
    <>
      <DataTable<Campaign>
        panel
        columns={allColumns}
        dataSource={campaigns}
        rowKey="id"
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        expandable={expandable as TableProps<Campaign>['expandable']}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} campaigns` }}
        scroll={{ x: 1100 }}
        emptyTitle="No campaigns"
        emptyDescription="No campaigns match the current workspace filters."
      />

      {/* Floating bulk action bar */}
      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--surface-base)] text-[var(--text-primary)] border border-[var(--border-default)] px-6 py-3.5 rounded-full z-50 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-float)' }}>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{selectedRowKeys.length} selected</span>
          <div className="w-px h-5 bg-[var(--border-default)]" />
          <Button size="small" type="primary" className="bg-[var(--status-success)] border-none h-8" icon={<Play size={12} />} onClick={() => handleBulkStatus('ACTIVE')}>Resume</Button>
          <Button size="small" className="h-8" icon={<Pause size={12} />} onClick={() => handleBulkStatus('PAUSED')}>Pause</Button>
          <Popover
            open={budgetPopoverOpen}
            onOpenChange={setBudgetPopoverOpen}
            trigger="click"
            placement="top"
            content={
              <div className="p-3 space-y-3 w-56">
                <div className="font-semibold text-xs">Adjust daily budget</div>
                <div className="flex items-center gap-2">
                  <InputNumber className="w-20" min={1} max={100} value={bulkBudgetVal} onChange={v => setBulkBudgetVal(v || 10)} formatter={v => `${v}%`} parser={v => Number(v?.replace('%', '') || 10)} />
                  <Button size="small" type="primary" className="bg-[var(--status-success)] border-none" icon={<ArrowUp size={12} />} onClick={() => handleBulkBudget('up')}>Up</Button>
                  <Button size="small" danger icon={<ArrowDown size={12} />} onClick={() => handleBulkBudget('down')}>Down</Button>
                </div>
              </div>
            }
          >
            <Button size="small" className="h-8" icon={<Settings size={12} />}>Budget</Button>
          </Popover>
          <button onClick={() => setSelectedRowKeys([])} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-transparent border-0 cursor-pointer underline">Cancel</button>
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer title={selectedCampaign?.name} width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <StatusBadge label={selectedCampaign.status} variant={statusToVariant(selectedCampaign.status)} />
              <Tag bordered={false} style={{ color: config.color }}>{config.label}</Tag>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}><Statistic title="Budget" value={selectedCampaign.budget} prefix="$" /></Col>
              <Col span={12}><Statistic title="Spend" value={selectedCampaign.spend} prefix="$" /></Col>
              <Col span={12}><Statistic title="Impressions" value={selectedCampaign.impressions} /></Col>
              <Col span={12}><Statistic title="Clicks" value={selectedCampaign.clicks} /></Col>
              <Col span={12}><Statistic title="Installs" value={selectedCampaign.installs} /></Col>
              <Col span={12}><Statistic title="CPA" value={selectedCampaign.cpa} prefix="$" precision={2} /></Col>
              <Col span={12}><Statistic title="ROAS" value={selectedCampaign.roas} suffix="x" precision={1} /></Col>
            </Row>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Created">{selectedCampaign.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{selectedCampaign.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="Campaign ID">{selectedCampaign.id}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default NetworkCampaignTable;
