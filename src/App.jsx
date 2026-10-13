import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import Icon from './components/Icon'
import { Logo, spring, tap } from './components/ui'
import CaseDetail from './screens/CaseDetail'
import Find from './screens/Find'
import Home from './screens/Home'
import Medicines, { AddMedicine } from './screens/Medicines'
import Pair from './screens/Pair'
import FingerCursor from './stage/FingerCursor'
import Stage from './stage/Stage'
import { MEDICINES } from './state/medicines'
import { SimProvider, useSim } from './state/sim'

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'meds', label: 'Medicines', icon: 'pill' },
  { id: 'find', label: 'Find', icon: 'pin' },
]

function StatusBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')

  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="statusbar-icons" aria-hidden="true">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13">
          <rect x="0.75" y="0.75" width="21.5" height="11.5" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <rect x="2.75" y="2.75" width="15" height="7.5" rx="1.75" fill="currentColor" />
          <rect x="23.5" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

function AlertBanner({ onCheck }) {
  const { state, cases, dispatch } = useSim()
  const alert = state.alert
  const c = alert && cases.find((x) => x.id === alert.caseId)
  const medicine = c?.meds[0] ? MEDICINES[c.meds[0].type].label : 'medicine'

  return (
    <AnimatePresence>
      {c && (
        <motion.div
          className="banner"
          role="alert"
          initial={{ y: -260, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -260, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <div className="banner-head">
            <span className="banner-dot">
              <Icon name="alert" size={16} stroke={2.6} />
            </span>
            Dose Guard
            <span className="banner-time">now</span>
          </div>
          <div className="banner-title">Heat alert</div>
          <div className="banner-body">
            {c.name} over {alert.limit}°F for {alert.minutes} minutes
          </div>
          <div className="banner-actions">
            <motion.button
              className="btn btn-hot"
              whileTap={tap}
              onClick={() => {
                dispatch({ type: 'dismissAlert' })
                onCheck(c.id)
              }}
            >
              Check {medicine}
            </motion.button>
            <motion.button className="btn btn-quiet" whileTap={tap} onClick={() => dispatch({ type: 'dismissAlert' })}>
              Move to shade
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toast() {
  const { state, dispatch } = useSim()
  // The heat alert owns the top of the screen while it is up.
  const note = state.alert ? null : state.notes[state.notes.length - 1]

  return (
    <AnimatePresence>
      {note && (
        <motion.button
          key={note.id}
          className="toast"
          data-kind={note.kind}
          initial={{ y: -140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={() => dispatch({ type: 'dismissNote', id: note.id })}
        >
          <Logo size={38} />
          <span className="case-main">
            <span className="toast-title">{note.title}</span>
            <span className="card-sub">{note.body}</span>
          </span>
          <span className="toast-dot" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function Splash() {
  return (
    <motion.div className="splash" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
        <Logo size={104} />
      </motion.div>
      <motion.div
        className="splash-name"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        Dose Guard
      </motion.div>
      <div className="splash-bar">
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
      </div>
    </motion.div>
  )
}

function PhoneApp() {
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1900)
    return () => clearTimeout(t)
  }, [])

  const { cases } = useSim()
  const [tab, setTab] = useState('home')
  const [detailId, setDetailId] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [foundId, setFoundId] = useState(cases[0].id)

  const [loading, setLoading] = useState(false)
  const loadTimer = useRef(null)

  // Every screen change passes through a short loading screen.
  const load = () => {
    setLoading(true)
    clearTimeout(loadTimer.current)
    loadTimer.current = setTimeout(() => setLoading(false), 600)
  }
  useEffect(() => () => clearTimeout(loadTimer.current), [])

  const openCase = (id) => {
    load()
    setSheet(null)
    setDetailId(id)
  }
  const closeCase = () => {
    load()
    setDetailId(null)
  }
  const openFind = (id) => {
    load()
    setFoundId(id)
    setDetailId(null)
    setTab('find')
  }
  const openTab = (id) => {
    if (id === tab && !detailId) return
    load()
    setDetailId(null)
    setTab(id)
  }

  return (
    <div className="app">
      <StatusBar />

      <div className="views">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            className="view-slot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {tab === 'home' && <Home onOpenCase={openCase} onPair={() => setSheet('pair')} />}
            {tab === 'meds' && <Medicines onAdd={() => setSheet('addMed')} />}
            {tab === 'find' && <Find selectedId={foundId} onSelect={setFoundId} />}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {detailId && (
            <motion.div
              key="detail"
              className="view-slot detail"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={spring}
            >
              <CaseDetail caseId={detailId} onBack={closeCase} onFind={openFind} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.div
              key="loader"
              className="loader"
              role="status"
              aria-label="Loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="loader-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <motion.button
              key={t.id}
              className="tab"
              aria-current={active ? 'page' : undefined}
              whileTap={tap}
              onClick={() => openTab(t.id)}
            >
              {active && <motion.span layoutId="tab-pill" className="tab-pill" transition={spring} />}
              <Icon name={t.icon} size={24} />
              <span>{t.label}</span>
            </motion.button>
          )
        })}
      </nav>

      <AnimatePresence>
        {sheet === 'pair' && <Pair key="pair" onClose={() => setSheet(null)} />}
        {sheet === 'addMed' && <AddMedicine key="addMed" onClose={() => setSheet(null)} />}
      </AnimatePresence>

      <AlertBanner onCheck={openCase} />
      <Toast />
      <AnimatePresence>{booting && <Splash key="splash" />}</AnimatePresence>
      <div className="home-bar" />
    </div>
  )
}

// Remounting on reset sends the phone back to its first screen.
function Demo() {
  const { state } = useSim()
  return (
    <Stage>
      <PhoneApp key={state.epoch} />
    </Stage>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SimProvider>
        <Demo />
        <FingerCursor />
      </SimProvider>
    </MotionConfig>
  )
}
