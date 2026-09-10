import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
  taglineText?: string;
  withIcon?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  imageClassName = '',
  showTagline = false,
  taglineText = 'SACRED PILGRIMAGE & YATRA',
}) => {
  const [imgError, setImgError] = useState(false);

  const heightMap = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const textMap = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl sm:text-[26px]',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {!imgError ? (
        <img
          src="/logo-bhakti-sathi.png"
          alt="Bhakti Sathi"
          onError={() => setImgError(true)}
          className={`${heightMap[size]} w-auto object-contain select-none ${imageClassName}`}
        />
      ) : (
        <div className="inline-flex items-baseline select-none tracking-[-0.03em] font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
          <span className={`${textMap[size]} text-[#1A1A1A]`}>Bhakti</span>
          <span className={`${textMap[size]} text-[#FF4B00] ml-1`}>Sathi</span>
        </div>
      )}
      {showTagline && (
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#1A1A1A]/60 mt-0.5">
          {taglineText}
        </span>
      )}
    </div>
  );
};
