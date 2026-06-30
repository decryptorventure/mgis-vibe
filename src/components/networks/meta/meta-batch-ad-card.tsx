// meta-batch-ad-card.tsx — Facebook Feed-style ad preview card (static mockup)
import React from 'react';
import { FileImage, Film, Play } from 'lucide-react';
import type { MediaFile } from './meta-media-library-modal';
import type { BatchAdCopy } from './meta-batch-types';

interface Props {
  mediaFile: MediaFile;
  adCopy: BatchAdCopy;
  account: { id: string; name: string };
}

const CTA_LABELS: Record<string, string> = {
  DOWNLOAD: 'Download', INSTALL_NOW: 'Install Now', LEARN_MORE: 'Learn More',
  SHOP_NOW: 'Shop Now', SIGN_UP: 'Sign Up', GET_QUOTE: 'Get Quote',
  BOOK_NOW: 'Book Now', APPLY_NOW: 'Apply Now',
};

export const BatchAdCard: React.FC<Props> = ({ mediaFile, adCopy, account }) => (
  <div className="w-[176px] shrink-0 border border_primary radius_8 bg_primary overflow-hidden">
    {/* Advertiser header */}
    <div className="flex items-center gap-2 px-2.5 py-2">
      <div className="w-6 h-6 radius_round bg_info flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold fg_info">{account.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold text_primary truncate">{account.name}</div>
        <div className="text-[9px] text_tertiary">Sponsored</div>
      </div>
    </div>

    {/* Primary text */}
    {adCopy.primaryText && (
      <div className="px-2.5 pb-1.5 text-[10px] text_primary leading-[1.4]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {adCopy.primaryText}
      </div>
    )}

    {/* Media placeholder — square aspect ratio */}
    <div className="bg_secondary relative flex flex-col items-center justify-center py-5 gap-1.5" style={{ aspectRatio: '1' }}>
      {mediaFile.type === 'video'
        ? <Film size={18} className="fg_info" />
        : <FileImage size={18} className="text_secondary" />}
      <span className="text-[9px] text_secondary text-center px-3 leading-tight line-clamp-2">{mediaFile.name}</span>
      {mediaFile.duration !== undefined && (
        <span className="text-[9px] text_tertiary">{mediaFile.duration}s</span>
      )}
      {mediaFile.type === 'video' && (
        <div className="absolute bottom-1.5 right-1.5 w-5 h-5 radius_round bg-black/40 flex items-center justify-center">
          <Play size={7} className="text-white fill-white ml-[1px]" />
        </div>
      )}
    </div>

    {/* Headline + CTA bar */}
    <div className="px-2.5 py-2 flex items-center justify-between gap-1.5 border-t border_primary">
      <span className="text-[10px] font-semibold text_primary truncate flex-1 min-w-0">
        {adCopy.headline
          ? adCopy.headline
          : <span className="text_tertiary font-normal italic">Headline</span>}
      </span>
      <span className="text-[10px] font-semibold fg_info shrink-0 border border_accent_secondary radius_8 px-1.5 py-0.5 whitespace-nowrap">
        {CTA_LABELS[adCopy.cta] ?? adCopy.cta.replace(/_/g, ' ')}
      </span>
    </div>
  </div>
);
