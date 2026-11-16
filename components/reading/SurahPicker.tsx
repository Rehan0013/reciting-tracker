'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SURAHS } from '@/lib/surahs';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SurahPickerProps {
  value: string; // Current english name
  onChange: (surah: { english: string; arabic: string }) => void;
  excludeSurahs?: string[]; // English names or Arabic names of surahs to exclude
}

export default function SurahPicker({ value, onChange, excludeSurahs }: SurahPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter surahs based on query (by number, English, or Arabic) and exclude already selected surahs
  const filteredSurahs = useMemo(() => {
    const excludeSet = new Set(
      (excludeSurahs || [])
        .map((name) => name?.toLowerCase().trim())
        .filter(Boolean)
    );

    const available = SURAHS.filter((s) => {
      // If this surah matches the current picker's value, keep it visible
      if (value && s.english.toLowerCase() === value.toLowerCase().trim()) {
        return true;
      }
      return !excludeSet.has(s.english.toLowerCase().trim()) && !excludeSet.has(s.arabic.trim());
    });

    if (!search.trim()) return available;
    const query = search.toLowerCase().trim();
    return available.filter(
      (s) =>
        s.number.toString() === query ||
        s.english.toLowerCase().includes(query) ||
        s.meaning.toLowerCase().includes(query) ||
        s.arabic.includes(query)
    );
  }, [search, excludeSurahs, value]);

  // Find currently selected surah details
  const selectedSurah = useMemo(() => {
    return SURAHS.find((s) => s.english.toLowerCase() === value.toLowerCase());
  }, [value]);

  const handleSelect = (surah: typeof SURAHS[number]) => {
    onChange({ english: surah.english, arabic: surah.arabic });
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-medium text-foreground mb-1 select-none">
        select surah
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen) setSearch('');
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between border border-border bg-background px-3.5 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-left cursor-pointer min-h-[44px]"
      >
        {selectedSurah ? (
          <span className="flex items-center justify-between w-full">
            <span>
              {selectedSurah.number} · {selectedSurah.english}
            </span>
            <span className="font-arabic text-primary font-bold text-sm">
              {selectedSurah.arabic}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">search surah...</span>
        )}
        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-card border-2 border-border z-30 max-h-[260px] flex flex-col rounded-card">
          {/* Search Input Box */}
          <div className="p-2 border-b border-border flex items-center gap-2 shrink-0 bg-secondary/50">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="type surah name, number..."
              className="w-full bg-transparent border-0 text-sm text-foreground focus:outline-none py-1"
              autoFocus
            />
          </div>

          {/* Results List */}
          <ul className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah) => {
                const isSelected = selectedSurah?.number === surah.number;
                return (
                  <li key={surah.number}>
                    <button
                      type="button"
                      onClick={() => handleSelect(surah)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-secondary cursor-pointer focus:outline-none min-h-[44px] ${
                        isSelected ? 'bg-secondary font-semibold text-primary' : 'text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {surah.number}.
                        </span>
                        <span>{surah.english}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({surah.meaning.toLowerCase()})
                        </span>
                      </span>
                      <span className="flex items-center gap-3 font-arabic text-primary font-bold text-sm">
                        {surah.arabic}
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3.5 py-4 text-center text-xs text-muted-foreground">
                {search.trim() ? 'no surahs match your search' : 'no other surahs available'}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
