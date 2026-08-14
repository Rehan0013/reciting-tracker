'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MonthNavigator from '@/components/calendar/MonthNavigator';
import HolidayBanner from '@/components/calendar/HolidayBanner';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import Link from 'next/link';
import { Flame, Moon, Plus, X, Calendar as CalendarIcon, Loader } from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();
  
  // Date State (Defaults to current local date)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [daysData, setDaysData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Month-end banner states
  const [showMonthEndBanner, setShowMonthEndBanner] = useState(false);
  const [prevMonthSummary, setPrevMonthSummary] = useState<{ surahs: number; days: number } | null>(null);

  // Helper: Get Indian Standard Time (Asia/Kolkata) or local YYYY-MM-DD date string
  const getTodayStr = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    } catch {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const todayStr = getTodayStr();

  // Load calendar and summary data + Hourly auto-update check
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // API expects 1-12

      try {
        // 1. Fetch calendar data from Islamic date proxy (calibrated to Indian moon sighting)
        const calRes = await fetch(`/api/islamic-date?month=${month}&year=${year}`);
        if (!calRes.ok) throw new Error('Failed to fetch calendar');
        const calJson = await calRes.json();
        const daysArray = calJson.data || [];
        setDaysData(daysArray);

        // 2. Fetch monthly logs, stats, and streak
        const sumRes = await fetch(
          `/api/monthly-summary?month=${month}&year=${year}&mode=gregorian&today=${todayStr}`
        );
        if (!sumRes.ok) throw new Error('Failed to fetch summary');
        const sumJson = await sumRes.json();
        setSummaryData(sumJson);

        // 3. Fetch today's logs for quick summary card
        const logRes = await fetch(`/api/reading-log?date=${todayStr}`);
        if (logRes.ok) {
          const logJson = await logRes.json();
          setTodayLog(logJson);
        }
      } catch (err) {
        console.error('Error fetching calendar dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check and update each hour (3600000 ms)
    const hourlyInterval = setInterval(() => {
      fetchData();
    }, 3600000);

    // Refresh when user switches back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(hourlyInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentDate, todayStr]);

  // Check and fetch previous month details for Month-End Achievement Banner
  useEffect(() => {
    const checkMonthEnd = async () => {
      const today = new Date();
      // Only display on the 1st of the Gregorian month
      if (today.getDate() !== 1) return;

      const prevMonthDate = new Date();
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth() + 1;

      const storageKey = `dismissed-month-banner-${prevYear}-${prevMonth}`;
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed) return;

      try {
        const res = await fetch(
          `/api/monthly-summary?month=${prevMonth}&year=${prevYear}&mode=gregorian&today=${todayStr}`
        );
        if (res.ok) {
          const json = await res.json();
          
          // Count total surahs read in the previous month
          const surahEntries = json.breakdown?.filter((item: any) => item._id.type === 'Surah') || [];
          const totalSurahs = surahEntries.reduce((acc: number, item: any) => acc + item.totalCount, 0);

          setPrevMonthSummary({
            surahs: totalSurahs,
            days: json.stats?.daysLogged || 0,
          });
          setShowMonthEndBanner(true);
        }
      } catch (err) {
        console.error('Error fetching previous month summary:', err);
      }
    };

    checkMonthEnd();
  }, [todayStr]);

  // Dismiss Month-End Banner
  const handleDismissMonthEndBanner = () => {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    
    localStorage.setItem(`dismissed-month-banner-${prevYear}-${prevMonth}`, 'true');
    setShowMonthEndBanner(false);
  };

  // Navigate to detailed day view
  const handleDaySelect = (dateStr: string) => {
    router.push(`/day/${dateStr}`);
  };

  // Convert monthly log array into a fast mapping table for CalendarGrid
  const getLogsMap = () => {
    const map: Record<string, { hasLog: boolean; isComplete: boolean }> = {};
    if (summaryData?.monthLogs) {
      summaryData.monthLogs.forEach((log: any) => {
        map[log.date] = {
          hasLog: log.entries && log.entries.length > 0,
          isComplete: log.isDayComplete || false,
        };
      });
    }
    return map;
  };

  // Extract active holiday today
  const getTodayHoliday = () => {
    if (!daysData || daysData.length === 0) return null;
    
    // Find matching day in Aladhan response
    const todayParts = todayStr.split('-');
    const dayIndex = Number(todayParts[2]) - 1;
    const todayItem = daysData[dayIndex];

    if (todayItem?.hijri?.holidays && todayItem.hijri.holidays.length > 0) {
      return todayItem.hijri.holidays[0];
    }
    return null;
  };

  const todayHoliday = getTodayHoliday();

  // Streak counter display helper
  const streak = summaryData?.streak || 0;

  // Build userLogs map for the grid cells
  const userLogsMap = getLogsMap();

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 pb-6 animate-fade-in">
      
      {/* 1. Islamic Holiday Alert (Today) */}
      {todayHoliday && (
        <div className="flex items-center justify-between border border-holiday bg-secondary/40 text-holiday p-3.5 rounded-card select-none">
          <div className="flex items-center gap-2.5">
            <Moon className="w-5 h-5 fill-holiday text-holiday shrink-0" />
            <p className="text-sm font-medium">
              Today is <span className="font-serif font-bold">{todayHoliday.toLowerCase()}</span> — Eid Mubarak! 🌙
            </p>
          </div>
        </div>
      )}

      {/* 2. Month-End Dismissible Achievement Banner */}
      {showMonthEndBanner && prevMonthSummary && (
        <div className="flex items-start justify-between border border-primary bg-secondary/35 text-foreground p-3.5 rounded-card select-none">
          <div className="flex gap-2.5">
            <span className="text-lg">🌙</span>
            <div className="text-xs">
              <span className="font-bold text-primary block text-sm">last month summary</span>
              you read <span className="font-bold text-primary">{prevMonthSummary.surahs}</span> surahs across{' '}
              <span className="font-bold text-primary">{prevMonthSummary.days}</span> days. mashaAllah!
            </div>
          </div>
          <button
            onClick={handleDismissMonthEndBanner}
            className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Streak Count Banner */}
      <div className="flex items-center justify-between border-2 border-border bg-card p-4 rounded-card select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-accent/30 bg-secondary/50 text-accent flex items-center justify-center rounded-card">
            <Flame className="w-6 h-6 fill-current text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground capitalize leading-none">
              current streak
            </h3>
            <p className="font-serif font-bold text-xl text-foreground mt-1 lowercase leading-none">
              {streak} {streak === 1 ? 'day' : 'days'} streak
            </p>
          </div>
        </div>
        <Link
          href={`/day/${todayStr}`}
          className="px-4 py-2 border border-border bg-primary text-primary-foreground font-semibold text-sm hover:bg-opacity-90 rounded-btn min-h-[44px] flex items-center justify-center cursor-pointer transition-colors duration-100"
        >
          log today
        </Link>
      </div>

      {/* 4. Month Navigator & Calendar Grid Wrapper */}
      <div className="space-y-2.5">
        <MonthNavigator
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          daysData={daysData}
        />

        <HolidayBanner daysData={daysData} todayStr={todayStr} />

        {loading ? (
          <div className="h-[280px] w-full border-2 border-border border-dashed bg-card rounded-card flex items-center justify-center text-muted-foreground">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            daysData={daysData}
            userLogs={userLogsMap}
            onDaySelect={handleDaySelect}
            todayStr={todayStr}
          />
        )}
      </div>

      {/* 5. Today's Summary Card & Empty State */}
      <div className="border-2 border-border bg-card p-4 rounded-card">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !summaryData?.monthLogs || summaryData.monthLogs.length === 0 ? (
          /* Empty State for first-time / no-log users */
          <div className="flex flex-col items-center justify-center text-center py-6 px-4">
            <div className="w-16 h-16 border border-border bg-secondary text-primary flex items-center justify-center rounded-card mb-3.5">
              <svg
                className="w-10 h-10 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="m4 19 8-2 8 2M4 15c2-1 6-2 8-2s6 1 8 2M12 6v11" />
              </svg>
            </div>
            <h4 className="font-serif text-lg font-bold text-foreground">
              begin your journey
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px]">
              tap any date on the calendar above to record your first daily reading log.
            </p>
          </div>
        ) : (
          /* Today's logged summary details */
          <div>
            <h3 className="text-sm font-bold text-foreground capitalize mb-3 border-b border-border pb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-primary" />
              today's summary
            </h3>

            {todayLog && todayLog.entries && todayLog.entries.length > 0 ? (
              <div className="space-y-2.5">
                <ul className="space-y-2">
                  {todayLog.entries.slice(0, 3).map((entry: any, index: number) => {
                    let iconStr = '📖';
                    if (entry.type === 'Dhikr') iconStr = '📿';
                    if (entry.type === 'Dua') iconStr = '🤲';
                    if (entry.type === 'Salah') iconStr = '🕌';
                    if (entry.type === 'Tahajjud') iconStr = '✨';

                    return (
                      <li key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-b-0">
                        <span className="flex items-center gap-2">
                          <span className="text-base shrink-0">{iconStr}</span>
                          <span className="capitalize">{entry.type} · {entry.name.toLowerCase()}</span>
                          {entry.nameArabic && (
                            <span className="font-arabic text-primary text-xs ml-1 font-bold">
                              ({entry.nameArabic})
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-foreground">
                          × {entry.count}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                
                {todayLog.entries.length > 3 && (
                  <p className="text-xs text-muted-foreground italic pl-6 mt-1 text-center">
                    + {todayLog.entries.length - 3} more logs today
                  </p>
                )}

                <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">status:</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-[2px] ${
                        todayLog.isDayComplete
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground border border-border'
                      }`}
                    >
                      {todayLog.isDayComplete ? 'complete' : 'in progress'}
                    </span>
                  </div>
                  <Link
                    href={`/day/${todayStr}`}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    edit details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <p className="text-xs text-muted-foreground">no entries logged today yet.</p>
                <Link
                  href={`/day/${todayStr}`}
                  className="mt-3.5 text-xs text-primary hover:underline font-bold flex items-center gap-1 min-h-[44px]"
                >
                  <Plus className="w-3.5 h-3.5" /> add reading
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
