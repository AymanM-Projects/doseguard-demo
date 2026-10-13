import { STATUS, statusOf } from '../state/sim'

const W = 326
const H = 132
const PAD = { top: 10, right: 46, bottom: 10, left: 2 }

export default function TempChart({ history, limit }) {
  const lo = 60
  const hi = Math.max(110, limit + 12)
  const x = (i) => PAD.left + (i / (history.length - 1)) * (W - PAD.left - PAD.right)
  const y = (t) => PAD.top + (1 - (t - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom)

  const d = history.map((t, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(t).toFixed(1)}`).join(' ')
  const last = history[history.length - 1]
  const yLimit = y(limit)
  const endColor = STATUS[statusOf(last, limit)].color

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={`Temperature today, now ${Math.round(last)} degrees, limit ${limit} degrees`}
    >
      <defs>
        <clipPath id="chart-over">
          <rect x="0" y="0" width={W} height={yLimit} />
        </clipPath>
      </defs>
      <rect x="0" y="0" width={W - PAD.right + 6} height={yLimit} fill="var(--hot-bg)" opacity="0.55" rx="6" />
      <line
        x1="0"
        x2={W - PAD.right + 6}
        y1={yLimit}
        y2={yLimit}
        stroke="var(--hot)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <text x={W} y={yLimit + 4} textAnchor="end" className="chart-label" fill="var(--hot-ink)">
        {limit}°
      </text>
      <path d={d} fill="none" stroke="var(--navy)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--hot)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath="url(#chart-over)"
      />
      <circle cx={x(history.length - 1)} cy={y(last)} r="6" fill={endColor} stroke="#fff" strokeWidth="2.5" />
    </svg>
  )
}
