import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import Icon from './Icon'
import { STATUS } from '../state/sim'

export const spring = { type: 'spring', stiffness: 420, damping: 32 }
export const tap = { scale: 0.96 }

export const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
export const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring },
}

// Lets the mouse drag a list the way a thumb would. A drag swallows the
// click that follows it so cards don't open at the end of a scroll.
export function useDragScroll() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let active = false
    let dragged = false
    let startY = 0
    let startTop = 0
    // The phone is scaled to fit the stage, so screen pixels are not CSS pixels.
    const scale = () => el.getBoundingClientRect().height / el.offsetHeight || 1

    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      active = true
      dragged = false
      startY = e.clientY
      startTop = el.scrollTop
    }
    const move = (e) => {
      if (!active) return
      const dy = (e.clientY - startY) / scale()
      if (!dragged && Math.abs(dy) > 6) dragged = true
      if (dragged) el.scrollTop = startTop - dy
    }
    const up = () => {
      active = false
    }
    const click = (e) => {
      if (!dragged) return
      e.stopPropagation()
      e.preventDefault()
      dragged = false
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('click', click, true)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('click', click, true)
    }
  }, [])

  return ref
}

export function StatusRing({ temp, limit, status, size = 72, stroke = 7 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  // The ring fills as the case approaches its limit and is full just past it.
  const pct = Math.min(1, Math.max(0.05, (temp - 50) / (limit + 10 - 50)))

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct), stroke: STATUS[status].color }}
          transition={{ type: 'spring', stiffness: 120, damping: 24 }}
        />
      </svg>
      <span className="ring-value" style={{ fontSize: size * 0.3 }}>
        {Math.round(temp)}°
      </span>
    </div>
  )
}

export function StatusChip({ status, large }) {
  const s = STATUS[status]
  return (
    <motion.span
      className={large ? 'chip chip-lg' : 'chip'}
      initial={false}
      animate={{ backgroundColor: s.bg, color: s.ink }}
    >
      <Icon name={s.icon} size={large ? 18 : 14} stroke={2.6} />
      {s.label}
    </motion.span>
  )
}

export function Battery({ level }) {
  return (
    <span className="battery">
      <svg width="24" height="13" viewBox="0 0 24 13" aria-hidden="true">
        <rect x="0.75" y="0.75" width="19.5" height="11.5" rx="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2.75" y="2.75" width={(15.5 * level) / 100} height="7.5" rx="1.5" fill="currentColor" />
        <rect x="21.5" y="4" width="2" height="5" rx="1" fill="currentColor" />
      </svg>
      {level}%
    </span>
  )
}

const sheetBackdrop = { hidden: { opacity: 0 }, show: { opacity: 1 } }
const sheetPanel = { hidden: { y: '100%' }, show: { y: 0, transition: spring } }

export function Sheet({ label, onClose, children }) {
  return (
    <motion.div className="sheet-layer" initial="hidden" animate="show" exit="hidden">
      <motion.div className="sheet-backdrop" variants={sheetBackdrop} onClick={onClose} />
      <motion.div className="sheet" role="dialog" aria-label={label} variants={sheetPanel}>
        <div className="sheet-grip" />
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Logo({ size = 34 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Dose Guard">
      <rect width="48" height="48" rx="14" fill="#1B3348" />
      <path d="M24 8.5c4 3 8 4.3 12 4.5v10.4c0 7.4-4.8 12.4-12 15.3-7.2-2.9-12-7.9-12-15.3V13c4-.2 8-1.5 12-4.5z" fill="#fff" />
      <rect x="21.75" y="14.5" width="4.5" height="12.5" rx="2.25" fill="#1B3348" />
      <circle cx="24" cy="29" r="4.7" fill="#1E9E5A" />
    </svg>
  )
}
