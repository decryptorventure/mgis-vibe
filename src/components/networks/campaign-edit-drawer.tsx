// ─── CampaignEditDrawer — slide-in 50% drawer for editing campaign fields ────
// Keeps the campaign table visible alongside the form (context preserved).
import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Select } from '@/components/ui-kit-compat';
import { Button, toast } from '@frontend-team/ui-kit';
import { Pencil } from 'lucide-react';
import { StatusBadge, statusToVariant } from '@/components/ui/StatusBadge';
import type { Campaign } from '@/shared/mock-data';

interface CampaignEditDrawerProps {
  campaign: Campaign | null;
  networkKey: string;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Campaign>) => void;
}

// Network-specific extra fields rendered below the common fields
const NetworkExtraFields: React.FC<{ networkKey: string }> = ({ networkKey }) => {
  if (networkKey === 'google-ads') {
    return (
      <Form.Item name="targetCpa" label="Target CPA ($)">
        <InputNumber min={0} className="w-full" prefix="$" />
      </Form.Item>
    );
  }
  if (networkKey === 'meta') {
    return (
      <Form.Item name="optimizationGoal" label="Optimization Goal">
        <Select options={[
          { value: 'APP_INSTALLS', label: 'App Installs' },
          { value: 'CONVERSIONS', label: 'Conversions' },
          { value: 'LINK_CLICKS', label: 'Link Clicks' },
        ]} />
      </Form.Item>
    );
  }
  if (networkKey === 'asa') {
    return (
      <Form.Item name="dailyBudgetCap" label="Daily Budget Cap ($)">
        <InputNumber min={0} className="w-full" prefix="$" />
      </Form.Item>
    );
  }
  return null;
};

export const CampaignEditDrawer: React.FC<CampaignEditDrawerProps> = ({
  campaign,
  networkKey,
  open,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (campaign) form.setFieldsValue(campaign);
  }, [campaign, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave(campaign!.id, values);
      toast.success('Campaign updated');
      onClose();
    });
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Pencil size={15} className="text_secondary" />
          <span className="font-bold text-sm text_primary truncate max-w-[260px]">
            {campaign?.name ?? 'Edit Campaign'}
          </span>
          {campaign && (
            <StatusBadge label={campaign.status} variant={statusToVariant(campaign.status)} />
          )}
        </div>
      }
      placement="right"
      // 50% on desktop; Ant Design falls back to 100% on mobile
      width="50%"
      styles={{ body: { padding: '20px' }, header: { padding: '16px 20px' } }}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 py-1">
          <Button variant="border" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" onClick={handleSave}>Save Changes</Button>
        </div>
      }
    >
      {campaign && (
        <Form form={form} layout="vertical" size="small">
          <Form.Item name="name" label="Campaign Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAUSED', label: 'Paused' },
            ]} />
          </Form.Item>
          <Form.Item
            name="budget"
            label="Budget ($)"
            rules={[{ type: 'number', min: 1, message: 'Budget must be at least $1' }]}
          >
            <InputNumber min={1} className="w-full" prefix="$" />
          </Form.Item>
          <NetworkExtraFields networkKey={networkKey} />
        </Form>
      )}
    </Drawer>
  );
};

export default CampaignEditDrawer;
