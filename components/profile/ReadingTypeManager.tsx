'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Plus, ChevronUp, ChevronDown, Check, Loader, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface ReadingType {
  label: string;
  unit: string;
  isActive: boolean;
  isCustom: boolean;
  _id?: string;
}

interface ReadingTypeManagerProps {
  readingTypes: ReadingType[];
  onUpdate: (updatedTypes: ReadingType[]) => Promise<void>;
}

// -------------------------------------------------------------
// Sortable Item Component
// -------------------------------------------------------------
interface SortableItemProps {
  type: ReadingType;
  onToggle: (label: string) => void;
  onDelete: (label: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableReadingTypeItem({
  type,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.label });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between border border-border bg-card p-3 rounded-card select-none gap-2 ${
        isDragging ? 'shadow-none border-primary bg-secondary/50' : ''
      }`}
    >
      {/* Left: Grab Handle & Text */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Grip Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="w-8 h-8 border border-border bg-background text-muted-foreground flex items-center justify-center rounded-[2px] cursor-grab active:cursor-grabbing shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Labels */}
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground truncate block capitalize">
            {type.label.toLowerCase()}
          </span>
          <span className="text-[10px] text-muted-foreground lowercase block">
            unit: {type.unit}
          </span>
        </div>
      </div>

      {/* Right: Actions (Up/Down buttons, active toggler, delete) */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Up/Down buttons for mobile tap reordering */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-6 h-6 border border-border bg-background hover:bg-secondary text-foreground flex items-center justify-center rounded-[2px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="w-6 h-6 border border-border bg-background hover:bg-secondary text-foreground flex items-center justify-center rounded-[2px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onToggle(type.label)}
          className="w-11 h-11 border border-border bg-background hover:bg-secondary flex items-center justify-center rounded-[2px] cursor-pointer text-foreground"
          title={type.isActive ? 'Deactivate' : 'Activate'}
        >
          {type.isActive ? (
            <ToggleRight className="w-6 h-6 text-primary fill-primary/10" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-muted-foreground" />
          )}
        </button>

        {/* Custom type Delete button */}
        {type.isCustom && (
          <button
            type="button"
            onClick={() => onDelete(type.label)}
            className="w-11 h-11 border border-border bg-background hover:bg-red-50 text-red-600 flex items-center justify-center rounded-[2px] cursor-pointer"
            title="Delete custom tracking category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export default function ReadingTypeManager({
  readingTypes,
  onUpdate,
}: ReadingTypeManagerProps) {
  // Local list state to avoid lagging FOUC during drag reordering
  const [typesList, setTypesList] = useState<ReadingType[]>(readingTypes);

  // Add custom type states
  const [newLabel, setNewLabel] = useState('');
  const [newUnit, setNewUnit] = useState('times');
  const [customUnit, setCustomUnit] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts only after moving 8px (avoids capturing simple clicks)
      },
    })
  );

  // Sync state with parent when props change
  useState(() => {
    setTypesList(readingTypes);
  });

  // Handle local state reorder
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = typesList.findIndex((t) => t.label === active.id);
    const newIndex = typesList.findIndex((t) => t.label === over.id);

    const reorderedList = arrayMove(typesList, oldIndex, newIndex);
    setTypesList(reorderedList);

    setSaving(true);
    try {
      await onUpdate(reorderedList);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Up button handler
  const moveUp = async (index: number) => {
    if (index === 0) return;
    const reorderedList = arrayMove(typesList, index, index - 1);
    setTypesList(reorderedList);
    setSaving(true);
    try {
      await onUpdate(reorderedList);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Down button handler
  const moveDown = async (index: number) => {
    if (index === typesList.length - 1) return;
    const reorderedList = arrayMove(typesList, index, index + 1);
    setTypesList(reorderedList);
    setSaving(true);
    try {
      await onUpdate(reorderedList);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle active/inactive state
  const handleToggle = async (label: string) => {
    const updated = typesList.map((t) =>
      t.label === label ? { ...t, isActive: !t.isActive } : t
    );
    setTypesList(updated);
    setSaving(true);
    try {
      await onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete custom type
  const handleDeleteCustom = async (label: string) => {
    const updated = typesList.filter((t) => t.label !== label);
    setTypesList(updated);
    setSaving(true);
    try {
      await onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Add custom type save action
  const handleAddCustomType = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedLabel = newLabel.trim();
    if (!formattedLabel) {
      setError('Please enter a label name');
      return;
    }

    // Check uniqueness
    const exists = typesList.some(
      (t) => t.label.toLowerCase() === formattedLabel.toLowerCase()
    );
    if (exists) {
      setError('A tracking category with this name already exists');
      return;
    }

    const unitString = newUnit === 'custom' ? customUnit.trim() || 'times' : newUnit;

    const newTypeItem: ReadingType = {
      label: formattedLabel,
      unit: unitString,
      isActive: true,
      isCustom: true,
    };

    const updated = [...typesList, newTypeItem];
    setTypesList(updated);
    setAdding(false);
    setNewLabel('');
    setCustomUnit('');
    setNewUnit('times');
    
    setSaving(true);
    try {
      await onUpdate(updated);
    } catch (err) {
      setError('Failed to save custom type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 select-none">
      
      {saving && (
        <div className="text-[10px] text-primary flex items-center justify-end gap-1 font-bold lowercase pr-1">
          <Loader className="w-3.5 h-3.5 animate-spin" /> saving changes...
        </div>
      )}

      {/* Reorderable DndContext List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={typesList.map((t) => t.label)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {typesList.map((type, index) => (
              <SortableReadingTypeItem
                key={type.label}
                type={type}
                onToggle={handleToggle}
                onDelete={handleDeleteCustom}
                onMoveUp={() => moveUp(index)}
                onMoveDown={() => moveDown(index)}
                isFirst={index === 0}
                isLast={index === typesList.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Custom Type collapsible area */}
      <div className="border border-border p-3.5 rounded-card space-y-3 bg-secondary/15">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3 border border-border bg-card hover:bg-secondary text-sm font-semibold rounded-btn cursor-pointer focus:outline-none min-h-[44px] capitalize transition-colors duration-100"
          >
            <Plus className="w-4 h-4 text-primary" /> add custom tracking type
          </button>
        ) : (
          <form onSubmit={handleAddCustomType} className="space-y-3.5 pt-1.5 animate-fade-in">
            <span className="block text-xs font-bold text-foreground capitalize">
              new custom category
            </span>

            {error && (
              <div className="p-2 bg-red-100 border border-red-300 text-red-800 text-[10px] rounded-[2px]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="custom-type-label" className="block text-[11px] font-semibold text-muted-foreground mb-1 select-none">
                label name
              </label>
              <input
                id="custom-type-label"
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Istighfar, Charity"
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:border-primary min-h-[40px]"
              />
            </div>

            <div>
              <label htmlFor="custom-type-unit" className="block text-[11px] font-semibold text-muted-foreground mb-1 select-none">
                unit type
              </label>
              <select
                id="custom-type-unit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:border-primary min-h-[40px]"
              >
                <option value="times">times (count)</option>
                <option value="pages">pages</option>
                <option value="rakaat">rakaat</option>
                <option value="custom">custom unit string...</option>
              </select>
            </div>

            {newUnit === 'custom' && (
              <div className="animate-fade-in">
                <label htmlFor="custom-unit-text" className="block text-[11px] font-semibold text-muted-foreground mb-1 select-none">
                  type custom unit name
                </label>
                <input
                  id="custom-unit-text"
                  type="text"
                  required
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="e.g. minutes, verses"
                  className="w-full border border-border bg-background px-3 py-2 text-sm rounded-[2px] focus:outline-none focus:border-primary min-h-[40px]"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 bg-primary text-primary-foreground font-semibold rounded-btn hover:bg-opacity-95 text-xs min-h-[38px] flex items-center justify-center cursor-pointer"
              >
                <Check className="w-4 h-4 mr-1" /> add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                }}
                className="flex-1 py-2 border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold rounded-btn min-h-[38px] cursor-pointer"
              >
                cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
    </div>
  );
}
