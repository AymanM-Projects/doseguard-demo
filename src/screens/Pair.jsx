import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from '../components/Icon'
import { Sheet, spring, tap } from '../components/ui'
import { useSim } from '../state/sim'

const COPY = {
  scan: { title: 'Looking for cases', sub: 'Hold the case near your phone' },
  found: { title: 'Dose Guard 7F2A', sub: 'Ready to pair' },
  connecting: { title: 'Dose Guard 7F2A', sub: 'Connecting' },
  done: { title: 'Connected', sub: 'Added to My cases' },
}

export default function Pair({ onClose }) {
  const { dispatch } = useSim()
  const [step, setStep] = useState('scan')

  useEffect(() => {
    if (step === 'scan') {
      const t = setTimeout(() => setStep('found'), 2000)
      return () => clearTimeout(t)
    }
    if (step === 'connecting') {
      const t = setTimeout(() => {
        dispatch({ type: 'addCase' })
        setStep('done')
      }, 1300)
      return () => clearTimeout(t)
    }
  }, [step, dispatch])

  const searching = step === 'scan' || step === 'connecting'

  return (
    <Sheet label="Pair a case" onClose={onClose}>
      <div className="pair">
        <div className="radar">
          {searching &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="radar-ring"
                animate={{ scale: [0.6, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
              />
            ))}
          <motion.span
            className="radar-core"
            data-done={step === 'done'}
            animate={{ scale: step === 'done' ? [1, 1.15, 1] : 1 }}
            transition={spring}
          >
            <Icon name={step === 'done' ? 'check' : 'bluetooth'} size={34} stroke={2.4} />
          </motion.span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="pair-copy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="sheet-title">{COPY[step].title}</div>
            <div className="card-sub">{COPY[step].sub}</div>
          </motion.div>
        </AnimatePresence>

        {step === 'found' && (
          <motion.button
            className="btn btn-primary btn-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={tap}
            onClick={() => setStep('connecting')}
          >
            Connect
          </motion.button>
        )}
        {step === 'done' && (
          <motion.button
            className="btn btn-primary btn-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={tap}
            onClick={onClose}
          >
            Done
          </motion.button>
        )}
        {searching && <div className="btn-placeholder" />}
      </div>
    </Sheet>
  )
}
