import { useMemo, useRef, useState } from 'react';

export interface ChartPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: ChartPoint[];
  /** Formats a value for the tooltip and y-axis labels. */
  formatValue: (value: number) => string;
  height?: number;
}

const M = { top: 12, right: 16, bottom: 24, left: 64 };
const WIDTH = 900;

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

/** Axis labels stay short (e.g. 428.3M) — full values live in the tooltip. */
function formatAxis(value: number): string {
  if (Math.abs(value) >= 10_000) return compactFormatter.format(value);
  if (Math.abs(value) < 1 && value !== 0) return value.toPrecision(3);
  return compactFormatter.format(value);
}

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min];
  const span = max - min;
  const step = 10 ** Math.floor(Math.log10(span / count));
  const err = span / count / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const niceStep = step * mult;
  const start = Math.ceil(min / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let v = start; v <= max; v += niceStep) ticks.push(v);
  return ticks;
}

export function LineChart({ data, formatValue, height = 320 }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, path, areaPath, yTicks, xTicks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const pad = (hi - lo) * 0.05 || Math.abs(hi) * 0.05 || 1;
    const minYv = Math.max(0, lo - pad);
    const maxYv = hi + pad;
    const plotW = WIDTH - M.left - M.right;
    const plotH = height - M.top - M.bottom;
    const x = (i: number): number =>
      M.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
    const y = (v: number): number => M.top + plotH - ((v - minYv) / (maxYv - minYv || 1)) * plotH;
    const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    const area =
      pts.length > 0
        ? [
            `M${pts[0]!.x.toFixed(1)},${(M.top + plotH).toFixed(1)}`,
            ...pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
            `L${pts[pts.length - 1]!.x.toFixed(1)},${(M.top + plotH).toFixed(1)}Z`,
          ]
        : [];
    const tickCount = 6;
    const xIdx = Array.from(
      new Set(
        Array.from({ length: tickCount }, (_, i) =>
          Math.round((i / (tickCount - 1)) * (data.length - 1)),
        ),
      ),
    );
    return {
      points: pts,
      path: line.join(''),
      areaPath: area.join(''),
      yTicks: niceTicks(minYv, maxYv).map((v) => ({ v, y: y(v) })),
      xTicks: xIdx.map((i) => ({ i, x: x(i) })),
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No data available
      </div>
    );
  }

  const onMove = (e: React.PointerEvent<SVGSVGElement>): void => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const plotW = WIDTH - M.left - M.right;
    const frac = Math.min(1, Math.max(0, (px - M.left) / plotW));
    setHoverIndex(Math.round(frac * (data.length - 1)));
  };

  const hover = hoverIndex !== null ? data[hoverIndex] : undefined;
  const hoverPt = hoverIndex !== null ? points[hoverIndex] : undefined;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label="Line chart"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-flux-500)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-flux-500)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map(({ v, y }) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={WIDTH - M.right}
              y1={y}
              y2={y}
              className="stroke-slate-200/70 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-slate-400 text-[11px] tabular-nums dark:fill-slate-500"
            >
              {formatAxis(v)}
            </text>
          </g>
        ))}
        {xTicks.map(({ i, x }) => (
          <text
            key={i}
            x={x}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-400 text-[11px] dark:fill-slate-500"
          >
            {data[i]?.date.slice(5)}
          </text>
        ))}

        <path d={areaPath} fill="url(#area-fill)" />
        <path
          d={path}
          fill="none"
          strokeWidth={2}
          className="stroke-flux-500 dark:stroke-flux-400"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hoverPt ? (
          <g>
            <line
              x1={hoverPt.x}
              x2={hoverPt.x}
              y1={M.top}
              y2={height - M.bottom}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle
              cx={hoverPt.x}
              cy={hoverPt.y}
              r={4.5}
              className="fill-flux-500 stroke-white dark:fill-flux-400 dark:stroke-slate-950"
              strokeWidth={2}
            />
          </g>
        ) : null}
      </svg>

      {hover && hoverPt ? (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900"
          style={{ left: `${(hoverPt.x / WIDTH) * 100}%` }}
        >
          <p className="font-medium text-slate-500 dark:text-slate-400">{hover.date}</p>
          <p className="font-semibold tabular-nums">{formatValue(hover.value)}</p>
        </div>
      ) : null}
    </div>
  );
}
