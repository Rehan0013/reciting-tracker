'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  SlidersHorizontal,
  Volume2,
  CalendarPlus,
  Loader2,
  Eye,
  EyeOff,
  LayoutGrid,
  AlignJustify,
  Info,
} from 'lucide-react';
import {
  QURAN_SURAHS,
  TRANSLATION_OPTIONS,
  RECITER_OPTIONS,
  toArabicNumerals,
  cleanAyahText,
  SurahMeta,
} from '@/lib/quranData';
import AudioPlayerBar from './AudioPlayerBar';
import VerseContextModal from './VerseContextModal';
import LogRecitationModal from './LogRecitationModal';

interface AyahData {
  number: number;
  numberInSurah: number;
  textArabic: string;
  textTranslation: string;
  audioUrl: string;
  juz: number;
  page: number;
  manzil: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface SurahReaderProps {
  surahNumber: number;
}

export default function SurahReader({ surahNumber }: SurahReaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Data state
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings & Preferences (persisted in localStorage)
  const [selectedTranslation, setSelectedTranslation] = useState<string>('en.sahih');
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  const [arabicFontSize, setArabicFontSize] = useState<number>(30);
  const [translationFontSize, setTranslationFontSize] = useState<number>(16);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'mushaf'>('cards');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Audio Playback State
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Modals state
  const [contextModalOpen, setContextModalOpen] = useState<boolean>(false);
  const [contextAyahNumber, setContextAyahNumber] = useState<number>(1);
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);

  // Bookmarks & Copied feedback
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Refs for auto-scroll
  const verseRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  // Scroll listener for Back to Top button
  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const onScroll = () => {
      setShowScrollTop(container.scrollTop > 400);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollToTop = () => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load user preferences and bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const savedTrans = localStorage.getItem('quran_pref_translation');
      if (savedTrans) setSelectedTranslation(savedTrans);

      const savedReciter = localStorage.getItem('quran_pref_reciter');
      if (savedReciter) setSelectedReciter(savedReciter);

      const savedArabicFont = localStorage.getItem('quran_pref_arabic_size');
      if (savedArabicFont) setArabicFontSize(Number(savedArabicFont));

      const savedTransFont = localStorage.getItem('quran_pref_trans_size');
      if (savedTransFont) setTranslationFontSize(Number(savedTransFont));

      const savedViewMode = localStorage.getItem('quran_pref_view_mode') as 'cards' | 'mushaf';
      if (savedViewMode) setViewMode(savedViewMode);

      const savedBookmarks = localStorage.getItem(`quran_bookmarks_${surahNumber}`);
      if (savedBookmarks) setBookmarkedAyahs(JSON.parse(savedBookmarks));

      // Save Last Read position
      localStorage.setItem(
        'quran_last_read',
        JSON.stringify({
          surahNumber,
          ayahNumber: 1,
          date: new Date().toISOString(),
        })
      );
    } catch (_) {}
  }, [surahNumber]);

  // Fetch Surah data from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchSurah = async () => {
      try {
        const res = await fetch(
          `/api/quran/surah/${surahNumber}?translation=${selectedTranslation}&reciter=${selectedReciter}`
        );

        if (!res.ok) {
          throw new Error(`Failed to load Surah (status ${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          if (data.ok) {
            setSurah(data.surah);
            setAyahs(data.ayahs || []);
          } else {
            setError(data.error || 'Failed to fetch Surah data.');
          }
        }
      } catch (err: any) {
        console.error('Error loading surah:', err);
        if (isMounted) {
          setError(err.message || 'Network error while loading Surah.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSurah();

    return () => {
      isMounted = false;
    };
  }, [surahNumber, selectedTranslation, selectedReciter]);

  // Auto-scroll to active ayah when audio plays
  useEffect(() => {
    if (isPlaying && autoScroll && activeAyahNumber && verseRefs.current[activeAyahNumber]) {
      verseRefs.current[activeAyahNumber]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeAyahNumber, isPlaying, autoScroll]);

  // Handlers for settings change with persistence
  const handleTranslationChange = (newTrans: string) => {
    setSelectedTranslation(newTrans);
    localStorage.setItem('quran_pref_translation', newTrans);
  };

  const handleReciterChange = (newReciter: string) => {
    setSelectedReciter(newReciter);
    localStorage.setItem('quran_pref_reciter', newReciter);
  };

  const handleViewModeChange = (mode: 'cards' | 'mushaf') => {
    setViewMode(mode);
    localStorage.setItem('quran_pref_view_mode', mode);
  };

  const handleArabicFontSizeChange = (size: number) => {
    setArabicFontSize(size);
    localStorage.setItem('quran_pref_arabic_size', String(size));
  };

  const handleTransFontSizeChange = (size: number) => {
    setTranslationFontSize(size);
    localStorage.setItem('quran_pref_trans_size', String(size));
  };

  // Audio Playback triggers
  const handlePlayAyah = (ayahNum: number) => {
    setActiveAyahNumber(ayahNum);
    setIsPlaying(true);
    setIsPlayerOpen(true);

    // Save to last read
    localStorage.setItem(
      'quran_last_read',
      JSON.stringify({
        surahNumber,
        ayahNumber: ayahNum,
        date: new Date().toISOString(),
      })
    );
  };

  const handleTogglePlay = () => {
    if (!isPlayerOpen) {
      setIsPlayerOpen(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextAyah = () => {
    if (activeAyahNumber < (surah?.numberOfAyahs || ayahs.length)) {
      setActiveAyahNumber((prev) => prev + 1);
    }
  };

  const handlePrevAyah = () => {
    if (activeAyahNumber > 1) {
      setActiveAyahNumber((prev) => prev - 1);
    }
  };

  // Context & Tafsir modal trigger
  const handleOpenContext = (ayahNum: number) => {
    setContextAyahNumber(ayahNum);
    setContextModalOpen(true);
  };

  // Bookmark toggle
  const toggleBookmark = (ayahNum: number) => {
    const updated = bookmarkedAyahs.includes(ayahNum)
      ? bookmarkedAyahs.filter((a) => a !== ayahNum)
      : [...bookmarkedAyahs, ayahNum];
    setBookmarkedAyahs(updated);
    localStorage.setItem(`quran_bookmarks_${surahNumber}`, JSON.stringify(updated));
  };

  // Copy Ayah Text
  const handleCopyAyah = (arabic: string, translation: string, ayahNum: number) => {
    const text = `${arabic}\n\n"${translation}"\n\n— Surah ${surah?.englishName} (${surahNumber}:${ayahNum})`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayahNum);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Jump to specific Surah
  const handleSurahJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSurah = Number(e.target.value);
    startTransition(() => {
      router.push(`/quran/${nextSurah}`);
    });
  };

  // Jump to specific Ayah
  const handleAyahJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ayahNum = Number(e.target.value);
    setActiveAyahNumber(ayahNum);
    if (verseRefs.current[ayahNum]) {
      verseRefs.current[ayahNum]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Surah navigation buttons
  const prevSurahMeta = surahNumber > 1 ? QURAN_SURAHS[surahNumber - 2] : null;
  const nextSurahMeta = surahNumber < 114 ? QURAN_SURAHS[surahNumber] : null;

  // Currently playing Ayah object
  const currentAyahObj = ayahs.find((a) => a.numberInSurah === activeAyahNumber) || ayahs[0];
  const contextAyahObj = ayahs.find((a) => a.numberInSurah === contextAyahNumber) || ayahs[0];

  return (
    <div
      className={`max-w-5xl mx-auto ${
        isPlayerOpen ? 'pb-72 sm:pb-64 md:pb-44' : 'pb-32 md:pb-20'
      } animate-fade-in select-none transition-all duration-200`}
    >
      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR (STICKY & COMPACT)                   */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border py-2 px-3 sm:px-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Main Selectors Row */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href="/quran"
                className="w-9 h-9 border border-border bg-card hover:bg-secondary rounded-[2px] text-foreground flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Back to Surah List"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* Quick Surah Dropdown Selector */}
              <select
                value={surahNumber}
                onChange={handleSurahJump}
                className="text-xs sm:text-sm font-semibold px-2 py-1.5 bg-card border border-border rounded-[2px] text-foreground focus:outline-primary cursor-pointer max-w-[160px] sm:max-w-[210px] truncate"
              >
                {QURAN_SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.english} ({s.arabic})
                  </option>
                ))}
              </select>

              {/* Quick Ayah Jump Dropdown */}
              {ayahs.length > 0 && (
                <select
                  value={activeAyahNumber}
                  onChange={handleAyahJump}
                  className="text-xs font-medium px-2 py-1.5 bg-card border border-border rounded-[2px] text-foreground focus:outline-primary cursor-pointer shrink-0"
                  title="Jump to verse"
                >
                  {ayahs.map((a) => (
                    <option key={a.numberInSurah} value={a.numberInSurah}>
                      Ayah {a.numberInSurah}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mobile Settings Toggle (Top right on mobile) */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-9 h-9 border rounded-[2px] cursor-pointer flex items-center justify-center transition-colors ${
                  isSettingsOpen
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border bg-card hover:bg-secondary text-foreground'
                }`}
                title="Reader Settings"
                aria-label="Reader Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons (Prev/Next Surah, Context, Log, Settings) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-1 sm:pt-0 border-t border-border/40 sm:border-t-0">
            {/* Previous & Next Surah Quick Nav */}
            <div className="flex items-center gap-1">
              {prevSurahMeta ? (
                <Link
                  href={`/quran/${prevSurahMeta.number}`}
                  className="px-2 py-1.5 border border-border bg-card hover:bg-secondary rounded-[2px] text-foreground text-xs flex items-center gap-1 cursor-pointer"
                  title={`Previous: Surah ${prevSurahMeta.english}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] font-medium">{prevSurahMeta.english}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextSurahMeta ? (
                <Link
                  href={`/quran/${nextSurahMeta.number}`}
                  className="px-2 py-1.5 border border-border bg-card hover:bg-secondary rounded-[2px] text-foreground text-xs flex items-center gap-1 cursor-pointer"
                  title={`Next: Surah ${nextSurahMeta.english}`}
                >
                  <span className="hidden sm:inline text-[11px] font-medium">{nextSurahMeta.english}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Surah Revelation Context Button */}
              <button
                onClick={() => handleOpenContext(1)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary rounded-[2px] cursor-pointer"
                title="Surah Revelation Context & Background"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="text-[11px]">Context</span>
              </button>

              {/* Log to Tracker Button */}
              <button
                onClick={() => setLogModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-accent bg-accent/15 hover:bg-accent/25 text-accent rounded-[2px] cursor-pointer"
                title="Log this reading to your daily tracker"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span className="text-[11px]">Log</span>
              </button>

              {/* Desktop Settings Toggle */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`hidden sm:flex items-center justify-center w-9 h-9 border rounded-[2px] cursor-pointer transition-colors ${
                  isSettingsOpen
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border bg-card hover:bg-secondary text-foreground'
                }`}
                title="Reader Settings"
                aria-label="Reader Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLLAPSIBLE SETTINGS DRAWER (SCROLLS NATURALLY WITH PAGE)*/}
      {/* ======================================================== */}
      {isSettingsOpen && (
        <div className="mb-4 p-4 bg-card border-2 border-border rounded-card animate-fade-in shadow-md">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Reader Settings</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Translation Picker */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Translation
              </label>
              <select
                value={selectedTranslation}
                onChange={(e) => handleTranslationChange(e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-background border border-border rounded-[2px] text-foreground focus:outline-primary cursor-pointer"
              >
                {TRANSLATION_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Reciter Picker */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Reciter Voice
              </label>
              <select
                value={selectedReciter}
                onChange={(e) => handleReciterChange(e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-background border border-border rounded-[2px] text-foreground focus:outline-primary cursor-pointer"
              >
                {RECITER_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode & Translation Visibility */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Reading Mode
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-[2px] border cursor-pointer ${
                    viewMode === 'cards'
                      ? 'border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border-border bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('mushaf')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-[2px] border cursor-pointer ${
                    viewMode === 'mushaf'
                      ? 'border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border-border bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span>Mushaf</span>
                </button>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`p-1.5 border rounded-[2px] cursor-pointer ${
                    showTranslation
                      ? 'border-border bg-background text-primary'
                      : 'border-border bg-secondary text-muted-foreground'
                  }`}
                  title={showTranslation ? 'Hide translation text' : 'Show translation text'}
                >
                  {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Font Sizing Controls */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Arabic Font: {arabicFontSize}px
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleArabicFontSizeChange(Math.max(20, arabicFontSize - 2))}
                  className="px-2 py-1 text-xs border border-border bg-background rounded-[2px] hover:bg-secondary cursor-pointer"
                >
                  A-
                </button>
                <input
                  type="range"
                  min={20}
                  max={48}
                  step={2}
                  value={arabicFontSize}
                  onChange={(e) => handleArabicFontSizeChange(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
                <button
                  onClick={() => handleArabicFontSizeChange(Math.min(48, arabicFontSize + 2))}
                  className="px-2 py-1 text-xs border border-border bg-background rounded-[2px] hover:bg-secondary cursor-pointer font-bold"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LOADING & ERROR STATES                                  */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-serif text-base text-foreground font-medium">
            Loading Surah {surahNumber}...
          </p>
          <p className="text-xs text-muted-foreground">
            Fetching authentic Arabic script & translation
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-card text-center space-y-3">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-[2px] cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* SURAH HEADER ORNAMENT BANNER                            */}
          {/* ======================================================== */}
          <div className="relative mb-6 p-5 sm:p-8 bg-card border-2 border-border rounded-card text-center overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />

            <div className="relative z-10 space-y-3">
              {/* Surah Number & Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 border border-border bg-secondary text-accent font-semibold text-xs rounded-[2px]">
                  Surah {surah?.number}
                </span>
                <span className="px-2.5 py-0.5 border border-border bg-secondary text-muted-foreground font-semibold text-xs rounded-[2px]">
                  {surah?.revelationType} · {surah?.numberOfAyahs} Verses
                </span>
              </div>

              {/* Surah Names */}
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-primary tracking-wide py-1">
                {surah?.name}
              </h1>
              <p className="font-serif text-lg sm:text-xl font-bold text-foreground">
                {surah?.englishName}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground italic">
                &ldquo;{surah?.englishNameTranslation}&rdquo;
              </p>

              {/* Play full surah & Surah context triggers */}
              <div className="pt-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => handlePlayAyah(1)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-[2px] cursor-pointer transition-colors shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Full Surah</span>
                </button>

                <button
                  onClick={() => handleOpenContext(1)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border bg-secondary hover:bg-border text-foreground text-xs sm:text-sm font-semibold rounded-[2px] cursor-pointer transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Surah Background & Context</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BISMILLAH BANNER                                        */}
          {/* Omitted for Surah 9 (At-Tawbah); for Surah 1, Bismillah is verse 1 */}
          {/* ======================================================== */}
          {surahNumber !== 9 && surahNumber !== 1 && (
            <div className="mb-6 p-4 bg-secondary/60 border border-border rounded-card text-center">
              <p
                dir="rtl"
                className="font-serif text-2xl sm:text-3xl text-primary font-bold tracking-wide"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                In the name of Allah, the Entirely Merciful, the Especially Merciful
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* READING VIEW: CARD VIEW                                 */}
          {/* ======================================================== */}
          {viewMode === 'cards' && (
            <div className="space-y-4">
              {ayahs.map((ayah) => {
                const isActive = activeAyahNumber === ayah.numberInSurah;
                const isBookmarked = bookmarkedAyahs.includes(ayah.numberInSurah);
                const displayArabic = cleanAyahText(ayah.textArabic, surahNumber, ayah.numberInSurah);

                return (
                  <div
                    key={ayah.numberInSurah}
                    ref={(el) => {
                      verseRefs.current[ayah.numberInSurah] = el;
                    }}
                    className={`p-4 sm:p-5 rounded-card border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-primary bg-primary/[0.04] shadow-md ring-1 ring-primary/30'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    {/* Verse Header Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs gap-2">
                      {/* Left: Ayah number & badges */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 border rounded-[2px] font-serif font-bold text-xs flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-secondary text-foreground border-border'
                          }`}
                        >
                          {ayah.numberInSurah}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {surahNumber}:{ayah.numberInSurah}
                        </span>
                        {ayah.sajda && (
                          <span className="px-1.5 py-0.2 bg-holiday/20 text-holiday text-[10px] font-bold rounded-[2px]">
                            Sajdah
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          Juz {ayah.juz} · Page {ayah.page}
                        </span>
                      </div>

                      {/* Right: Actions (Listen, Tafsir, Copy, Bookmark) */}
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {/* Play/Listen Verse */}
                        <button
                          onClick={() => handlePlayAyah(ayah.numberInSurah)}
                          className={`p-1.5 sm:px-2 sm:py-1 border rounded-[2px] cursor-pointer transition-colors flex items-center gap-1 text-xs ${
                            isActive && isPlaying
                              ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                              : 'border-border bg-card hover:bg-secondary text-primary'
                          }`}
                          title="Listen to this verse"
                          aria-label="Listen to this verse"
                        >
                          {isActive && isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span className="text-[10px] hidden sm:inline">Playing</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current ml-0.2" />
                              <span className="text-[10px] hidden sm:inline">Play</span>
                            </>
                          )}
                        </button>

                        {/* Context / Tafsir Button */}
                        <button
                          onClick={() => handleOpenContext(ayah.numberInSurah)}
                          className="flex items-center gap-1 px-2 py-1.5 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] rounded-[2px] cursor-pointer transition-colors"
                          title="View Verse Context & Tafsir commentary"
                        >
                          <Sparkles className="w-3 h-3 text-accent" />
                          <span>Tafsir</span>
                        </button>

                        {/* Copy verse */}
                        <button
                          onClick={() =>
                            handleCopyAyah(
                              displayArabic,
                              ayah.textTranslation,
                              ayah.numberInSurah
                            )
                          }
                          className="p-1.5 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer transition-colors"
                          title="Copy verse and translation"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => toggleBookmark(ayah.numberInSurah)}
                          className={`p-1.5 border rounded-[2px] cursor-pointer transition-colors ${
                            isBookmarked
                              ? 'border-accent bg-accent/20 text-accent font-bold'
                              : 'border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div className="py-4 select-text">
                      <p
                        dir="rtl"
                        className="font-serif text-foreground text-right leading-[2.5] sm:leading-[2.7] font-normal"
                        style={{
                          fontSize: `${arabicFontSize}px`,
                          wordSpacing: '2px',
                        }}
                      >
                        {displayArabic}{' '}
                        <span className="font-serif text-accent font-bold text-[0.8em] select-none mx-1.5 inline-block align-middle">
                          ﴿{toArabicNumerals(ayah.numberInSurah)}﴾
                        </span>
                      </p>
                    </div>

                    {/* Translation Text */}
                    {showTranslation && ayah.textTranslation && (
                      <div className="pt-2.5 border-t border-border/40 select-text">
                        <p
                          className="text-foreground/90 leading-relaxed font-sans"
                          style={{ fontSize: `${translationFontSize}px` }}
                        >
                          {ayah.textTranslation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* READING VIEW: CONTINUOUS MUSHAF FLOW                    */}
          {/* ======================================================== */}
          {viewMode === 'mushaf' && (
            <div className="p-5 sm:p-8 bg-card border-2 border-border rounded-card select-text">
              <div
                dir="rtl"
                className="font-serif text-foreground text-justify leading-[2.6] sm:leading-[2.8]"
                style={{ fontSize: `${arabicFontSize}px` }}
              >
                {ayahs.map((ayah) => {
                  const isActive = activeAyahNumber === ayah.numberInSurah;
                  const displayArabic = cleanAyahText(ayah.textArabic, surahNumber, ayah.numberInSurah);

                  return (
                    <span
                      key={ayah.numberInSurah}
                      ref={(el) => {
                        verseRefs.current[ayah.numberInSurah] = el;
                      }}
                      onClick={() => handlePlayAyah(ayah.numberInSurah)}
                      onDoubleClick={() => handleOpenContext(ayah.numberInSurah)}
                      className={`inline transition-colors duration-150 cursor-pointer rounded-xs px-1 ${
                        isActive
                          ? 'bg-primary/20 text-primary font-medium ring-2 ring-primary/40'
                          : 'hover:bg-secondary'
                      }`}
                      title={`Ayah ${ayah.numberInSurah} (Click to play, Double-click for Tafsir)`}
                    >
                      {displayArabic}{' '}
                      <span className="text-accent font-bold text-[0.85em] select-none mx-1.5 inline-block align-middle">
                        ﴿{toArabicNumerals(ayah.numberInSurah)}﴾
                      </span>{' '}
                    </span>
                  );
                })}
              </div>

              {/* Quick Info underneath Mushaf view */}
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Click any ayah to listen · Double-click for scholarly Tafsir</span>
                <span>Page {ayahs[0]?.page || 1}</span>
              </div>
            </div>
          )}

          {/* Bottom Next/Previous Surah Navigation Bar */}
          <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-border">
            {prevSurahMeta ? (
              <Link
                href={`/quran/${prevSurahMeta.number}`}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-border bg-card hover:bg-secondary text-foreground text-xs sm:text-sm font-semibold rounded-[2px] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>
                  {prevSurahMeta.number}. {prevSurahMeta.english}
                </span>
              </Link>
            ) : (
              <div />
            )}

            <button
              onClick={handleScrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-secondary text-xs text-muted-foreground hover:text-foreground font-semibold rounded-[2px] cursor-pointer transition-colors"
              title="Scroll back to the top of the Surah"
            >
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
              <span>Back to Top</span>
            </button>

            {nextSurahMeta ? (
              <Link
                href={`/quran/${nextSurahMeta.number}`}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-border bg-card hover:bg-secondary text-foreground text-xs sm:text-sm font-semibold rounded-[2px] cursor-pointer"
              >
                <span>
                  {nextSurahMeta.number}. {nextSurahMeta.english}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* FLOATING QUICK BACK TO TOP BUTTON (WHEN SCROLLED)       */}
      {/* ======================================================== */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className={`fixed z-30 flex items-center gap-1.5 px-3.5 py-2 bg-card border-2 border-border hover:border-primary text-foreground text-xs font-semibold rounded-full shadow-xl transition-all duration-200 cursor-pointer ${
            isPlayerOpen
              ? 'bottom-36 md:bottom-24 right-4 sm:right-6'
              : 'bottom-20 md:bottom-6 right-4 sm:right-6'
          }`}
          title="Scroll back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Top</span>
        </button>
      )}

      {/* ======================================================== */}
      {/* AUDIO PLAYER BAR                                        */}
      {/* ======================================================== */}
      {isPlayerOpen && surah && currentAyahObj && (
        <AudioPlayerBar
          surahNumber={surahNumber}
          surahEnglishName={surah.englishName}
          surahArabicName={surah.name}
          currentAyahNumber={activeAyahNumber}
          totalAyahs={surah.numberOfAyahs}
          currentAudioUrl={currentAyahObj.audioUrl}
          isPlaying={isPlaying}
          selectedReciter={selectedReciter}
          autoScroll={autoScroll}
          onTogglePlay={handleTogglePlay}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          onSelectAyah={(num) => handlePlayAyah(num)}
          onReciterChange={handleReciterChange}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onClose={() => {
            setIsPlaying(false);
            setIsPlayerOpen(false);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* VERSE CONTEXT & TAFSIR MODAL                            */}
      {/* ======================================================== */}
      {contextModalOpen && surah && contextAyahObj && (
        <VerseContextModal
          isOpen={contextModalOpen}
          onClose={() => setContextModalOpen(false)}
          surahNumber={surahNumber}
          surahEnglishName={surah.englishName}
          surahArabicName={surah.name}
          ayahNumber={contextAyahNumber}
          arabicText={cleanAyahText(contextAyahObj.textArabic, surahNumber, contextAyahNumber)}
          translationText={contextAyahObj.textTranslation}
          onPlayAyah={(num) => {
            setContextModalOpen(false);
            handlePlayAyah(num);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* LOG RECITATION MODAL                                    */}
      {/* ======================================================== */}
      {logModalOpen && surah && (
        <LogRecitationModal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          surahNumber={surahNumber}
          surahEnglishName={surah.englishName}
          surahArabicName={surah.name}
          totalVerses={surah.numberOfAyahs}
          currentAyahNumber={activeAyahNumber}
        />
      )}
    </div>
  );
}
