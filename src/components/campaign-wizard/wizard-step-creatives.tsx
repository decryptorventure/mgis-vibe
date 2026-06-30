import React from 'react';
import { Card, Checkbox, Tag, Upload } from '@/components/ui-kit-compat';
import { toast } from '@frontend-team/ui-kit';
import { UploadCloud, Image as ImageIcon, Video } from 'lucide-react';
import { mockMediaItems } from '@/shared/mock-data';
import type { MediaItem } from '@/shared/mock-data';

interface WizardStepCreativesProps {
  state: any;
  onChange: (updates: Record<string, any>) => void;
}

export const WizardStepCreatives: React.FC<WizardStepCreativesProps> = ({
  state,
  onChange,
}) => {
  const selectedMediaIds = state.selectedMediaIds || [];

  const handleSelect = (item: MediaItem) => {
    let next = [...selectedMediaIds];
    if (next.includes(item.id)) {
      next = next.filter(id => id !== item.id);
    } else {
      next.push(item.id);
    }
    onChange({ selectedMediaIds: next });
  };

  const handleUpload = () => {
    toast.success('Tải lên tệp tin quảng cáo thành công!');
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Upload.Dragger
        name="file"
        multiple
        customRequest={({ onSuccess }) => setTimeout(() => { handleUpload(); onSuccess?.("ok"); }, 800)}
        showUploadList={false}
        className="group border-2 border-dashed border-[var(--color-primary-300)] rounded-2xl bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] hover:border-[var(--color-primary-500)] transition-all p-8 text-center cursor-pointer shadow-inner"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg_primary rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
            <UploadCloud size={28} className="text-[var(--color-primary-500)]" />
          </div>
          <p className="text-sm font-extrabold text-[var(--color-primary-800)] mb-1">Kéo thả file ảnh / video hoặc click để tải lên</p>
          <p className="text-xs text-[var(--color-primary-600)] font-medium">Hỗ trợ định dạng tiêu chuẩn cho Google Ads, Meta, ASA, Axon, Moloco</p>
        </div>
      </Upload.Dragger>

      {/* Media Gallery */}
      <div>
        <div className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Media Library ({mockMediaItems.length})</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mockMediaItems.map((item) => {
            const isSelected = selectedMediaIds.includes(item.id);
            return (
              <Card
                key={item.id}
                hoverable
                onClick={() => handleSelect(item)}
                className={`cursor-pointer transition-all border rounded-xl overflow-hidden ${isSelected ? 'border-primary-500 bg-primary-50/10' : 'border-[var(--border-default)]'}`}
                styles={{ body: { padding: '10px' } }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2.5 overflow-hidden">
                    <div className="w-10 h-10 bg-[var(--surface-muted)] rounded-lg flex items-center justify-center flex-shrink-0 text-[var(--text-tertiary)]">
                      {item.type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</div>
                      <div className="text-[9px] text-[var(--text-tertiary)]">{item.dimensions} • {item.size}</div>
                      <div className="mt-1 flex gap-1">
                        <Tag color="cyan" className="text-[8px] font-semibold px-1 py-0 border-0 leading-normal rounded">
                          {item.network.toUpperCase()}
                        </Tag>
                        <Tag color={item.status === 'READY' ? 'success' : 'warning'} className="text-[8px] font-semibold px-1 py-0 border-0 leading-normal rounded">
                          {item.status}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  <Checkbox checked={isSelected} style={{ pointerEvents: 'none' }} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default WizardStepCreatives;
