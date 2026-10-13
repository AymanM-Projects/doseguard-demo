import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'motion/react'

// Replaces the arrow with a touch dot so mouse clicks read as finger taps
// from the back of the room.
export default function FingerCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const nextId = useRef(0)

  useEffect(() => {
    const move = (e) => {
      if (e.pointerType !== 'mouse') return setVisible(false)
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const down = (e) => {
      if (e.pointerType !== 'mouse') return
      setPressed(true)
      const id = nextId.current++
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }])
    }
    const up = () => setPressed(false)
    const leave = () => setVisible(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [x, y])

  return (
    <div className="finger-layer" aria-hidden="true">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="finger-ripple"
            style={{ left: r.x, top: r.y }}
            initial={{ scale: 0.4, opacity: 0.45 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onAnimationComplete={() => setRipples((all) => all.filter((p) => p.id !== r.id))}
          />
        ))}
      </AnimatePresence>
      <motion.span
        className="finger-dot"
        style={{ x, y }}
        animate={{ scale: pressed ? 0.78 : 1, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      />
    </div>
  )
}
