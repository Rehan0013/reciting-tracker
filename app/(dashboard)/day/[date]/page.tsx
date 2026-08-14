'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReadingEntryForm from '@/components/reading/ReadingEntryForm';
import ReadingEntryCard from '@/components/reading/ReadingEntryCard';
import { ArrowLeft, CheckCircle2, Circle, Calendar, Loader } from 'lucide-react';
import Link from 'next/link';

interface HijriDetails {
  hijriDate: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  hijriYear: number;
  gregorianMonth: number;
  gregorianYear: number;
}

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dateStr = params.date as string; // "YYYY-MM-DD"

  const [log, setLog] = useState<any>(null);
  const [hijriDetails, setHijriDetails] = useState<HijriDetails | null>(null);
  const [weekday, setWeekday] = useState<string>('');
  const [activeTypes, setActiveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse date for visual header
  const getGregorianHeaderLabel = () => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).toLowerCase();
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const parts = dateStr.split('-');
      const year = parts[0];
      const month = parts[1];
      const day = Number(parts[2]);

      // 1. Fetch Hijri dates from Aladhan API proxy
      const calRes = await fetch(`/api/islamic-date?month=${month}&year=${year}`);
      if (!calRes.ok) throw new Error('Failed to fetch Hijri date');
      const calJson = await calRes.json();
      const dayData = calJson.data?.[day - 1];
      
      if (dayData) {
        setHijriDetails({
          hijriDate: dayData.hijri.date,
          hijriDay: Number(dayData.hijri.day),
          hijriMonth: Number(dayData.hijri.month.number),
          hijriMonthName: dayData.hijri.month.en,
          hijriYear: Number(dayData.hijri.year),
          gregorianMonth: Number(month),
          gregorianYear: Number(year),
        });
        setWeekday(dayData.gregorian.weekday.en);
      }

      // 2. Fetch logged entries for this day
      const logRes = await fetch(`/api/reading-log?date=${dateStr}`);
      if (logRes.ok) {
        const logData = await logRes.json();
        setLog(logData);
      }

      // 3. Fetch user's tracking options
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setActiveTypes(profileData.readingTypes || []);
      }
    } catch (err: any) {
      console.error('Error loading day detail page data:', err);
      setError(err.message || 'Failed to load daily log details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateStr) {
      loadData();
    }

    // Refresh hourly (3600000 ms) to keep Hijri data & logs up to date
    const hourlyInterval = setInterval(() => {
      if (dateStr) loadData();
    }, 3600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && dateStr) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(hourlyInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  // Handle entry deletion
  const handleDeleteEntry = async (entryId: string) => {
    try {
      const res = await fetch('/api/reading-log', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, entryId }),
      });

      if (!res.ok) throw new Error('Failed to delete entry');
      
      // Refetch
      const updatedLog = await res.json();
      setLog(updatedLog);
    } catch (err) {
      console.error('Delete entry error:', err);
    }
  };

  // Handle entry edit (save updates)
  const handleEditEntry = async (entryId: string, updates: { count: number; notes: string }) => {
    const res = await fetch('/api/reading-log', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, entryId, updates }),
    });

    if (!res.ok) throw new Error('Failed to update entry');

    // Refetch
    const updatedLog = await res.json();
    setLog(updatedLog);
  };

  // Toggle isDayComplete status
  const handleToggleComplete = async () => {
    if (!log) return;
    const nextState = !log.isDayComplete;
    
    try {
      const res = await fetch('/api/reading-log/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, isDayComplete: nextState }),
      });

      if (!res.ok) throw new Error('Failed to update completion status');
      
      const updatedLog = await res.json();
      setLog(updatedLog);
    } catch (err) {
      console.error('Error toggling complete status:', err);
    }
  };

  // Visual text for Hijri date
  const getHijriLabel = () => {
    if (!hijriDetails) return '';
    const isFriday = weekday.toLowerCase() === 'friday';
    const dayLabel = isFriday ? ' · jumu\'ah' : '';
    return `${hijriDetails.hijriDay} ${hijriDetails.hijriMonthName.toLowerCase()} ${hijriDetails.hijriYear} ah${dayLabel}`;
  };

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 pb-12 animate-fade-in">
      
      {/* Header Back controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-11 h-11 border border-border bg-card hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer"
          title="Back to Calendar"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h2 className="font-serif font-bold text-xl text-foreground tracking-wide leading-none capitalize">
            {getGregorianHeaderLabel()}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 capitalize leading-none font-semibold">
            {getHijriLabel()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] w-full border-2 border-border border-dashed bg-card rounded-card flex items-center justify-center text-muted-foreground">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 border-2 border-red-200 bg-red-50 text-red-800 text-sm rounded-card text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Add Reading Entry Form Card */}
          <div className="border-2 border-border bg-card p-4 rounded-card">
            <h3 className="text-sm font-bold text-foreground capitalize mb-4 border-b border-border pb-1.5 flex items-center gap-1.5 select-none">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              add reading log
            </h3>
            <ReadingEntryForm
              dateStr={dateStr}
              hijriDetails={hijriDetails}
              activeTypes={activeTypes}
              onSaveSuccess={loadData}
            />
          </div>

          {/* Today's Logged Entries List */}
          <div className="border-2 border-border bg-card p-4 rounded-card space-y-3">
            <h3 className="text-sm font-bold text-foreground capitalize mb-1 border-b border-border pb-1.5 select-none">
              today's entries
            </h3>
            
            {log && log.entries && log.entries.length > 0 ? (
              <div className="space-y-2.5">
                <div className="space-y-2">
                  {log.entries.map((entry: any) => (
                    <ReadingEntryCard
                      key={entry._id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                      onEdit={handleEditEntry}
                    />
                  ))}
                </div>
                
                {/* Complete Day Toggle */}
                <div className="border-t border-border pt-4 mt-2 select-none">
                  <button
                    onClick={handleToggleComplete}
                    className={`w-full py-3.5 border flex items-center justify-center gap-2.5 font-semibold text-sm rounded-btn transition-colors duration-100 cursor-pointer min-h-[44px] ${
                      log.isDayComplete
                        ? 'bg-primary text-primary-foreground border-transparent hover:bg-opacity-95'
                        : 'bg-background hover:bg-secondary border-border text-foreground'
                    }`}
                  >
                    {log.isDayComplete ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        day complete!
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5 shrink-0" />
                        mark day complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-6 select-none">
                no entries logged for this day yet.
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
