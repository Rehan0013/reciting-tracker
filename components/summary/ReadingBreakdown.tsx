'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BreakdownItem {
  _id: {
    type: string;
    name: string;
  };
  totalCount: number;
  nameArabic?: string;
}

interface ReadingBreakdownProps {
  breakdown: BreakdownItem[];
}

export default function ReadingBreakdown({ breakdown }: ReadingBreakdownProps) {
  const [showAll, setShowAll] = useState(false);

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground select-none">
        no entries recorded in this period.
      </div>
    );
  }

  const visibleItems = showAll ? breakdown : breakdown.slice(0, 5);
  const hasMore = breakdown.length > 5;

  return (
    <div className="w-full space-y-3.5 select-none">
      <ul className="space-y-2.5">
        {visibleItems.map((item, index) => {
          const type = item._id.type;
          const name = item._id.name;
          const count = item.totalCount;
          const nameArabic = item.nameArabic;

          return (
            <li key={index} className="flex items-end justify-between text-sm">
              {/* Type and Name */}
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase border border-border px-1 py-0.5 rounded-[2px] shrink-0 font-sans">
                  {type.toLowerCase()}
                </span>
                <span className="capitalize text-foreground font-semibold truncate">
                  {name.toLowerCase()}
                </span>
                {nameArabic && (
                  <span className="font-arabic text-primary font-bold text-xs shrink-0">
                    ({nameArabic})
                  </span>
                )}
              </span>

              {/* Dotted Leader Line */}
              <span className="flex-1 border-b border-dotted border-border mx-2 mb-1 shrink min-w-[12px]" />

              {/* Count */}
              <span className="font-serif font-bold text-foreground shrink-0">
                × {count}
              </span>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-primary border border-border bg-card hover:bg-secondary rounded-btn cursor-pointer focus:outline-none min-h-[40px] capitalize transition-colors duration-100"
        >
          {showAll ? (
            <>
              show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              show all ({breakdown.length}) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
