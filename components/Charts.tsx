import React from 'react';

interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color: string;
  height?: number;
  unit?: string;
}

export const LineChart: React.FC<ChartProps> = ({ data, xKey, yKey, color, height = 200, unit = '' }) => {
  if (!data || data.length === 0) return null;

  const width = 100; // Percentage based
  const values = data.map(d => d[yKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Generate path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    // Normalize y (invert because SVG 0 is top)
    const normalizedY = ((d[yKey] - min) / range);
    const y = 100 - (normalizedY * 70 + 15); // Use 70% of height + 15% padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full relative select-none" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Grid lines */}
        {[20, 40, 60, 80].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        ))}
        
        {/* Area fill */}
        <path 
          d={`M0,100 L0,${100 - (((data[0][yKey] - min)/range)*70 + 15)} ${points.replace(/,/g, ' ')} L100,100 Z`} 
          fill={color} 
          fillOpacity="0.1" 
        />
        
        {/* Line */}
        <polyline 
          points={points} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          vectorEffect="non-scaling-stroke"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const normalizedY = ((d[yKey] - min) / range);
          const y = 100 - (normalizedY * 70 + 15);
          return (
            <g key={i} className="group">
              <circle cx={x} cy={y} r="1.5" fill="white" stroke={color} strokeWidth="0.5" className="transition-all group-hover:r-2" />
              {/* Tooltip-ish text */}
              <text x={x} y={y - 5} fontSize="4" fill="white" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                {d[yKey]}{unit}
              </text>
            </g>
          );
        })}
      </svg>
      {/* X Axis Labels */}
      <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d[xKey]}</span>
        ))}
      </div>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({ data, xKey, yKey, color, height = 200, unit = '' }) => {
    if (!data || data.length === 0) return null;
  
    const values = data.map(d => d[yKey]);
    const max = Math.max(...values) || 1;
  
    return (
      <div className="w-full h-full flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((d, i) => {
          const h = (d[yKey] / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Value Popup */}
              <div className="absolute bottom-[105%] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-700 pointer-events-none mb-1 z-10 whitespace-nowrap">
                {d[yKey]} {unit}
              </div>
              
              <div 
                className="w-full rounded-t-sm hover:opacity-80 transition-all relative"
                style={{ height: `${h}%`, backgroundColor: color }}
              ></div>
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">{d[xKey]}</span>
            </div>
          );
        })}
      </div>
    );
};