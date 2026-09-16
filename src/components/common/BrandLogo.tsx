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
  taglineText = 'FAMILY • HONEYMOON • PILGRIMAGE • INTERNATIONAL',
}) => {
  const [imgError, setImgError] = useState(false);

  const heightMap = {
    xs: 'h-10 sm:h-11',
    sm: 'h-13 sm:h-14',
    md: 'h-16 sm:h-18',
    lg: 'h-20 sm:h-24',
    xl: 'h-26 sm:h-32',
  };

  const textMap = {
    xs: 'text-2xl',
    sm: 'text-3xl',
    md: 'text-4xl sm:text-[44px]',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {!imgError ? (
        <img
          src="/logo-holidays-hunt.png"
          alt="Holidays Hunt"
          onError={() => setImgError(true)}
          className={`${heightMap[size]} w-auto object-contain select-none ${imageClassName}`}
        />
      ) : (
        <div className="inline-flex items-baseline select-none tracking-[-0.03em] font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
          <span className={`${textMap[size]} text-[#1A1A1A]`}>Holidays</span>
          <span className={`${textMap[size]} text-[#FF4B00] ml-1`}>Hunt</span>
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
