'use client';

interface ConsistencyHeatmapProps {
  currentDate: Date;
  daysData: any[];
  logsMap: Record<string, number>; // date -> entries count
}

export default function ConsistencyHeatmap({
  currentDate,
  daysData,
  logsMap,
}: ConsistencyHeatmapProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Find padding cells for week start alignment
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sun, 1 = Mon, etc.
  const totalDays = daysData.length || new Date(year, month + 1, 0).getDate();

  // Helper to format date string
  const getFormattedDateStr = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const cells = [];

  // Padding cells
  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `pad-${i}`, isEmpty: true });
  }

  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = getFormattedDateStr(d);
    const count = logsMap[dateStr] || 0;

    cells.push({
      key: `day-${d}`,
      isEmpty: false,
      dayNum: d,
      count,
    });
  }

  // Determine colors based on entry count
  const getShadingClass = (count: number) => {
    if (count === 0) return 'bg-secondary border-border/40 text-muted-foreground/60';
    if (count <= 2) return 'bg-primary/40 border-primary/50 text-foreground';
    if (count <= 4) return 'bg-primary/70 border-primary/80 text-primary-foreground';
    return 'bg-primary border-primary text-primary-foreground';
  };

  return (
    <div className="w-full bg-card border border-border p-4 rounded-card select-none">
      <div className="text-xs font-semibold text-muted-foreground mb-3 capitalize">
        consistency heatmap
      </div>

      <div className="flex flex-col items-center">
        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-1.5 w-full max-w-[280px]">
          {/* Weekday headers in micro format */}
          {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => (
            <div key={i} className="text-[9px] font-bold text-muted-foreground uppercase text-center w-full">
              {d}
            </div>
          ))}

          {cells.map((cell) => {
            if (cell.isEmpty) {
              return (
                <div
                  key={cell.key}
                  className="aspect-square border border-transparent bg-transparent rounded-[1px] w-full"
                />
              );
            }

            return (
              <div
                key={cell.key}
                className={`aspect-square border flex items-center justify-center text-[8px] font-bold rounded-[1px] w-full transition-colors duration-100 ${getShadingClass(
                  cell.count ?? 0
                )}`}
                title={`${cell.count ?? 0} entries on day ${cell.dayNum}`}
              >
                {cell.dayNum}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground capitalize select-none">
          <span>less</span>
          <div className="w-3.5 h-3.5 bg-secondary border border-border/40 rounded-[1px]" />
          <div className="w-3.5 h-3.5 bg-primary/40 border border-primary/50 rounded-[1px]" />
          <div className="w-3.5 h-3.5 bg-primary/70 border border-primary/85 rounded-[1px]" />
          <div className="w-3.5 h-3.5 bg-primary border border-primary rounded-[1px]" />
          <span>more</span>
        </div>
      </div>
    </div>
  );
}
