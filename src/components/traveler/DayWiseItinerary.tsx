import React, { useState } from 'react';
import { ItineraryDay } from '../../types/tour';
import {
  CalendarDays,
  Utensils,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DayWiseItineraryProps {
  itinerary: ItineraryDay[];
  packageTitle: string;
  className?: string;
}

export const DayWiseItinerary: React.FC<DayWiseItineraryProps> = ({
  itinerary,
  packageTitle,
  className = '',
}) => {
  // Which days are expanded (Day 1 expanded by default)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (itinerary && itinerary.length > 0) {
      initial[itinerary[0].id] = true;
    }
    return initial;
  });

  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  const toggleDay = (id: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    itinerary.forEach((d) => (all[d.id] = true));
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  const allExpanded = itinerary.every((d) => expandedDays[d.id]);

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden w-full max-w-full min-w-0 ${className}`}>
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-100 bg-stone-50/50 flex flex-row items-center justify-between gap-2.5 min-w-0 w-full">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#9b0000] shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold text-stone-900 uppercase tracking-wider">
            DAY BY DAY ITINERARY
          </span>
        </div>

        {/* Expand / Collapse All Days Button */}
        <button
          type="button"
          onClick={allExpanded ? collapseAll : expandAll}
          className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-[#1D1C1C] transition cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 text-[#9b0000]" />
          <span>{allExpanded ? 'Collapse All' : 'Expand All Days'}</span>
        </button>
      </div>

      {/* All Days Timeline View */}
      <div className="p-3.5 sm:p-5 space-y-6">
        <div className="space-y-6">
          {itinerary.map((day, index) => {
            const isOpen = !!expandedDays[day.id];
            const isDay2Onwards = index >= 1;

            return (
              <div key={day.id || index} className="space-y-2">
                {/* Day Badge Row above the card (to start itinerary from the left for maximum width) */}
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className="inline-flex items-center gap-1.5 cursor-pointer group/badge select-none"
                  title={`Toggle Day ${day.dayNumber}`}
                >
                  <span className="text-[10px] font-black uppercase text-[#9b0000] tracking-widest leading-none">
                    DAY
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-2xs transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#9b0000] text-white ring-4 ring-[#9b0000]/20 scale-105'
                        : 'bg-[#9b0000] text-white hover:bg-[#7D0000]'
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                </button>

                {/* Day Card */}
                <div
                  className={`w-full rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-stone-300 bg-white shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none group/btn"
                  >
                    <div className="min-w-0 flex-1">
                      {/* First Line: Main Title (e.g., Arrival in Srinagar..., Kolkata - Bhubaneshwar) */}
                      <h3 className="text-sm sm:text-base font-extrabold text-[#1D1C1C] leading-snug group-hover/btn:text-[#9b0000] transition-colors">
                        {day.title || day.location}
                      </h3>
                    </div>

                    {/* Right Circular Chevron Button */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${
                        isOpen
                          ? 'bg-stone-100 text-stone-800'
                          : 'bg-stone-100/80 text-stone-600 group-hover/btn:bg-stone-200'
                      }`}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Motion Animated Expandable Content for Open State */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: isDay2Onwards ? 0.35 : 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-stone-100 bg-white space-y-3.5">
                          {/* Description */}
                          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                            {day.description}
                          </p>

                          {/* Footer: Meals */}
                          {day.meals && day.meals.length > 0 && (
                            <div className="pt-2.5 border-t border-stone-100 text-xs w-full space-y-2.5">
                              <div className="flex items-start gap-1.5 text-stone-700 w-full">
                                <Utensils className="w-3.5 h-3.5 text-[#9b0000] shrink-0 mt-0.5" />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-bold text-stone-900">Meal:</span>
                                  <span className="text-stone-700 font-medium leading-relaxed">{day.meals.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
