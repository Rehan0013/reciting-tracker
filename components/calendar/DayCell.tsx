'use client';

import { Moon } from 'lucide-react';

interface DayCellProps {
  gregorianDate?: Date;
  hijriDay?: number;
  hasLog?: boolean;
  isComplete?: boolean;
  isToday?: boolean;
  isHoliday?: boolean;
  isFriday?: boolean;
  onClick?: () => void;
}

export default function DayCell({
  gregorianDate,
  hijriDay,
  hasLog = false,
  isComplete = false,
  isToday = false,
  isHoliday = false,
  isFriday = false,
  onClick,
}: DayCellProps) {
  // Render empty cell for month-grid alignment padding
  if (!gregorianDate) {
    return (
      <div className="h-[52px] md:h-[60px] border border-transparent bg-transparent" />
    );
  }

  const dayNumber = gregorianDate.getDate();

  const getCellClasses = () => {
    let classes = 'h-[52px] md:h-[60px] w-full relative flex flex-col justify-between p-1.5 select-none focus:outline-none transition-colors duration-100 cursor-pointer min-h-[44px] ';
    
    // Border style
    if (isToday) {
      classes += 'border-2 border-accent ';
    } else if (isComplete) {
      classes += 'border border-primary/30 ';
    } else if (isHoliday) {
      classes += 'border border-holiday/40 ';
    } else {
      classes += 'border border-border ';
    }

    // Background style
    if (isComplete) {
      classes += 'bg-primary/15 hover:bg-primary/25 ';
    } else if (isHoliday) {
      classes += 'bg-secondary/60 hover:bg-secondary ';
    } else if (isToday) {
      classes += 'bg-accent/10 hover:bg-accent/20 ';
    } else {
      classes += 'bg-card hover:bg-secondary ';
    }

    return classes;
  };

  return (
    <button
      onClick={onClick}
      className={getCellClasses()}
    >
      {/* Top Row: Gregorian Day & Holiday Indicator */}
      <div className="flex justify-between items-start w-full leading-none">
        <span className={`font-serif font-bold text-sm ${isToday ? 'text-accent' : 'text-foreground'}`}>
          {dayNumber}
        </span>
        {isHoliday && (
          <Moon className="w-2.5 h-2.5 fill-holiday text-holiday shrink-0 mt-0.5" />
        )}
      </div>

      {/* Middle/Bottom Row: Friday label & Hijri day */}
      <div className="flex justify-between items-end w-full leading-none mt-1">
        {isFriday ? (
          <span className="text-[8px] font-bold text-primary tracking-tighter capitalize">
            jumu'ah
          </span>
        ) : (
          <span className="text-[8px] text-transparent">.</span>
        )}
        
        {hijriDay !== undefined && (
          <span className="text-[9px] font-medium text-muted-foreground">
            {hijriDay}
          </span>
        )}
      </div>

      {/* Center Log Presence Dot Indicator */}
      {hasLog && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
      )}
    </button>
  );
}
