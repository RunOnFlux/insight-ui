import { useMemo, useRef, useState } from 'react';
import type { ChartPoint } from './LineChart';

export interface ChartSeries {
  name: string;
  /** Tailwind stroke classes, light + dark validated shades. */
  strokeClass: string;
  /** Matching legend swatch background classes. */
  swatchClass: string;
  data: ChartPoint[];
}

const M = { top: 12, right: 16, bottom: 24, left: 64 };
const WIDTH = 900;

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

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

/** Multi-series line chart sharing one x/y scale, with legend and crosshair tooltip. */
export function MultiLineChart({
  series,
  formatValue,
  height = 260,
}: {
  series: ChartSeries[];
  formatValue: (value: number) => string;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const longest = series.reduce((a, s) => Math.max(a, s.data.length), 0);
  const dates = series.find((s) => s.data.length === longest)?.data.map((p) => p.date) ?? [];

  const { paths, yTicks, xTicks, x, y } = useMemo(() => {
    const values = series.flatMap((s) => s.data.map((p) => p.value));
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.05 || 1;
    const minY = Math.max(0, lo - pad);
    const maxY = hi + pad;
    const plotW = WIDTH - M.left - M.right;
    const plotH = height - M.top - M.bottom;
    const xf = (i: number): number =>
      M.left + (longest > 1 ? (i / (longest - 1)) * plotW : plotW / 2);
    const yf = (v: number): number => M.top + plotH - ((v - minY) / (maxY - minY || 1)) * plotH;
    const p = series.map((s) =>
      s.data
        .map((pt, i) => `${i === 0 ? 'M' : 'L'}${xf(i).toFixed(1)},${yf(pt.value).toFixed(1)}`)
        .join(''),
    );
    const tickCount = 6;
    const xIdx = Array.from(
      new Set(
        Array.from({ length: tickCount }, (_, i) =>
          Math.round((i / (tickCount - 1)) * (longest - 1)),
        ),
      ),
    );
    return {
      paths: p,
      yTicks: niceTicks(minY, maxY).map((v) => ({ v, y: yf(v) })),
      xTicks: xIdx.map((i) => ({ i, x: xf(i) })),
      x: xf,
      y: yf,
    };
  }, [series, height, longest]);

  if (longest === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No data available
      </div>
    );
  }

  const onMove = (e: React.PointerEvent<SVGSVGElement>): void => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const frac = Math.min(1, Math.max(0, (px - M.left) / (WIDTH - M.left - M.right)));
    setHoverIndex(Math.round(frac * (longest - 1)));
  };

  const hoverX = hoverIndex !== null ? x(hoverIndex) : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs font-medium">
            <span className={`h-0.5 w-4 rounded-full ${s.swatchClass}`} />
            {s.name}
          </span>
        ))}
      </div>
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
          {yTicks.map(({ v, y: ty }) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={WIDTH - M.right}
                y1={ty}
                y2={ty}
                className="stroke-slate-200/70 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={M.left - 8}
                y={ty + 3}
                textAnchor="end"
                className="fill-slate-400 text-[11px] tabular-nums dark:fill-slate-500"
              >
                {compact.format(v)}
              </text>
            </g>
          ))}
          {xTicks.map(({ i, x: tx }) => (
            <text
              key={i}
              x={tx}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] dark:fill-slate-500"
            >
              {dates[i]?.slice(5)}
            </text>
          ))}
          {series.map((s, si) => (
            <path
              key={s.name}
              d={paths[si]}
              fill="none"
              strokeWidth={2}
              className={s.strokeClass}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {hoverX !== null && hoverIndex !== null ? (
            <g>
              <line
                x1={hoverX}
                x2={hoverX}
                y1={M.top}
                y2={height - M.bottom}
                className="stroke-slate-300 dark:stroke-slate-600"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {series.map((s) => {
                const pt = s.data[hoverIndex];
                return pt ? (
                  <circle
                    key={s.name}
                    cx={hoverX}
                    cy={y(pt.value)}
                    r={4}
                    className={`fill-white dark:fill-slate-950 ${s.strokeClass}`}
                    strokeWidth={2}
                  />
                ) : null;
              })}
            </g>
          ) : null}
        </svg>
        {hoverIndex !== null && hoverX !== null ? (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900"
            style={{ left: `${(hoverX / WIDTH) * 100}%` }}
          >
            <p className="font-medium text-slate-500 dark:text-slate-400">{dates[hoverIndex]}</p>
            {series.map((s) => {
              const pt = s.data[hoverIndex];
              return pt ? (
                <p key={s.name} className="flex items-center gap-1.5 tabular-nums">
                  <span className={`h-0.5 w-3 rounded-full ${s.swatchClass}`} />
                  <span className="font-semibold">{formatValue(pt.value)}</span>
                  <span className="text-slate-400">{s.name}</span>
                </p>
              ) : null;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
