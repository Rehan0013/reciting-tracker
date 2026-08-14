'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

interface MonthNavigatorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  daysData: any[]; // Aladhan calendar day array
}

export default function MonthNavigator({
  currentDate,
  onMonthChange,
  daysData,
}: MonthNavigatorProps) {
  const [showPopover, setShowPopover] = useState(false);

  const today = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onMonthChange(newDate);
  };

  // Format Gregorian Month Name
  const getGregorianLabel = () => {
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toLowerCase();
  };

  // Extract Hijri months and years represented in the current Gregorian month
  const getHijriLabel = () => {
    if (!daysData || daysData.length === 0) return 'loading Hijri calendar...';
    
    const months = new Set<string>();
    const years = new Set<string>();

    daysData.forEach((day) => {
      if (day.hijri?.month?.en) {
        months.add(day.hijri.month.en);
      }
      if (day.hijri?.year) {
        years.add(day.hijri.year);
      }
    });

    const monthNames = Array.from(months).join(' · ').toLowerCase();
    const yearNames = Array.from(years).join(' / ');
    return `${monthNames} ${yearNames} AH`;
  };

  // Summarize details for the info popover
  const getHijriDetails = () => {
    if (!daysData || daysData.length === 0) return null;

    const firstDay = daysData[0]?.hijri;
    const lastDay = daysData[daysData.length - 1]?.hijri;

    const holidays = daysData
      .filter((day) => day.hijri?.holidays && day.hijri.holidays.length > 0)
      .map((day) => ({
        gregDate: day.gregorian.date,
        hijriDate: day.hijri.date,
        holidayName: day.hijri.holidays.join(', '),
      }));

    return {
      start: `${firstDay?.day} ${firstDay?.month?.en} ${firstDay?.year}`,
      end: `${lastDay?.day} ${lastDay?.month?.en} ${lastDay?.year}`,
      holidays,
    };
  };

  const details = getHijriDetails();

  return (
    <div className="flex flex-col items-center select-none w-full bg-card border border-border p-4 rounded-card">
      <div className="flex items-center justify-between w-full">
        {/* Previous Month Button */}
        <button
          onClick={handlePrevMonth}
          className="w-11 h-11 border border-border bg-background hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Month Titles */}
        <div className="text-center flex flex-col items-center">
          <h2 className="font-serif font-bold text-2xl text-foreground capitalize tracking-wide">
            {getGregorianLabel()}
          </h2>
          <button
            onClick={() => daysData && daysData.length > 0 && setShowPopover(true)}
            className="text-xs text-muted-foreground hover:text-primary mt-1 font-semibold flex items-center gap-1 cursor-pointer focus:outline-none capitalize"
            title="Click for Islamic Month Details"
          >
            {getHijriLabel()}
            {daysData && daysData.length > 0 && <Info className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Next Month Button */}
        <button
          onClick={handleNextMonth}
          className="w-11 h-11 border border-border bg-background hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Move Today Button */}
      {!isCurrentMonth && (
        <button
          onClick={() => onMonthChange(new Date())}
          className="mt-3 text-xs font-bold text-primary hover:text-primary/85 transition-colors cursor-pointer focus:outline-none uppercase border border-border px-4 py-2 rounded-btn bg-background hover:bg-secondary min-h-[44px] flex items-center justify-center"
        >
          move today
        </button>
      )}

      {/* Hijri Month Details Modal (Custom Popover) */}
      {showPopover && details && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-none flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto"
          onClick={() => setShowPopover(false)}
        >
          <div
            className="w-full max-w-[380px] max-h-[85vh] bg-card border-2 border-border p-5 rounded-card relative flex flex-col select-text shadow-lg my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopover(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              aria-label="Close Islamic Calendar Span Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-xl text-foreground mb-4 pr-6 shrink-0">
              Islamic Calendar Span
            </h3>
            
            <div className="space-y-3 text-sm overflow-y-auto pr-1 flex-1 min-h-0">
              <div>
                <p className="text-xs text-muted-foreground">starts on</p>
                <p className="font-medium text-foreground">{details.start}</p>
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">ends on</p>
                <p className="font-medium text-foreground">{details.end}</p>
              </div>

              {details.holidays.length > 0 ? (
                <div className="border-t border-border pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Islamic Events / Holidays</p>
                  <ul className="space-y-1.5 mt-1">
                    {details.holidays.map((h, i) => (
                      <li key={i} className="p-2 border border-border bg-secondary text-foreground text-xs rounded-[2px]">
                        <span className="font-semibold text-primary block capitalize">{h.holidayName.toLowerCase()}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {h.gregDate} ({h.hijriDate})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border-t border-border pt-2">
                  <p className="text-xs text-muted-foreground">no holidays in this month span</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPopover(false)}
              className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-btn hover:bg-opacity-95 cursor-pointer mt-4 text-sm min-h-[40px] shrink-0"
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
