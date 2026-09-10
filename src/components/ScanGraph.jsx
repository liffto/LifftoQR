import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { useScanSeries } from '../hooks/useScanSeries'

// Hand-built SVG rather than a charting library: the app has held the line on
// bundle size all along, and this is a bar chart with a hover readout, not
// something that earns 50KB. Each day is a pair drawn as one bar — total scans
// as the light column, unique visitors as the solid column in front of it, so
// the gap between them reads at a glance as "repeat scans".

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
]

const fmtDay = (iso) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function Stat({ label, value, tone }) {
  return (
    <div className="flex-1 rounded-[10px] bg-canvas px-3 py-2.5">
      <p className="text-[11px] text-ink-muted leading-none">{label}</p>
      <p
        className={`mt-1 text-lg font-bold leading-none ${tone === 'unique' ? 'text-primary' : 'text-ink'}`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  )
}

export default function ScanGraph({ qrId, active = true }) {
  const [days, setDays] = useState(30)
  const [hover, setHover] = useState(null)
  const { data, isLoading, isError } = useScanSeries(qrId, days, active)

  const buckets = data?.buckets ?? []
  const max = Math.max(1, ...buckets.map((b) => b.scans))

  // A fixed viewBox; the SVG scales to its container width. Bars share the
  // width evenly with a small gap.
  const W = 320
  const H = 120
  const PAD_B = 18 // room for the baseline date labels
  const chartH = H - PAD_B
  const n = buckets.length || 1
  const slot = W / n
  const barW = Math.max(2, Math.min(slot * 0.6, 18))

  // Label only a few x-ticks so 30/90-day ranges don't turn to mush.
  const tickEvery = Math.ceil(n / 6)

  return (
    <div className="px-5 py-4">
      {/* Range filter */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Scans over time
        </p>
        <div className="flex items-center gap-1 rounded-[10px] bg-canvas p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`h-7 rounded-[8px] px-2.5 text-[12px] font-semibold transition-colors ${
                days === r.days
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Window totals */}
      <div className="mb-4 flex items-center gap-2.5">
        <Stat label="Total scans" value={data?.totalScans ?? 0} />
        <Stat label="Unique visitors" value={data?.uniqueScans ?? 0} tone="unique" />
      </div>

      {isLoading ? (
        <div className="h-[150px] rounded-[10px] shimmer" aria-busy="true" />
      ) : isError ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          Couldn&apos;t load scan history. Try again in a moment.
        </p>
      ) : (data?.totalScans ?? 0) === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
            <BarChart2 size={18} />
          </div>
          <p className="text-sm font-medium text-ink">No scans in this range</p>
          <p className="max-w-[240px] text-[12px] text-ink-muted leading-relaxed">
            Once this code is scanned, the daily counts show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Hover readout — reserves its own line so the chart doesn't jump. */}
          <div className="mb-1 h-4 text-center text-[11px] text-ink-soft">
            {hover != null && buckets[hover] && (
              <span>
                <span className="font-semibold text-ink">
                  {fmtDay(buckets[hover].date)}
                </span>{' '}
                — {buckets[hover].scans} scan
                {buckets[hover].scans === 1 ? '' : 's'}, {buckets[hover].unique}{' '}
                unique
              </span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 150 }}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Scans per day over the last ${days} days`}
          >
            {/* baseline */}
            <line
              x1="0"
              y1={chartH}
              x2={W}
              y2={chartH}
              className="stroke-line"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {buckets.map((b, i) => {
              const cx = i * slot + slot / 2
              const totalH = (b.scans / max) * (chartH - 4)
              const uniqueH = (b.unique / max) * (chartH - 4)
              return (
                <g key={b.date}>
                  {/* total (light) */}
                  <rect
                    x={cx - barW / 2}
                    y={chartH - totalH}
                    width={barW}
                    height={totalH}
                    rx="1.5"
                    className="fill-primary/25"
                  />
                  {/* unique (solid, in front) */}
                  <rect
                    x={cx - barW / 2}
                    y={chartH - uniqueH}
                    width={barW}
                    height={uniqueH}
                    rx="1.5"
                    className="fill-primary"
                  />
                  {/* full-height hit target for hover/touch */}
                  <rect
                    x={i * slot}
                    y="0"
                    width={slot}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                    onTouchStart={() => setHover(i)}
                  />
                  {i % tickEvery === 0 && (
                    <text
                      x={cx}
                      y={H - 5}
                      textAnchor="middle"
                      className="fill-ink-faint"
                      style={{ fontSize: 8 }}
                    >
                      {fmtDay(b.date)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-primary/25" />
              Total scans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-primary" />
              Unique visitors
            </span>
          </div>
        </>
      )}
    </div>
  )
}
