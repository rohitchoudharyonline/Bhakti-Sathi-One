import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef<boolean>(true);

  // Monitor window scroll to ensure we only trigger pull-to-refresh at the absolute top
  useEffect(() => {
    const handleScroll = () => {
      isAtTopRef.current = window.scrollY <= 1;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing || !isAtTopRef.current) return;
    startYRef.current = e.touches[0].clientY;
    setPullState('pulling');
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null || isRefreshing || !isAtTopRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only allow pulling downwards
    if (diff > 0) {
      // Apply a nice elastic damping resistance effect
      const dampedDistance = Math.min(Math.pow(diff, 0.8) * 0.75, 100);
      setPullDistance(dampedDistance);
      
      if (dampedDistance >= 60) {
        setPullState('ready');
      } else {
        setPullState('pulling');
      }
      
      // Prevent standard browser pull-down-to-reload if we are actively custom pulling
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      setPullDistance(0);
      setPullState('idle');
    }
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === null || isRefreshing) return;
    startYRef.current = null;

    if (pullDistance >= 60) {
      setIsRefreshing(true);
      setPullState('refreshing');
      // Set to active loading offset
      setPullDistance(55);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullState('idle');
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
      setPullState('idle');
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full"
      style={{ touchAction: isAtTopRef.current && pullDistance > 0 ? 'none' : 'auto' }}
    >
      {/* Animated Pull-to-Refresh Banner */}
      <div 
        className="absolute top-0 left-0 right-0 overflow-hidden flex items-center justify-center z-40 bg-stone-50/90 backdrop-blur-xs border-b border-stone-100"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / 50, 1) : 0,
          transition: isRefreshing ? 'height 0.2s ease-out' : 'none'
        }}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
          {pullState === 'refreshing' ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              <span className="text-xs font-bold text-stone-700 tracking-wide uppercase">
                Refreshing Yatra Guides...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: pullState === 'ready' ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ArrowDown className={`w-4 h-4 ${pullState === 'ready' ? 'text-orange-600' : 'text-stone-400'}`} />
              </motion.div>
              <span className="text-[11px] font-bold text-stone-500 tracking-wider uppercase">
                {pullState === 'ready' ? 'Release to Refresh' : 'Pull to Refresh'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <motion.div
        animate={{ y: pullDistance }}
        transition={isRefreshing ? { type: 'spring', stiffness: 200, damping: 25 } : { type: 'tween', duration: 0 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
