'use client';

import { Moon } from 'lucide-react';

interface HolidayInfo {
  name: string;
  date: string; // "DD-MM-YYYY" Gregorian
  daysAway: number;
}

interface HolidayBannerProps {
  daysData: any[];
  todayStr: string; // "YYYY-MM-DD"
}

export default function HolidayBanner({ daysData, todayStr }: HolidayBannerProps) {
  if (!daysData || daysData.length === 0) return null;

  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);

  const parsedHolidays: HolidayInfo[] = [];
  const seenHolidays = new Set<string>();

  daysData.forEach((day) => {
    const holidays = day.hijri?.holidays;
    if (holidays && holidays.length > 0) {
      holidays.forEach((holidayName: string) => {
        // Parse Gregorian date: "DD-MM-YYYY"
        const parts = day.gregorian.date.split('-');
        const gregDateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        gregDateObj.setHours(0, 0, 0, 0);

        const diffTime = gregDateObj.getTime() - today.getTime();
        const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Create a unique key to prevent duplicate holiday items on the same day
        const uniqueKey = `${holidayName}-${day.gregorian.date}`;

        if (!seenHolidays.has(uniqueKey)) {
          seenHolidays.add(uniqueKey);
          parsedHolidays.push({
            name: holidayName,
            date: day.gregorian.date,
            daysAway,
          });
        }
      });
    }
  });

  // Filter out holidays that occurred more than 1 day ago and sort by date proximity
  const activeHolidays = parsedHolidays
    .filter((h) => h.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);

  if (activeHolidays.length === 0) return null;

  return (
    <div className="w-full select-none mt-2">
      <div className="text-xs font-semibold text-muted-foreground mb-1.5 capitalize px-1">
        upcoming islamic events
      </div>
      <div className="w-full overflow-x-auto flex gap-2 pb-2 scrollbar-none">
        {activeHolidays.map((holiday, idx) => {
          let badgeText = '';
          if (holiday.daysAway === 0) {
            badgeText = 'today';
          } else if (holiday.daysAway === 1) {
            badgeText = 'tomorrow';
          } else {
            badgeText = `in ${holiday.daysAway} days`;
          }

          return (
            <div
              key={idx}
              className="flex items-center gap-2 border border-holiday bg-secondary/35 text-holiday px-3 py-1.5 rounded-card whitespace-nowrap shrink-0 text-xs font-medium"
            >
              <Moon className="w-3.5 h-3.5 fill-holiday text-holiday shrink-0" />
              <span className="capitalize">{holiday.name.toLowerCase()}</span>
              <span className="text-[10px] bg-holiday text-background px-1.5 py-0.5 rounded-[2px] font-bold">
                {badgeText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
