'use client';

import { useState, useEffect } from 'react';
import SurahPicker from './SurahPicker';
import DhikrPicker from './DhikrPicker';
import { Plus, Minus, Loader, Save, Trash2 } from 'lucide-react';

interface ReadingType {
  label: string;
  unit: string;
  isActive: boolean;
  isCustom: boolean;
}

interface ReadingEntryFormProps {
  dateStr: string; // "YYYY-MM-DD"
  hijriDetails: {
    hijriDate: string;
    hijriDay: number;
    hijriMonth: number;
    hijriMonthName: string;
    hijriYear: number;
    gregorianMonth: number;
    gregorianYear: number;
  } | null;
  activeTypes: ReadingType[];
  onSaveSuccess: () => void;
}

interface SurahLogItem {
  id: string;
  name: string;
  nameArabic: string;
  count: number;
}

interface DhikrLogItem {
  id: string;
  name: string;
  count: number;
}

interface DuaLogItem {
  id: string;
  name: string;
  count: number;
}

const SALAH_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function ReadingEntryForm({
  dateStr,
  hijriDetails,
  activeTypes,
  onSaveSuccess,
}: ReadingEntryFormProps) {
  // Filter active types
  const enabledTypes = activeTypes.filter((t) => t.isActive);

  // Unique local ID generator
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // -------------------------------------------------------------
  // States for all trackable categories
  // -------------------------------------------------------------
  
  // Salah checkboxes
  const [salahChecked, setSalahChecked] = useState<Record<string, boolean>>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });
  const [isQadha, setIsQadha] = useState(false);

  // Dynamic lists for Surahs, Dhikrs, and Duas
  const [surahs, setSurahs] = useState<SurahLogItem[]>([
    { id: generateId(), name: '', nameArabic: '', count: 0 }
  ]);

  const [dhikrs, setDhikrs] = useState<DhikrLogItem[]>([
    { id: generateId(), name: 'SubhanAllah', count: 0 }
  ]);

  const [duas, setDuas] = useState<DuaLogItem[]>([
    { id: generateId(), name: 'Morning Dua', count: 0 }
  ]);

  // Single value states
  const [pagesCount, setPagesCount] = useState(0);
  const [juzNumber, setJuzNumber] = useState(1);
  const [juzCount, setJuzCount] = useState(0);
  const [tahajjudCount, setTahajjudCount] = useState(0);

  // Custom types states: label -> count
  const [customCounts, setCustomCounts] = useState<Record<string, number>>({});

  // Global notes & form statuses
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize custom counts mapping
  useEffect(() => {
    const initialCustoms: Record<string, number> = {};
    enabledTypes.forEach((t) => {
      if (t.isCustom) {
        initialCustoms[t.label] = 0;
      }
    });
    setCustomCounts(initialCustoms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTypes]);

  // -------------------------------------------------------------
  // List management helpers
  // -------------------------------------------------------------

  // Surahs
  const addSurahItem = () => {
    setSurahs([...surahs, { id: generateId(), name: '', nameArabic: '', count: 0 }]);
  };
  const removeSurahItem = (id: string) => {
    setSurahs(surahs.filter((item) => item.id !== id));
  };
  const updateSurahItem = (id: string, updates: Partial<SurahLogItem>) => {
    setSurahs(
      surahs.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // Dhikrs
  const addDhikrItem = () => {
    setDhikrs([...dhikrs, { id: generateId(), name: 'SubhanAllah', count: 0 }]);
  };
  const removeDhikrItem = (id: string) => {
    setDhikrs(dhikrs.filter((item) => item.id !== id));
  };
  const updateDhikrItem = (id: string, updates: Partial<DhikrLogItem>) => {
    setDhikrs(
      dhikrs.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // Duas
  const addDuaItem = () => {
    setDuas([...duas, { id: generateId(), name: 'Morning Dua', count: 0 }]);
  };
  const removeDuaItem = (id: string) => {
    setDuas(duas.filter((item) => item.id !== id));
  };
  const updateDuaItem = (id: string, updates: Partial<DuaLogItem>) => {
    setDuas(
      duas.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // -------------------------------------------------------------
  // Stepper helper
  // -------------------------------------------------------------
  const renderStepper = (
    value: number,
    onChange: (val: number) => void,
    min = 0,
    unit = ''
  ) => {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 border border-border bg-card hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none select-none shrink-0"
        >
          <Minus className="w-4 h-4 text-foreground" />
        </button>
        <input
          type="number"
          min={min}
          value={value === 0 ? '' : value}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Number(e.target.value);
            onChange(Math.max(min, val));
          }}
          placeholder="0"
          className="w-16 border border-border bg-background py-1 text-center text-sm font-bold rounded-[2px] min-h-[40px] focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 border border-border bg-card hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer focus:outline-none select-none shrink-0"
        >
          <Plus className="w-4 h-4 text-foreground" />
        </button>
        {unit && (
          <span className="text-xs text-muted-foreground ml-1 font-semibold">
            {unit.toLowerCase()}
          </span>
        )}
      </div>
    );
  };

  // Helper check if a type is active
  const isTypeActive = (label: string) => {
    return enabledTypes.some((t) => t.label.toLowerCase() === label.toLowerCase());
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hijriDetails) {
      setError('Calendar date data is loading...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entriesToPost: any[] = [];

      // 1. Compile Salah entries
      if (isTypeActive('Salah')) {
        const checkedSalah = Object.keys(salahChecked).filter((s) => salahChecked[s]);
        checkedSalah.forEach((salahName) => {
          entriesToPost.push({
            type: 'Salah',
            name: salahName,
            count: 1,
            notes: isQadha ? 'qadha' : notes || undefined,
          });
        });
      }

      // 2. Compile Surahs
      if (isTypeActive('Surah')) {
        for (const item of surahs) {
          if (item.count > 0) {
            if (!item.name) {
              setError('Please select a surah for all chapter fields that have counts.');
              setLoading(false);
              return;
            }
            entriesToPost.push({
              type: 'Surah',
              name: item.name,
              nameArabic: item.nameArabic || undefined,
              count: item.count,
              notes: notes || undefined,
            });
          }
        }
      }

      // 3. Compile Pages entry
      if (isTypeActive('Quran Pages') && pagesCount > 0) {
        entriesToPost.push({
          type: 'Quran Pages',
          name: 'Pages',
          count: pagesCount,
          notes: notes || undefined,
        });
      }

      // 4. Compile Juz entry
      if (isTypeActive('Juz') && juzCount > 0) {
        entriesToPost.push({
          type: 'Juz',
          name: `Juz ${juzNumber}`,
          count: juzCount,
          notes: notes || undefined,
        });
      }

      // 5. Compile Dhikrs
      if (isTypeActive('Dhikr')) {
        for (const item of dhikrs) {
          if (item.count > 0) {
            entriesToPost.push({
              type: 'Dhikr',
              name: item.name || 'SubhanAllah',
              count: item.count,
              notes: notes || undefined,
            });
          }
        }
      }

      // 6. Compile Duas
      if (isTypeActive('Dua')) {
        for (const item of duas) {
          if (item.count > 0) {
            entriesToPost.push({
              type: 'Dua',
              name: item.name || 'Morning Dua',
              count: item.count,
              notes: notes || undefined,
            });
          }
        }
      }

      // 7. Compile Tahajjud entry
      if (isTypeActive('Tahajjud') && tahajjudCount > 0) {
        entriesToPost.push({
          type: 'Tahajjud',
          name: 'Tahajjud',
          count: tahajjudCount,
          notes: notes || undefined,
        });
      }

      // 8. Compile Custom types entries
      enabledTypes.forEach((t) => {
        if (t.isCustom) {
          const countVal = customCounts[t.label] || 0;
          if (countVal > 0) {
            entriesToPost.push({
              type: t.label,
              name: t.label,
              count: countVal,
              notes: notes || undefined,
            });
          }
        }
      });

      if (entriesToPost.length === 0) {
        setError('Please enter count/check items for at least one active type to log.');
        setLoading(false);
        return;
      }

      // 9. Send batch post request to server
      const payload = {
        date: dateStr,
        ...hijriDetails,
        entry: entriesToPost,
      };

      const res = await fetch('/api/reading-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to save entries');
      }

      // Reset form variables
      setSalahChecked({
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
      });
      setIsQadha(false);
      setPagesCount(0);
      setJuzCount(0);
      setTahajjudCount(0);
      setNotes('');
      
      // Reset lists to 1 empty row
      setSurahs([{ id: generateId(), name: '', nameArabic: '', count: 0 }]);
      setDhikrs([{ id: generateId(), name: 'SubhanAllah', count: 0 }]);
      setDuas([{ id: generateId(), name: 'Morning Dua', count: 0 }]);

      const resetCustoms: Record<string, number> = {};
      Object.keys(customCounts).forEach((key) => {
        resetCustoms[key] = 0;
      });
      setCustomCounts(resetCustoms);

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-5 select-none">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-[2px] leading-tight">
          {error}
        </div>
      )}

      {/* Render all active options in a vertical list */}
      <div className="space-y-4">
        
        {/* 1. Salah Section */}
        {isTypeActive('Salah') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 space-y-3">
            <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
              🕌 prayers (salah)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {SALAH_LIST.map((salah) => (
                <label
                  key={salah}
                  className="flex items-center gap-2 cursor-pointer text-xs font-medium min-h-[44px] sm:min-h-0 select-none"
                >
                  <input
                    type="checkbox"
                    checked={salahChecked[salah]}
                    onChange={(e) =>
                      setSalahChecked({ ...salahChecked, [salah]: e.target.checked })
                    }
                    className="w-5 h-5 rounded-[2px] border-border text-primary focus:ring-primary"
                  />
                  <span>{salah.toLowerCase()}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-border/40 pt-2 flex items-center justify-between">
              <label
                htmlFor="is-qadha-log"
                className="flex items-center gap-2 cursor-pointer text-[10px] font-semibold text-muted-foreground min-h-[36px] select-none"
              >
                <input
                  id="is-qadha-log"
                  type="checkbox"
                  checked={isQadha}
                  onChange={(e) => setIsQadha(e.target.checked)}
                  className="w-4 h-4 rounded-[2px] border-border text-primary focus:ring-primary"
                />
                <span>mark checked prayers as qadha</span>
              </label>
            </div>
          </div>
        )}

        {/* 2. Surah Section */}
        {isTypeActive('Surah') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 space-y-3">
            <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
              📖 chapters (surah)
            </h4>
            <div className="space-y-4">
              {surahs.map((item) => (
                <div key={item.id} className="space-y-2 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <SurahPicker
                        value={item.name}
                        onChange={(surah) => {
                          updateSurahItem(item.id, { name: surah.english, nameArabic: surah.arabic });
                          if (item.count === 0) updateSurahItem(item.id, { count: 1 });
                        }}
                      />
                    </div>
                    {surahs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSurahItem(item.id)}
                        className="w-10 h-10 border border-red-200 bg-background hover:bg-red-50 text-red-600 flex items-center justify-center rounded-[2px] mt-6 shrink-0 cursor-pointer"
                        title="Remove surah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground font-semibold">read count:</span>
                    {renderStepper(item.count, (val) => updateSurahItem(item.id, { count: val }), 0, 'times')}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSurahItem}
                className="w-full py-2 border border-border border-dashed bg-background hover:bg-secondary text-xs text-primary font-bold rounded-[2px] cursor-pointer"
              >
                + add another surah
              </button>
            </div>
          </div>
        )}

        {/* 3. Pages Section */}
        {isTypeActive('Quran Pages') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
                📄 quran pages
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">amount read today</p>
            </div>
            {renderStepper(pagesCount, setPagesCount, 0, 'pages')}
          </div>
        )}

        {/* 4. Juz Section */}
        {isTypeActive('Juz') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 space-y-3">
            <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
              🔖 juz parts
            </h4>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label htmlFor="juz-num" className="text-xs text-muted-foreground font-semibold">no.</label>
                <select
                  id="juz-num"
                  value={juzNumber}
                  onChange={(e) => {
                    setJuzNumber(Number(e.target.value));
                    if (juzCount === 0) setJuzCount(1);
                  }}
                  className="border border-border bg-background px-2 py-1.5 text-xs rounded-[2px] focus:outline-none focus:border-primary min-h-[36px]"
                >
                  {Array.from({ length: 30 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      juz {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
              {renderStepper(juzCount, setJuzCount, 0, 'times')}
            </div>
          </div>
        )}

        {/* 5. Dhikr Section */}
        {isTypeActive('Dhikr') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 space-y-3.5">
            <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
              📿 remembrance (dhikr)
            </h4>
            <div className="space-y-4">
              {dhikrs.map((item) => (
                <div key={item.id} className="space-y-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <DhikrPicker
                        value={item.name}
                        onChange={(val) => {
                          updateDhikrItem(item.id, { name: val });
                          if (item.count === 0) updateDhikrItem(item.id, { count: 33 });
                        }}
                      />
                    </div>
                    {dhikrs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDhikrItem(item.id)}
                        className="w-10 h-10 border border-red-200 bg-background hover:bg-red-50 text-red-600 flex items-center justify-center rounded-[2px] mt-6 shrink-0 cursor-pointer"
                        title="Remove dhikr"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Quick Add Pills */}
                    <div className="flex gap-1.5 select-none">
                      <button
                        type="button"
                        onClick={() => updateDhikrItem(item.id, { count: item.count + 33 })}
                        className="px-2 py-1 border border-border bg-background hover:bg-secondary text-[10px] font-bold rounded-[2px] cursor-pointer"
                      >
                        +33
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDhikrItem(item.id, { count: item.count + 100 })}
                        className="px-2 py-1 border border-border bg-background hover:bg-secondary text-[10px] font-bold rounded-[2px] cursor-pointer"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDhikrItem(item.id, { count: 0 })}
                        className="px-2 py-1 border border-border bg-background hover:bg-red-50 text-[10px] text-red-600 font-bold rounded-[2px] cursor-pointer"
                      >
                        clear
                      </button>
                    </div>
                    {renderStepper(item.count, (val) => updateDhikrItem(item.id, { count: val }), 0, 'times')}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDhikrItem}
                className="w-full py-2 border border-border border-dashed bg-background hover:bg-secondary text-xs text-primary font-bold rounded-[2px] cursor-pointer"
              >
                + add another dhikr
              </button>
            </div>
          </div>
        )}

        {/* 6. Dua Section */}
        {isTypeActive('Dua') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 space-y-3">
            <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
              🤲 supplication (dua)
            </h4>
            <div className="space-y-4">
              {duas.map((item) => (
                <div key={item.id} className="space-y-2 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.name}
                        onChange={(e) => {
                          updateDuaItem(item.id, { name: e.target.value });
                          if (item.count === 0) updateDuaItem(item.id, { count: 1 });
                        }}
                        className="w-full border border-border bg-background px-3 py-2 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-sm min-h-[40px]"
                      >
                        <option value="Morning Dua">morning dua</option>
                        <option value="Evening Dua">evening dua</option>
                        <option value="Dua after Salah">dua after salah</option>
                      </select>
                    </div>
                    {duas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDuaItem(item.id)}
                        className="w-10 h-10 border border-red-200 bg-background hover:bg-red-50 text-red-600 flex items-center justify-center rounded-[2px] shrink-0 cursor-pointer"
                        title="Remove dua"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground font-semibold">completed:</span>
                    {renderStepper(item.count, (val) => updateDuaItem(item.id, { count: val }), 0, 'times')}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDuaItem}
                className="w-full py-2 border border-border border-dashed bg-background hover:bg-secondary text-xs text-primary font-bold rounded-[2px] cursor-pointer"
              >
                + add another dua
              </button>
            </div>
          </div>
        )}

        {/* 7. Tahajjud Section */}
        {isTypeActive('Tahajjud') && (
          <div className="border border-border p-3.5 rounded-card bg-secondary/10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-primary capitalize flex items-center gap-1">
                ✨ tahajjud prayer
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">night prayer amount</p>
            </div>
            {renderStepper(tahajjudCount, setTahajjudCount, 0, 'rakaat')}
          </div>
        )}

        {/* 8. Custom Categories from Profile */}
        {enabledTypes.map((t) => {
          if (!t.isCustom) return null;
          return (
            <div
              key={t.label}
              className="border border-border p-3.5 rounded-card bg-secondary/10 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-primary capitalize truncate">
                  📌 {t.label.toLowerCase()}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">custom category</p>
              </div>
              {renderStepper(
                customCounts[t.label] || 0,
                (val) => setCustomCounts({ ...customCounts, [t.label]: val }),
                0,
                t.unit
              )}
            </div>
          );
        })}
      </div>

      {/* Global Notes for today's logs */}
      <div>
        <label htmlFor="global-notes" className="block text-xs font-bold text-foreground mb-1 select-none">
          notes (appends to logs)
        </label>
        <textarea
          id="global-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="optional notes for today's log entries..."
          rows={2}
          className="w-full border border-border bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:border-primary min-h-[60px]"
        />
      </div>

      {/* Save All Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-btn hover:bg-opacity-95 flex items-center justify-center gap-2 cursor-pointer focus:outline-none min-h-[44px] capitalize"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            saving all logs...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 shrink-0" />
            save today's logs
          </>
        )}
      </button>
    </form>
  );
}
