'use client';

import { useState, useEffect } from 'react';

const DHIKR_PRESETS = [
  'SubhanAllah',
  'Alhamdulillah',
  'Allahu Akbar',
  'La ilaha illa Allah',
  'Salawat',
  'Istighfar',
];

interface DhikrPickerProps {
  value: string;
  onChange: (dhikr: string) => void;
}

export default function DhikrPicker({ value, onChange }: DhikrPickerProps) {
  const isPreset = DHIKR_PRESETS.includes(value);
  const [selectedOpt, setSelectedOpt] = useState(
    value ? (isPreset ? value : 'custom') : DHIKR_PRESETS[0]
  );
  const [customText, setCustomText] = useState(isPreset ? '' : value);

  useEffect(() => {
    if (selectedOpt !== 'custom') {
      onChange(selectedOpt);
    } else {
      onChange(customText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOpt, customText]);

  // Sync state if value is cleared or changed externally
  useEffect(() => {
    if (!value) {
      setSelectedOpt(DHIKR_PRESETS[0]);
      setCustomText('');
    } else if (DHIKR_PRESETS.includes(value)) {
      setSelectedOpt(value);
    } else {
      setSelectedOpt('custom');
      setCustomText(value);
    }
  }, [value]);

  return (
    <div className="w-full space-y-3">
      <div>
        <label htmlFor="dhikr-select" className="block text-sm font-medium text-foreground mb-1 select-none">
          select dhikr preset
        </label>
        <select
          id="dhikr-select"
          value={selectedOpt}
          onChange={(e) => setSelectedOpt(e.target.value)}
          className="w-full border border-border bg-background px-3.5 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
        >
          {DHIKR_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset.toLowerCase()}
            </option>
          ))}
          <option value="custom">custom dhikr...</option>
        </select>
      </div>

      {selectedOpt === 'custom' && (
        <div className="animate-fade-in">
          <label htmlFor="custom-dhikr" className="block text-sm font-medium text-foreground mb-1 select-none">
            type custom dhikr name
          </label>
          <input
            id="custom-dhikr"
            type="text"
            required
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Astaghfirullah al-Adheem"
            className="w-full border border-border bg-background px-3.5 py-2.5 rounded-[2px] text-foreground focus:outline-none focus:border-primary text-base min-h-[44px]"
          />
        </div>
      )}
    </div>
  );
}
