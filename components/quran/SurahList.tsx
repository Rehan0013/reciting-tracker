'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  Compass,
  X,
} from 'lucide-react';
import { QURAN_SURAHS, JUZ_LIST, SurahMeta } from '@/lib/quranData';

export default function SurahList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan' | 'juz'>('all');
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    ayahNumber: number;
    date: string;
  } | null>(null);

  // Load last read position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quran_last_read');
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Filter surahs based on query and revelation type
  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter((surah) => {
      // Type filter
      if (filterType === 'meccan' && surah.revelation !== 'Meccan') return false;
      if (filterType === 'medinan' && surah.revelation !== 'Medinan') return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const matchNumber = String(surah.number) === q;
      const matchEnglish = surah.english.toLowerCase().includes(q);
      const matchMeaning = surah.meaning.toLowerCase().includes(q);
      const matchArabic = surah.arabic.includes(q);

      return matchNumber || matchEnglish || matchMeaning || matchArabic;
    });
  }, [searchQuery, filterType]);

  const lastReadSurahMeta = lastRead ? QURAN_SURAHS[lastRead.surahNumber - 1] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in select-none">
      {/* ======================================================== */}
      {/* HERO / WELCOME HEADER                                   */}
      {/* ======================================================== */}
      <div className="relative p-6 sm:p-8 bg-card border-2 border-border rounded-card overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-[2px]">
                The Holy Quran
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                القرآن الكريم
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Read, Listen & Reflect
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Immerse yourself in authentic Uthmani scripture with word-by-word accuracy, multi-language translations, scholarly Tafsir context, and world-renowned recitations.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3 py-2 bg-secondary border border-border rounded-[2px] text-center min-w-[70px]">
              <span className="block font-serif font-bold text-base sm:text-lg text-primary">114</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Surahs</span>
            </div>
            <div className="px-3 py-2 bg-secondary border border-border rounded-[2px] text-center min-w-[70px]">
              <span className="block font-serif font-bold text-base sm:text-lg text-accent">6,236</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ayahs</span>
            </div>
            <div className="px-3 py-2 bg-secondary border border-border rounded-[2px] text-center min-w-[70px]">
              <span className="block font-serif font-bold text-base sm:text-lg text-foreground">30</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Juz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTINUE READING QUICK BANNER                           */}
      {/* ======================================================== */}
      {lastReadSurahMeta && (
        <div className="p-4 bg-secondary/70 border-2 border-accent/40 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-accent bg-accent/15 text-accent flex items-center justify-center rounded-[2px] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Continue Reading
              </span>
              <h2 className="font-serif font-bold text-base text-foreground">
                Surah {lastReadSurahMeta.english} · Ayah {lastRead?.ayahNumber || 1}
              </h2>
              <p className="text-xs text-muted-foreground">
                {lastReadSurahMeta.meaning} · {lastReadSurahMeta.arabic}
              </p>
            </div>
          </div>

          <Link
            href={`/quran/${lastReadSurahMeta.number}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-[2px] cursor-pointer transition-colors shadow-xs w-full sm:w-auto justify-center"
          >
            <span>Resume Reading</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEARCH BAR & FILTER TABS                                */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Surah name, number, or meaning..."
            className="w-full pl-9 pr-9 py-2 bg-card border border-border rounded-[2px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-[2px] border cursor-pointer transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            All (114)
          </button>
          <button
            onClick={() => setFilterType('meccan')}
            className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-[2px] border cursor-pointer transition-colors whitespace-nowrap ${
              filterType === 'meccan'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            Meccan (86)
          </button>
          <button
            onClick={() => setFilterType('medinan')}
            className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-[2px] border cursor-pointer transition-colors whitespace-nowrap ${
              filterType === 'medinan'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            Medinan (28)
          </button>
          <button
            onClick={() => setFilterType('juz')}
            className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-[2px] border cursor-pointer transition-colors whitespace-nowrap ${
              filterType === 'juz'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            Juz Index (30)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* JUZ VIEW (When Juz tab selected)                         */}
      {/* ======================================================== */}
      {filterType === 'juz' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {JUZ_LIST.map((j) => {
            const startSurah = QURAN_SURAHS[j.startSurah - 1];
            return (
              <Link
                key={j.juz}
                href={`/quran/${j.startSurah}`}
                className="group p-4 bg-card hover:bg-secondary border-2 border-border hover:border-primary/50 rounded-card transition-all flex items-center justify-between cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-primary/30 bg-primary/10 text-primary font-serif font-bold text-sm rounded-[2px] flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    {j.juz}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      Juz {j.juz} · {j.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Starts at Surah {startSurah?.english} ({j.startSurah}:{j.startAyah})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif text-lg text-primary font-bold">
                    {j.arabic}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* SURAH CARDS GRID                                        */
        /* ======================================================== */
        <div>
          {filteredSurahs.length === 0 ? (
            <div className="py-16 text-center space-y-2 border-2 border-dashed border-border rounded-card">
              <Compass className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-serif text-base font-bold text-foreground">
                No Surah found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different spelling, Surah number, or meaning.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSurahs.map((surah) => {
                const isRecent = lastRead?.surahNumber === surah.number;

                return (
                  <Link
                    key={surah.number}
                    href={`/quran/${surah.number}`}
                    className={`group p-4 bg-card hover:bg-secondary border-2 transition-all duration-150 rounded-card flex items-center justify-between cursor-pointer shadow-xs ${
                      isRecent
                        ? 'border-accent/60 bg-accent/5 ring-1 ring-accent/30'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Left: Number & English details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 border border-border bg-secondary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground text-foreground font-serif font-bold text-xs sm:text-sm rounded-[2px] flex items-center justify-center transition-colors shrink-0">
                        {String(surah.number).padStart(3, '0')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-serif font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {surah.english}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {surah.meaning}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 border border-border bg-background text-muted-foreground font-semibold rounded-[2px]">
                            {surah.revelation}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {surah.verses} Verses
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arabic calligraphy title */}
                    <div className="text-right pl-3 shrink-0">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-primary group-hover:scale-105 transition-transform inline-block">
                        {surah.arabic}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
