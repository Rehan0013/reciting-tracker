'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Info, Copy, Check, Volume2, Sparkles, Loader2, BookText } from 'lucide-react';
import { TAFSIR_OPTIONS, TafsirOption } from '@/lib/quranData';

interface VerseContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahEnglishName: string;
  surahArabicName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  onPlayAyah?: (ayahNumber: number) => void;
}

export default function VerseContextModal({
  isOpen,
  onClose,
  surahNumber,
  surahEnglishName,
  surahArabicName,
  ayahNumber,
  arabicText,
  translationText,
  onPlayAyah,
}: VerseContextModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tafsir' | 'surahContext'>('tafsir');
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(169); // Default: Ibn Kathir
  const [loading, setLoading] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [tafsirTitle, setTafsirTitle] = useState<string>('');
  const [surahBackground, setSurahBackground] = useState<{ shortText: string; text: string; source: string }>({
    shortText: '',
    text: '',
    source: '',
  });
  const [copied, setCopied] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch Tafsir & Surah Context when opened or ayah/tafsir changes
  useEffect(() => {
    if (!isOpen || !surahNumber || !ayahNumber) return;

    let isMounted = true;
    setLoading(true);

    const fetchContext = async () => {
      try {
        const res = await fetch(
          `/api/quran/tafsir?surah=${surahNumber}&ayah=${ayahNumber}&tafsirId=${selectedTafsirId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.ok) {
            setTafsirContent(data.tafsir?.text || 'No tafsir available for this ayah.');
            setTafsirTitle(data.tafsir?.resourceName || 'Tafsir');
            setSurahBackground({
              shortText: data.surahContext?.shortText || '',
              text: data.surahContext?.text || '',
              source: data.surahContext?.source || 'Tafhim al-Qur\'an',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load verse context:', err);
        if (isMounted) {
          setTafsirContent('Failed to load commentary. Please check your internet connection and try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContext();

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber, ayahNumber, selectedTafsirId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    // Strip HTML tags for clean clipboard copying
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tafsirContent;
    const cleanTafsir = tempDiv.textContent || tempDiv.innerText || '';

    const shareText = `Surah ${surahEnglishName} (${surahNumber}:${ayahNumber})\n\n` +
      `Arabic:\n${arabicText}\n\n` +
      `Translation:\n${translationText}\n\n` +
      `Tafsir (${tafsirTitle}):\n${cleanTafsir.slice(0, 1500)}${cleanTafsir.length > 1500 ? '...' : ''}\n\n` +
      `Read on Quran Tracker`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl max-h-[85dvh] sm:max-h-[90vh] bg-card border-2 border-border rounded-card flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-secondary shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-primary/30 bg-primary/10 text-primary rounded-[2px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-foreground">
                  Verse Context & Tafsir
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-[2px]">
                  {surahNumber}:{ayahNumber}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Surah {surahEnglishName} · {surahArabicName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPlayAyah && (
              <button
                onClick={() => onPlayAyah(ayahNumber)}
                className="p-2 border border-border bg-card hover:bg-secondary text-primary rounded-[2px] cursor-pointer"
                title="Listen to this verse"
                aria-label="Listen to this verse"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground rounded-[2px] cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Verse Banner (Arabic & Translation) */}
        <div className="px-4 sm:px-6 py-3 bg-card border-b border-border space-y-2 shrink-0">
          <p
            dir="rtl"
            className="font-serif text-foreground text-right text-lg sm:text-xl leading-relaxed select-text"
          >
            {arabicText}
          </p>
          <p className="text-xs sm:text-sm text-foreground/80 leading-normal italic select-text">
            &ldquo;{translationText}&rdquo;
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 border-b border-border bg-secondary/50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('tafsir')}
                className={`flex items-center gap-1.5 py-2 px-2.5 border-b-2 font-medium text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'tafsir'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Verse Tafsir</span>
              </button>

              <button
                onClick={() => setActiveTab('surahContext')}
                className={`flex items-center gap-1.5 py-2 px-2.5 border-b-2 font-medium text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'surahContext'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Surah Context</span>
              </button>
            </div>

            {/* Tafsir Selector Dropdown (when on Tafsir tab) */}
            {activeTab === 'tafsir' && (
              <div className="flex items-center justify-between sm:justify-end gap-2 pb-1.5 sm:pb-0">
                <span className="text-xs text-muted-foreground shrink-0">Scholar:</span>
                <select
                  value={selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="text-xs px-2 py-1 bg-card border border-border rounded-[2px] text-foreground focus:outline-primary cursor-pointer max-w-[200px] truncate"
                >
                  {TAFSIR_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 select-text bg-background">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs sm:text-sm font-medium">Loading commentary from scholarly sources...</p>
            </div>
          ) : activeTab === 'tafsir' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Commentary · {tafsirTitle}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Font:</span>
                  <button
                    onClick={() => setFontSizeOffset((prev) => Math.max(-2, prev - 1))}
                    className="w-6 h-6 border border-border bg-card rounded-[2px] flex items-center justify-center hover:bg-secondary cursor-pointer"
                    title="Decrease font size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSizeOffset((prev) => Math.min(6, prev + 1))}
                    className="w-6 h-6 border border-border bg-card rounded-[2px] flex items-center justify-center hover:bg-secondary cursor-pointer font-bold"
                    title="Increase font size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Tafsir Rendered Content */}
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-3"
                style={{ fontSize: `${14 + fontSizeOffset}px` }}
                dangerouslySetInnerHTML={{ __html: tafsirContent }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="pb-2 border-b border-border/50">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Historical Context & Revelation Background
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Source: {surahBackground.source || 'Tafhim al-Qur\'an'}
                </p>
              </div>

              {surahBackground.shortText && (
                <div className="p-3.5 bg-secondary border-l-2 border-primary rounded-[2px] text-sm text-foreground leading-relaxed">
                  {surahBackground.shortText}
                </div>
              )}

              {surahBackground.text ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: surahBackground.text }}
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Detailed revelation notes for this chapter are currently being indexed.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-border bg-card flex items-center justify-between shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-secondary hover:bg-border text-foreground rounded-[2px] cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Verse & Tafsir</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2px] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
