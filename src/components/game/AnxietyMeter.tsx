'use client';

interface AnxietyMeterProps {
  value: number;
}

function getAnxietyColor(value: number): string {
  if (value >= 70) return '#C2410C';
  if (value >= 40) return '#B45309';
  return '#0369A1';
}

export default function AnxietyMeter({ value }: AnxietyMeterProps) {
  const color = getAnxietyColor(value);
  return (
    <div className="flex items-center gap-1.5 flex-1">
      <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">焦虑</span>
      <div className="flex-1 h-2 rounded-full bg-[#334155] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
