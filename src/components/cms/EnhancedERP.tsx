import React from 'react';
import { CMSDashboard } from './CMSDashboard';
import { CmsAccessGate } from './CmsAccessGate';

export const EnhancedERP: React.FC = () => {
  return (
    <CmsAccessGate>
      <div className="relative">
        <CMSDashboard />
      </div>
    </CmsAccessGate>
  );
};
