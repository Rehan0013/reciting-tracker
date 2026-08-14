'use client';

import { useState, useEffect } from 'react';
import MonthSummaryCard from '@/components/summary/MonthSummaryCard';
import ReadingBreakdown from '@/components/summary/ReadingBreakdown';
import ConsistencyHeatmap from '@/components/summary/ConsistencyHeatmap';
import { ChevronLeft, ChevronRight, BarChart2, Calendar, Award, Loader, RotateCcw } from 'lucide-react';

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export default function HistoryPage() {
  const [mode, setMode] = useState<'gregorian' | 'islamic'>('gregorian');
  
  // Gregorian navigation states
  const [gregDate, setGregDate] = useState(() => new Date());

  // Islamic navigation states - dynamically initialized from current Indian Hijri date
  const [hijriMonth, setHijriMonth] = useState<number>(2); // Default fallback: Safar
  const [hijriYear, setHijriYear] = useState<number>(1448); // Default fallback: 1448 AH
  const [currentHijriInfo, setCurrentHijriInfo] = useState<{ month: number; year: number; day: number } | null>(null);

  // Fetch states
  const [daysData, setDaysData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 1. Fetch current live Indian Hijri date on mount to initialize Islamic Month & Year accurately
  useEffect(() => {
    const fetchCurrentHijri = async () => {
      try {
        const res = await fetch('/api/islamic-date?today=true');
        if (res.ok) {
          const json = await res.json();
          if (json.today?.hijri) {
            const m = Number(json.today.hijri.month);
            const y = Number(json.today.hijri.year);
            const d = Number(json.today.hijri.day);
            setCurrentHijriInfo({ month: m, year: y, day: d });
            setHijriMonth(m);
            setHijriYear(y);
          }
        }
      } catch (err) {
        console.error('Error fetching today Hijri info for history page:', err);
      }
    };

    fetchCurrentHijri();
  }, []);

  // 2. Load calendar and stats summary + Hourly auto-refresh
  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/monthly-summary?mode=${mode}&today=${todayStr}`;
        
        if (mode === 'gregorian') {
          const year = gregDate.getFullYear();
          const month = gregDate.getMonth() + 1;
          url += `&year=${year}&month=${month}`;

          // Also fetch calendar dates from Islamic date proxy for heatmap formatting
          const calRes = await fetch(`/api/islamic-date?month=${month}&year=${year}`);
          if (calRes.ok) {
            const calJson = await calRes.json();
            setDaysData(calJson.data || []);

            // If currentHijriInfo is not set yet, set it from calJson.indianToday
            if (!currentHijriInfo && calJson.indianToday?.hijri) {
              const m = Number(calJson.indianToday.hijri.month);
              const y = Number(calJson.indianToday.hijri.year);
              const d = Number(calJson.indianToday.hijri.day);
              setCurrentHijriInfo({ month: m, year: y, day: d });
              setHijriMonth(m);
              setHijriYear(y);
            }
          }
        } else {
          url += `&hijriYear=${hijriYear}&hijriMonth=${hijriMonth}`;
          setDaysData([]); // We use custom 30-day Hijri grid for Islamic mode
        }

        const sumRes = await fetch(url);
        if (!sumRes.ok) throw new Error('Failed to fetch summary data');
        const sumJson = await sumRes.json();
        setSummary(sumJson);
      } catch (err: any) {
        console.error('Error fetching history page details:', err);
        setError('Failed to load history data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();

    // Check hourly (3600000 ms)
    const hourlyInterval = setInterval(() => {
      fetchHistoryData();
    }, 3600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHistoryData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(hourlyInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, gregDate, hijriMonth, hijriYear, todayStr]);

  // Gregorian Navigation Handlers
  const handlePrevGregMonth = () => {
    setGregDate(new Date(gregDate.getFullYear(), gregDate.getMonth() - 1, 1));
  };

  const handleNextGregMonth = () => {
    setGregDate(new Date(gregDate.getFullYear(), gregDate.getMonth() + 1, 1));
  };

  const handleResetGregToday = () => {
    setGregDate(new Date());
  };

  // Islamic Navigation Handlers
  const handlePrevHijriMonth = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(prev => prev - 1);
    } else {
      setHijriMonth(prev => prev - 1);
    }
  };

  const handleNextHijriMonth = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(prev => prev + 1);
    } else {
      setHijriMonth(prev => prev + 1);
    }
  };

  const handleResetHijriToday = () => {
    if (currentHijriInfo) {
      setHijriMonth(currentHijriInfo.month);
      setHijriYear(currentHijriInfo.year);
    } else {
      setHijriMonth(2);
      setHijriYear(1448);
    }
  };

  // Check if viewing current month
  const isViewingCurrentGregMonth =
    gregDate.getFullYear() === new Date().getFullYear() &&
    gregDate.getMonth() === new Date().getMonth();

  const isViewingCurrentHijriMonth =
    currentHijriInfo !== null &&
    hijriMonth === currentHijriInfo.month &&
    hijriYear === currentHijriInfo.year;

  // Extract pages read from breakdown
  const getPagesCount = () => {
    if (!summary?.breakdown) return 0;
    const pagesItems = summary.breakdown.filter(
      (item: any) => item._id.type === 'Quran Pages' || item._id.type.toLowerCase() === 'pages'
    );
    return pagesItems.reduce((acc: number, item: any) => acc + item.totalCount, 0);
  };

  // Extract total Juz read
  const getJuzCount = () => {
    if (!summary?.breakdown) return 0;
    const juzItems = summary.breakdown.filter((item: any) => item._id.type === 'Juz');
    return juzItems.reduce((acc: number, item: any) => acc + item.totalCount, 0);
  };

  // Extract most read item
  const getMostReadItem = () => {
    if (!summary?.breakdown || summary.breakdown.length === 0) return null;
    const first = summary.breakdown[0];
    return `${first._id.name.toLowerCase()} × ${first.totalCount}`;
  };

  // Map logs to date keys for heatmap rendering
  const getHeatmapLogsMap = () => {
    const map: Record<string, number> = {};
    if (summary?.monthLogs) {
      summary.monthLogs.forEach((log: any) => {
        map[log.date] = log.entries ? log.entries.length : 0;
      });
    }
    return map;
  };

  // Construct logs map for Hijri month (Islamic mode 1-30 days)
  const getHijriHeatmapLogsMap = () => {
    const map: Record<string, number> = {};
    if (summary?.monthLogs) {
      summary.monthLogs.forEach((log: any) => {
        if (log.hijriDay) {
          map[log.hijriDay.toString()] = log.entries ? log.entries.length : 0;
        }
      });
    }
    return map;
  };

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 pb-12 animate-fade-in">
      
      {/* Page Title */}
      <div className="flex items-center gap-2 select-none">
        <BarChart2 className="w-5 h-5 text-primary" />
        <h2 className="font-serif font-bold text-xl text-foreground capitalize tracking-wide leading-none">
          monthly history
        </h2>
      </div>

      {/* 1. Mode Toggle Buttons (Gregorian vs Islamic) */}
      <div className="grid grid-cols-2 border border-border bg-card p-1 rounded-card select-none">
        <button
          onClick={() => setMode('gregorian')}
          className={`py-2 text-xs font-bold rounded-[2px] transition-colors duration-100 cursor-pointer focus:outline-none min-h-[40px] capitalize ${
            mode === 'gregorian'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          gregorian calendar
        </button>
        <button
          onClick={() => setMode('islamic')}
          className={`py-2 text-xs font-bold rounded-[2px] transition-colors duration-100 cursor-pointer focus:outline-none min-h-[40px] capitalize ${
            mode === 'islamic'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          islamic calendar (hijri)
        </button>
      </div>

      {/* 2. Month Navigator (Based on active mode) */}
      <div className="flex items-center justify-between border border-border bg-card p-4 rounded-card select-none">
        <button
          onClick={mode === 'gregorian' ? handlePrevGregMonth : handlePrevHijriMonth}
          className="w-11 h-11 border border-border bg-background hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="text-center flex flex-col items-center">
          <h3 className="font-serif font-bold text-lg text-foreground capitalize leading-none">
            {mode === 'gregorian'
              ? gregDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toLowerCase()
              : `${HIJRI_MONTHS[hijriMonth - 1]?.toLowerCase() || 'month'} ${hijriYear} ah`}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground capitalize leading-none">
              {mode === 'gregorian' ? 'gregorian calendar view' : 'islamic calendar view'}
            </p>
            {/* Quick jump to current month button if navigated away */}
            {mode === 'gregorian' && !isViewingCurrentGregMonth && (
              <button
                onClick={handleResetGregToday}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 leading-none cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                this month
              </button>
            )}
            {mode === 'islamic' && !isViewingCurrentHijriMonth && (
              <button
                onClick={handleResetHijriToday}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 leading-none cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                current hijri month
              </button>
            )}
          </div>
        </div>

        <button
          onClick={mode === 'gregorian' ? handleNextGregMonth : handleNextHijriMonth}
          className="w-11 h-11 border border-border bg-background hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="h-[250px] w-full border-2 border-border border-dashed bg-card rounded-card flex items-center justify-center text-muted-foreground">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 border-2 border-red-200 bg-red-50 text-red-800 text-sm rounded-card text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 3. Stats Row - 3 cards */}
          <div className="flex gap-2.5">
            <MonthSummaryCard
              label="days logged"
              value={summary?.stats?.daysLogged || 0}
              unit="days"
            />
            <MonthSummaryCard
              label="total entries"
              value={summary?.stats?.totalEntries || 0}
              unit="logs"
            />
            <MonthSummaryCard
              label="pages read"
              value={getPagesCount()}
              unit="pages"
            />
          </div>

          {/* 4. Highlight Banner (Streak & Most Read) */}
          <div className="border border-border bg-card p-3.5 rounded-card space-y-2 text-sm select-none">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">🔥</span>
              <p className="text-foreground">
                current consecutive logging streak:{' '}
                <span className="font-serif font-bold text-primary">{summary?.streak || 0} days</span>
              </p>
            </div>
            
            {getMostReadItem() && (
              <div className="flex items-center gap-2 border-t border-border/40 pt-2">
                <span className="text-base shrink-0">⭐</span>
                <p className="text-foreground truncate capitalize">
                  most read this month: <span className="font-semibold text-primary">{getMostReadItem()}</span>
                </p>
              </div>
            )}

            {getJuzCount() > 0 && (
              <div className="flex items-center gap-2 border-t border-border/40 pt-2">
                <span className="text-base shrink-0">🏆</span>
                <p className="text-foreground capitalize">
                  achievement: you completed <span className="font-serif font-bold text-primary">{getJuzCount()} juz</span> of the quran this month!
                </p>
              </div>
            )}
          </div>

          {/* 5. Reading Breakdown list */}
          <div className="border-2 border-border bg-card p-4 rounded-card">
            <h4 className="text-sm font-bold text-foreground capitalize mb-4 border-b border-border pb-1.5 flex items-center gap-1.5 select-none">
              <Award className="w-4 h-4 text-primary shrink-0" />
              itemized breakdown
            </h4>
            <ReadingBreakdown breakdown={summary?.breakdown || []} />
          </div>

          {/* 6. Consistency heatmap */}
          {mode === 'gregorian' ? (
            <ConsistencyHeatmap
              currentDate={gregDate}
              daysData={daysData}
              logsMap={getHeatmapLogsMap()}
            />
          ) : (
            /* Custom Hijri Heatmap (Days 1 to 30) */
            <div className="w-full bg-card border border-border p-4 rounded-card select-none">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-muted-foreground capitalize">
                  hijri monthly consistency ({HIJRI_MONTHS[hijriMonth - 1]} {hijriYear} AH)
                </div>
                {isViewingCurrentHijriMonth && currentHijriInfo && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    today is day {currentHijriInfo.day}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-7 gap-1.5 w-full max-w-[280px]">
                  {/* Grid squares representing Hijri days 1 to 30 */}
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const hijriDayNum = idx + 1;
                    const count = getHijriHeatmapLogsMap()[hijriDayNum.toString()] || 0;
                    const isToday =
                      isViewingCurrentHijriMonth && currentHijriInfo?.day === hijriDayNum;
                    
                    let shadingClass = 'bg-secondary border-border/40 text-muted-foreground/60';
                    if (count > 0) {
                      shadingClass =
                        count <= 2
                          ? 'bg-primary/40 border-primary/50 text-foreground'
                          : count <= 4
                          ? 'bg-primary/70 border-primary/80 text-primary-foreground'
                          : 'bg-primary border-primary text-primary-foreground';
                    }

                    return (
                      <div
                        key={idx}
                        className={`aspect-square border flex items-center justify-center text-[9px] font-bold rounded-[2px] w-full transition-all duration-100 ${shadingClass} ${
                          isToday
                            ? 'ring-2 ring-primary ring-offset-1 ring-offset-background font-extrabold shadow-sm'
                            : ''
                        }`}
                        title={`${count} entries on ${hijriDayNum} ${HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} AH${
                          isToday ? ' (Today)' : ''
                        }`}
                      >
                        {hijriDayNum}
                      </div>
                    );
                  })}
                </div>
                
                {/* Heatmap Legend */}
                <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground capitalize select-none">
                  <span>less</span>
                  <div className="w-3.5 h-3.5 bg-secondary border border-border/40 rounded-[1px]" />
                  <div className="w-3.5 h-3.5 bg-primary/40 border border-primary/50 rounded-[1px]" />
                  <div className="w-3.5 h-3.5 bg-primary/70 border border-primary/85 rounded-[1px]" />
                  <div className="w-3.5 h-3.5 bg-primary border border-primary rounded-[1px]" />
                  <span>more</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
