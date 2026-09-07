import React from 'react';
import simpleTempleSketch from '../../assets/images/simple_temple_sketch.png';

interface PencilTempleIllustrationProps {
  className?: string;
}

export const PencilTempleIllustration: React.FC<PencilTempleIllustrationProps> = ({ className = '' }) => {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Background Temple Pencil Sketch Illustration */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-end pr-2 sm:pr-8 md:pr-16 lg:pr-28 pointer-events-none">
        <img
          src={simpleTempleSketch}
          alt="Simple Temple Pencil Sketch Illustration"
          className="max-h-[75%] sm:max-h-[85%] w-auto max-w-[42%] sm:max-w-[38%] md:max-w-[30%] object-contain opacity-15 sm:opacity-20 select-none mix-blend-multiply transition-opacity"
        />
      </div>
      {/* Soft gradient fading into hero content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFFDF9]/80 pointer-events-none" />
    </div>
  );
};
