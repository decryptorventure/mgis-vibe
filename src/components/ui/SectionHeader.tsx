import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between gap-2 px-1">
    <div className="flex items-center gap-2">
      <span className="fg_accent_primary">{icon}</span>
      <h2 className="body_s font-bold text_primary m-0">{title}</h2>
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default SectionHeader;
