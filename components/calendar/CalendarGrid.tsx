'use client';

import DayCell from './DayCell';

interface CalendarGridProps {
  currentDate: Date;
  daysData: any[]; // Aladhan calendar day array
  userLogs: Record<string, { hasLog: boolean; isComplete: boolean }>; // date string -> log status
  onDaySelect: (dateStr: string) => void;
  todayStr: string; // "YYYY-MM-DD"
}

const WEEKDAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

export default function CalendarGrid({
  currentDate,
  daysData,
  userLogs,
  onDaySelect,
  todayStr,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Find the weekday of the 1st of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Total days in the month (from Aladhan data size or JS)
  const totalDays = daysData.length || new Date(year, month + 1, 0).getDate();

  // Helper to construct "YYYY-MM-DD" in local timezone format
  const getFormattedDateStr = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Generate cells array
  const gridCells = [];

  // 1. Add start padding cells
  for (let i = 0; i < startDayOfWeek; i++) {
    gridCells.push({ key: `pad-start-${i}`, isEmpty: true });
  }

  // 2. Add day cells
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = getFormattedDateStr(d);
    const dayDate = new Date(year, month, d);
    
    // Aladhan API matching day item (1-indexed matching)
    const aladhanDay = daysData[d - 1];

    const hasLog = userLogs[dateStr]?.hasLog || false;
    const isComplete = userLogs[dateStr]?.isComplete || false;
    const isToday = dateStr === todayStr;
    const isHoliday = aladhanDay?.hijri?.holidays && aladhanDay.hijri.holidays.length > 0;
    const isFriday = dayDate.getDay() === 5;
    const hijriDayNumber = aladhanDay?.hijri?.day ? Number(aladhanDay.hijri.day) : undefined;

    gridCells.push({
      key: `day-${d}`,
      isEmpty: false,
      gregorianDate: dayDate,
      hijriDay: hijriDayNumber,
      hasLog,
      isComplete,
      isToday,
      isHoliday,
      isFriday,
      dateStr,
    });
  }

  return (
    <div className="w-full border-2 border-border p-2 bg-card rounded-card select-none">
      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-muted-foreground uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {gridCells.map((cell) => {
          if (cell.isEmpty) {
            return <DayCell key={cell.key} />;
          }

          return (
            <DayCell
              key={cell.key}
              gregorianDate={cell.gregorianDate}
              hijriDay={cell.hijriDay}
              hasLog={cell.hasLog}
              isComplete={cell.isComplete}
              isToday={cell.isToday}
              isHoliday={cell.isHoliday}
              isFriday={cell.isFriday}
              onClick={() => cell.dateStr && onDaySelect(cell.dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
