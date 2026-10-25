'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, BookmarkCheck, Calendar, BookOpen, Loader2 } from 'lucide-react';

interface LogRecitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahEnglishName: string;
  surahArabicName: string;
  totalVerses: number;
  currentAyahNumber?: number;
}

export default function LogRecitationModal({
  isOpen,
  onClose,
  surahNumber,
  surahEnglishName,
  surahArabicName,
  totalVerses,
  currentAyahNumber,
}: LogRecitationModalProps) {
  const [mounted, setMounted] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [verseCount, setVerseCount] = useState<number>(totalVerses);
  const [notes, setNotes] = useState<string>(
    currentAyahNumber && currentAyahNumber < totalVerses
      ? `Recited verses 1–${currentAyahNumber}`
      : `Recited complete Surah`
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dateObj = new Date(date);
      const gregorianMonth = dateObj.getMonth() + 1;
      const gregorianYear = dateObj.getFullYear();

      const entry = {
        type: 'surah',
        name: surahEnglishName,
        nameArabic: surahArabicName,
        count: Number(verseCount) || totalVerses,
        notes: notes.trim(),
      };

      const res = await fetch('/api/reading-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          gregorianMonth,
          gregorianYear,
          entry,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save log entry');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error logging reading entry:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-card border-2 border-border rounded-card p-5 sm:p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border border-border bg-secondary hover:bg-border text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 border border-primary/30 bg-primary/10 text-primary flex items-center justify-center rounded-[2px]">
            <BookmarkCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-foreground">
              Log Recitation to Tracker
            </h2>
            <p className="text-xs text-muted-foreground">
              Save your reading to daily habits & streaks
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
            <h3 className="text-base font-bold text-foreground">
              Recitation Logged Successfully!
            </h3>
            <p className="text-xs text-muted-foreground">
              Added to your daily reading log for {date}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-[2px]">
                {error}
              </div>
            )}

            {/* Surah Details Preview */}
            <div className="p-3 bg-secondary rounded-[2px] border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Surah</p>
                <p className="font-serif font-bold text-base text-foreground">
                  {surahNumber}. {surahEnglishName}
                </p>
              </div>
              <span className="font-serif text-xl text-primary font-bold">
                {surahArabicName}
              </span>
            </div>

            {/* Date input */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Log Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-[2px]">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Verses Read Count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Verses Recited
                </label>
                <span className="text-xs text-muted-foreground">
                  Total in Surah: {totalVerses}
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={totalVerses}
                value={verseCount}
                onChange={(e) => setVerseCount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-[2px] text-sm text-foreground focus:outline-primary"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Personal Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Read with translation and Tafsir reflection"
                className="w-full px-3 py-2 bg-background border border-border rounded-[2px] text-sm text-foreground focus:outline-primary resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold border border-border bg-card hover:bg-secondary text-foreground rounded-[2px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2px] cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save to Daily Tracker</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
