'use client';

interface MonthSummaryCardProps {
  label: string;
  value: number;
  unit?: string;
}

export default function MonthSummaryCard({
  label,
  value,
  unit,
}: MonthSummaryCardProps) {
  return (
    <div className="flex-1 bg-card border border-border p-4 rounded-card select-none text-center">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 truncate">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-serif font-bold text-2xl text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-muted-foreground font-semibold font-sans">
            {unit.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
