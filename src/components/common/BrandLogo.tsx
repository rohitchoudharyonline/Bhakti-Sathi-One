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
    xs: 'h-8 sm:h-9',
    sm: 'h-10 sm:h-11',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-24',
  };

  const textMap = {
    xs: 'text-xl',
    sm: 'text-2xl',
    md: 'text-3xl sm:text-[36px]',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
  };

  return (
    <div className={`inline-flex flex-col justify-center ${className}`}>
      {!imgError ? (
        <img
          src="/logo-holidays-hunt.png?v=2"
          alt="Holidays Hunt"
          onError={() => setImgError(true)}
          className={`${heightMap[size]} w-auto object-contain select-none ${imageClassName}`}
        />
      ) : (
        <div className="inline-flex items-center gap-2 select-none">
          <img
            src="/icon-holidays-hunt.png?v=2"
            alt="Holidays Hunt"
            className="w-8 h-8 rounded-xl object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="inline-flex items-baseline tracking-[-0.03em] font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
            <span className={`${textMap[size]} text-[#1A1A1A]`}>Holidays</span>
            <span className={`${textMap[size]} text-[#FF4B00] ml-1`}>Hunt</span>
          </div>
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
