'use client';

import { useState, useRef } from 'react';
import { Edit2, Trash2, Check, X, Plus, Minus } from 'lucide-react';

interface ReadingEntry {
  _id?: string;
  type: string;
  name: string;
  nameArabic?: string;
  count: number;
  notes?: string;
}

interface ReadingEntryCardProps {
  entry: ReadingEntry;
  onDelete: (entryId: string) => void;
  onEdit: (entryId: string, updates: { count: number; notes: string }) => Promise<void>;
}

export default function ReadingEntryCard({
  entry,
  onDelete,
  onEdit,
}: ReadingEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(entry.count);
  const [editNotes, setEditNotes] = useState(entry.notes || '');
  const [saving, setSaving] = useState(false);

  // Swipe-to-reveal state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const SWIPE_LIMIT = -110; // Max pixels to translate left (revealing buttons)

  // Touch handlers for swipe gesture on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return; // Disable swipe during edit
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isEditing) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diffX = touchCurrentX.current - touchStartX.current;

    // Only allow swiping left (negative translation)
    if (diffX < 0) {
      // If already swiped, start offset from SWIPE_LIMIT
      const newOffset = isSwiped ? SWIPE_LIMIT + diffX : diffX;
      setSwipeOffset(Math.max(SWIPE_LIMIT, newOffset));
    } else if (diffX > 0 && isSwiped) {
      // Swiping right to close
      const newOffset = SWIPE_LIMIT + diffX;
      setSwipeOffset(Math.min(0, newOffset));
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || isEditing) return;
    const diffX = touchCurrentX.current ? touchCurrentX.current - touchStartX.current : 0;

    // Snap to positions
    if (isSwiped) {
      if (diffX > 40) {
        // Swiped right enough to close
        setSwipeOffset(0);
        setIsSwiped(false);
      } else {
        // Snap back to open
        setSwipeOffset(SWIPE_LIMIT);
      }
    } else {
      if (diffX < -50) {
        // Swiped left enough to open
        setSwipeOffset(SWIPE_LIMIT);
        setIsSwiped(true);
      } else {
        // Snap back to closed
        setSwipeOffset(0);
      }
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  // Close swipe actions
  const closeSwipe = () => {
    setSwipeOffset(0);
    setIsSwiped(false);
  };

  const handleSaveEdit = async () => {
    if (!entry._id) return;
    setSaving(true);
    try {
      await onEdit(entry._id, { count: editCount, notes: editNotes });
      setIsEditing(false);
      closeSwipe();
    } catch (err) {
      console.error('Failed to update entry', err);
    } finally {
      setSaving(false);
    }
  };

  // Emoji selectors based on item type
  const getTypeEmoji = () => {
    switch (entry.type) {
      case 'Surah':
        return '📖';
      case 'Dhikr':
        return '📿';
      case 'Dua':
        return '🤲';
      case 'Salah':
        return '🕌';
      case 'Tahajjud':
        return '✨';
      default:
        return '✍️';
    }
  };

  return (
    <div className="relative overflow-hidden w-full bg-background border border-border rounded-card select-none">
      
      {/* Background Action Buttons (Revealed via swipe) */}
      <div className="absolute right-0 top-0 bottom-0 flex w-[110px] z-0">
        <button
          onClick={() => {
            setIsEditing(true);
            setIsSwiped(false);
            setSwipeOffset(0);
          }}
          className="flex-1 bg-accent text-white flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-90 min-h-[44px]"
          title="Edit"
        >
          <Edit2 className="w-4 h-4 text-white" />
          <span className="text-[9px] mt-0.5 font-bold">edit</span>
        </button>
        <button
          onClick={() => {
            if (entry._id) onDelete(entry._id);
            closeSwipe();
          }}
          className="flex-1 bg-red-600 text-white flex flex-col items-center justify-center cursor-pointer hover:bg-red-700 min-h-[44px]"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span className="text-[9px] mt-0.5 font-bold">delete</span>
        </button>
      </div>

      {/* Front-Facing Slide Content Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className="w-full bg-card p-3.5 relative z-10 border-0 flex flex-col transition-transform duration-150 ease-out"
      >
        {isEditing ? (
          /* Inline Editor Mode */
          <div className="space-y-3 w-full animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary capitalize">
                edit {entry.type.toLowerCase()}: {entry.name.toLowerCase()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="w-8 h-8 border border-primary bg-primary text-primary-foreground flex items-center justify-center rounded-[2px] cursor-pointer"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditCount(entry.count);
                    setEditNotes(entry.notes || '');
                  }}
                  className="w-8 h-8 border border-border bg-background text-foreground flex items-center justify-center rounded-[2px] cursor-pointer"
                  title="Cancel edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-place count adjustments */}
            {entry.type !== 'Salah' && entry.type !== 'Dua' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">count:</span>
                <button
                  type="button"
                  onClick={() => setEditCount(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 border border-border bg-background flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={editCount}
                  onChange={(e) => setEditCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 border border-border bg-background py-1 text-center text-sm font-bold rounded-[2px]"
                />
                <button
                  type="button"
                  onClick={() => setEditCount(prev => prev + 1)}
                  className="w-8 h-8 border border-border bg-background flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* In-place notes text */}
            <div>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="optional notes..."
                className="w-full border border-border bg-background px-2.5 py-1.5 text-xs rounded-[2px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        ) : (
          /* Normal Display Mode */
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">{getTypeEmoji()}</span>
                <span className="text-sm font-semibold text-foreground truncate capitalize">
                  {entry.name.toLowerCase()}
                </span>
                {entry.nameArabic && (
                  <span className="font-arabic text-primary text-xs shrink-0 font-bold">
                    ({entry.nameArabic})
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded-[2px] capitalize">
                  {entry.type.toLowerCase()}
                </span>
              </div>
              
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-1 pl-7 italic truncate">
                  {entry.notes.toLowerCase()}
                </p>
              )}
            </div>

            {/* Right details / hover controls */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-serif font-bold text-sm text-foreground">
                × {entry.count}
              </span>
              
              {/* Desktop hover controls (Hidden on touch screens, visible md up via css hover) */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-7 h-7 border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center rounded-[2px] cursor-pointer"
                  title="Edit entry"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => entry._id && onDelete(entry._id)}
                  className="w-7 h-7 border border-border bg-background hover:bg-red-50 text-muted-foreground hover:text-red-600 flex items-center justify-center rounded-[2px] cursor-pointer"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
