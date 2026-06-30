// Bulk Create Ads modal — create multiple ads from media library with shared copy fields
import React, { useState } from 'react';
import { Modal, Select } from '@/components/ui-kit-compat';
import { Button, cn } from '@frontend-team/ui-kit';
import { FileImage, Film, FolderOpen, Plus, X } from 'lucide-react';
import { MediaLibraryModal, type MediaFile } from './meta-media-library-modal';
import { ThumbnailExtractorModal, type VideoWithThumb } from './meta-thumbnail-extractor-modal';
import { TextFieldList, FB_PAGE_OPTIONS, CTA_OPTIONS } from './meta-bulk-create-ads-fields';

interface MediaItem { file: MediaFile; thumbTime?: number }

interface Props {
  open: boolean; adsetId: string; adsetName: string;
  onClose: () => void; onCreate: (adsetId: string, count: number) => void;
}

export const BulkCreateAdsModal: React.FC<Props> = ({ open, adsetId, onClose, onCreate }) => {
  const [fbMode, setFbMode] = useState<'list' | 'manual'>('list');
  const [fbPage, setFbPage] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [primaryTexts, setPrimaryTexts] = useState<string[]>([]);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [cta, setCta] = useState('download');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);
  const [pendingVideos, setPendingVideos] = useState<MediaFile[]>([]);

  const handleLibraryConfirm = (files: MediaFile[]) => {
    setShowLibrary(false);
    const videos = files.filter(f => f.type === 'video');
    const images = files.filter(f => f.type === 'image');
    setMedia(prev => [...prev, ...images.map(f => ({ file: f }))]);
    if (videos.length > 0) { setPendingVideos(videos); setShowExtractor(true); }
  };

  const handleExtractorConfirm = (items: VideoWithThumb[]) => {
    setShowExtractor(false);
    setMedia(prev => [...prev, ...items.map(({ file, thumbTime }) => ({ file, thumbTime }))]);
    setPendingVideos([]);
  };

  const removeMedia = (id: string) => setMedia(prev => prev.filter(m => m.file.id !== id));

  const handleClose = () => {
    setMedia([]); setPrimaryTexts([]); setHeadlines([]); setDescriptions([]);
    setFbPage(''); setFbMode('list'); onClose();
  };

  const handleCreate = () => {
    onCreate(adsetId, Math.max(media.length, 1));
    handleClose();
  };

  return (
    <>
      <Modal open={open} onCancel={handleClose} title={null} width={700} footer={null}
        styles={{ body: { padding: 0 } }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border_primary">
          <div className="w-9 h-9 radius_8 bg_info flex items-center justify-center">
            <Film size={18} className="fg_info" />
          </div>
          <div>
            <div className="body_s font-bold text_primary">Bulk Create Ads</div>
            <div className="text-[11px] text_tertiary">Create multiple ads at once from your media library</div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close dialog"
            className="ml-auto text_tertiary hover:text_primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[66vh] space-y-5">
          {/* Facebook Page */}
          <div>
            <div className="text-xs font-semibold text_secondary mb-2">
              Facebook Page <span className="fg_error">*</span>
            </div>
            <div className="flex gap-4 mb-2">
              {(['list', 'manual'] as const).map(m => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name={`fb-mode-${adsetId}`} checked={fbMode === m}
                    onChange={() => setFbMode(m)} className="w-3.5 h-3.5 accent-[var(--status-info)]" />
                  <span className="text-xs text_secondary">{m === 'list' ? 'Select from list' : 'Enter manually'}</span>
                </label>
              ))}
            </div>
            {fbMode === 'list'
              ? <Select placeholder="Select a Facebook Page" value={fbPage || undefined}
                  onChange={v => setFbPage(v as string)} options={FB_PAGE_OPTIONS} />
              : <input value={fbPage} onChange={e => setFbPage(e.target.value)}
                  placeholder="Enter Facebook Page ID or URL"
                  className="w-full border border_primary radius_8 px-3 py-1.5 text-xs text_primary bg_primary outline-none placeholder:text_tertiary focus:border_accent_secondary" />
            }
          </div>

          {/* Media */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text_secondary">
                Media <span className="fg_error">*</span>
                <span className="font-normal text_tertiary ml-1">{media.length}</span>
              </span>
              <Button type="button" variant="border" size="s" className="gap-1.5" onClick={() => setShowLibrary(true)}>
                <FolderOpen size={12} />Media Library
              </Button>
            </div>
            {media.length === 0 ? (
              <button type="button" onClick={() => setShowLibrary(true)}
                className="w-full border-2 border-dashed border_secondary radius_8 py-8 flex flex-col items-center gap-2 hover:border_primary transition-colors">
                <FolderOpen size={24} className="text_tertiary" />
                <span className="text-xs text_tertiary">Click to open Media Library</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {media.map(m => (
                  <div key={m.file.id}
                    className={cn('flex items-center gap-1.5 border border_primary radius_8 px-2 py-1.5 bg_secondary')}>
                    {m.file.type === 'video'
                      ? <Film size={11} className="text_tertiary shrink-0" />
                      : <FileImage size={11} className="text_tertiary shrink-0" />}
                    <span className="text-[11px] text_primary max-w-[160px] truncate">{m.file.name}</span>
                    {m.thumbTime !== undefined && (
                      <span className="text-[10px] fg_info shrink-0">@{m.thumbTime.toFixed(1)}s</span>
                    )}
                    <button type="button" onClick={() => removeMedia(m.file.id)}
                      aria-label={`Remove ${m.file.name}`} className="text_tertiary hover:fg_error transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setShowLibrary(true)}
                  className="border border-dashed border_secondary radius_8 px-3 py-1.5 text-xs text_tertiary hover:border_primary flex items-center gap-1 transition-colors">
                  <Plus size={11} />Add more
                </button>
              </div>
            )}
            <div className="text-[10px] text_tertiary mt-1.5">Each media file will create a separate ad</div>
          </div>

          <TextFieldList label="Primary Texts" required max={5} values={primaryTexts} onChange={setPrimaryTexts} />
          <TextFieldList label="Headlines" required max={5} values={headlines} onChange={setHeadlines} />
          <TextFieldList label="Descriptions" max={5} values={descriptions} onChange={setDescriptions} />

          {/* CTA */}
          <div>
            <div className="text-xs font-semibold text_secondary mb-1.5">
              Call to Action <span className="fg_error">*</span>
            </div>
            <Select value={cta} onChange={v => setCta(v as string)} options={CTA_OPTIONS} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border_primary">
          <Button type="button" variant="border" size="m" onClick={handleClose}>Cancel</Button>
          <Button type="button" variant="primary" size="m"
            disabled={!fbPage || media.length === 0} onClick={handleCreate}>
            Create Ads
          </Button>
        </div>
      </Modal>

      <MediaLibraryModal open={showLibrary} onClose={() => setShowLibrary(false)} onConfirm={handleLibraryConfirm} />
      <ThumbnailExtractorModal open={showExtractor} videos={pendingVideos}
        onClose={() => { setShowExtractor(false); setPendingVideos([]); }}
        onConfirm={handleExtractorConfirm} />
    </>
  );
};
