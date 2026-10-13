import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { MEDICINES } from './medicines'

// Where the live case "is". Picking a scene drives its temperature.
export const SCENES = {
  home: { label: 'Home', icon: 'home', target: 72, place: 'Home', latlng: [37.5538, -77.4603] },
  backpack: { label: 'Backpack', icon: 'backpack', target: 82, place: 'School', latlng: [37.561, -77.452] },
  car: { label: 'Hot car', icon: 'car', target: 104, place: 'Parking lot', latlng: [37.5485, -77.448] },
}
export const SCENE_ORDER = ['home', 'backpack', 'car']

export const STATUS = {
  safe: { label: 'Safe', icon: 'check', color: '#1E9E5A', ink: '#14693D', bg: '#E6F4EA' },
  warm: { label: 'Warming', icon: 'thermometer', color: '#E0A100', ink: '#7A5200', bg: '#FBF0CF' },
  hot: { label: 'Too hot', icon: 'alert', color: '#D93A3A', ink: '#A32020', bg: '#FBE2DF' },
}

const WARM_BAND = 6 // °F below the limit where the case turns yellow
const ALERT_AFTER = 40 // minutes over the limit before the alert fires
const TICK_MS = 100
const NOTE_TICKS = 45 // a notification stays for 4.5 seconds
const DOSE_NOTE_AT = 70
const HISTORY = 60
const NEW_CASE_NAMES = ['Gym bag', 'Travel case', 'Spare case']

export const LIMIT_MIN = 60
export const LIMIT_MAX = 95
export const SETPOINT_MIN = 36
export const SETPOINT_MAX = 80

// The single place status is derived, so LED, ring, chart and alert agree.
export function statusOf(temp, limit) {
  if (temp > limit) return 'hot'
  if (temp > limit - WARM_BAND) return 'warm'
  return 'safe'
}

const flatHistory = (base) =>
  Array.from({ length: HISTORY }, (_, i) => base + Math.sin(i / 6) * 1.1)

function initialState() {
  return {
    scene: 'home',
    epoch: 0,
    ticks: 0,
    alert: null,
    notes: [],
    noteId: 0,
    cases: [
      {
        id: 'c1',
        name: "Maya's case",
        live: true,
        temp: 72,
        limit: 86,
        battery: 82,
        cooling: false,
        setpoint: 68,
        overMin: 0,
        alerted: false,
        exposure: null,
        history: flatHistory(71.5),
      },
      {
        id: 'c2',
        name: "Dad's case",
        live: false,
        temp: 70,
        limit: 86,
        battery: 64,
        place: 'Office',
        latlng: [37.5407, -77.436],
        cooling: false,
        setpoint: 68,
        overMin: 0,
        alerted: false,
        exposure: null,
        history: flatHistory(69.5),
      },
    ],
    meds: [
      { id: 'm1', type: 'epipen', caseId: 'c1', doses: [] },
      {
        id: 'm2',
        type: 'insulin',
        caseId: 'c2',
        doses: [
          { time: '8:00 AM', taken: true },
          { time: '6:30 PM', taken: false },
        ],
      },
    ],
  }
}

function tick(state) {
  const target = SCENES[state.scene].target
  const ticks = state.ticks + 1
  let alert = state.alert
  let changed = false
  const notes = []

  const cases = state.cases.map((c) => {
    // Cooling pulls a case to its setpoint wherever it is; otherwise only
    // the live case follows its scene.
    const goal = c.cooling ? c.setpoint : c.live ? target : c.temp
    const diff = goal - c.temp
    const settled = Math.abs(diff) < 0.05
    const hot = c.temp > c.limit
    if (settled && c.temp === goal && !hot && c.overMin === 0) return c

    changed = true
    const temp = settled ? goal : c.temp + diff * 0.045
    const next = { ...c, temp }

    if (temp > c.limit) {
      // Forty minutes pass in four seconds, then time slows to a crawl.
      next.overMin = c.overMin + (c.overMin < ALERT_AFTER ? 1 : 0.02)
      if (next.overMin >= ALERT_AFTER && !c.alerted) {
        next.alerted = true
        next.exposure = { minutes: ALERT_AFTER, limit: c.limit }
        alert = { caseId: c.id, minutes: ALERT_AFTER, limit: c.limit }
      }
    } else {
      next.overMin = 0
      next.alerted = false
    }

    const before = statusOf(c.temp, c.limit)
    const after = statusOf(temp, c.limit)
    const reading = `${c.name} is ${Math.round(temp)}°F`
    if (before === 'safe' && after === 'warm') notes.push({ kind: 'warm', title: 'Warming up', body: reading })
    if (before !== 'safe' && after === 'safe') notes.push({ kind: 'safe', title: 'Back in range', body: reading })
    if (c.cooling && settled && c.temp !== goal)
      notes.push({ kind: 'safe', title: 'Cooling done', body: `${c.name} is holding ${c.setpoint}°F` })

    if (ticks % 4 === 0) next.history = [...c.history, temp].slice(-HISTORY)
    return next
  })

  // A dose reminder a few seconds after the app opens.
  const due = ticks === DOSE_NOTE_AT ? nextDose(state.meds) : null
  if (due) notes.push({ kind: 'info', title: 'Dose due soon', body: `${MEDICINES[due.med.type].label} at ${due.dose.time}` })

  const idle = !changed && !notes.length && !state.notes.length && ticks > DOSE_NOTE_AT
  if (idle) return state

  let noteId = state.noteId
  const live = state.notes.map((n) => ({ ...n, ttl: n.ttl - 1 })).filter((n) => n.ttl > 0)
  const added = notes.map((n) => ({ ...n, id: ++noteId, ttl: NOTE_TICKS }))
  return { ...state, ticks, cases: changed ? cases : state.cases, alert, notes: [...live, ...added], noteId }
}

function reducer(state, action) {
  switch (action.type) {
    case 'tick':
      return tick(state)
    case 'scene':
      return { ...state, scene: action.scene }
    case 'cycleScene': {
      const i = SCENE_ORDER.indexOf(state.scene)
      return { ...state, scene: SCENE_ORDER[(i + 1) % SCENE_ORDER.length] }
    }
    case 'setLimit':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.id
            ? { ...c, limit: Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, action.limit)) }
            : c,
        ),
      }
    case 'setCooling':
      return {
        ...state,
        cases: state.cases.map((c) => (c.id === action.id ? { ...c, cooling: action.on } : c)),
      }
    case 'setSetpoint':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.id
            ? { ...c, setpoint: Math.min(SETPOINT_MAX, Math.max(SETPOINT_MIN, action.setpoint)) }
            : c,
        ),
      }
    case 'dismissNote':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) }
    case 'dismissAlert':
      return { ...state, alert: null }
    case 'clearExposure':
      return {
        ...state,
        cases: state.cases.map((c) => (c.id === action.id ? { ...c, exposure: null } : c)),
      }
    case 'addCase': {
      const n = state.cases.length
      const added = {
        id: `c${n + 1}`,
        name: NEW_CASE_NAMES[(n - 2) % NEW_CASE_NAMES.length],
        live: false,
        temp: 71,
        limit: 86,
        battery: 100,
        place: 'Home',
        latlng: [37.5552 + (n - 2) * 0.002, -77.4575],
        cooling: false,
        setpoint: 68,
        overMin: 0,
        alerted: false,
        exposure: null,
        history: flatHistory(70.5),
      }
      return { ...state, cases: [...state.cases, added] }
    }
    case 'addMed': {
      const preset = MEDICINES[action.medType]
      const med = {
        id: `m${state.meds.length + 1}`,
        type: action.medType,
        caseId: action.caseId,
        doses: preset.schedule.map((time) => ({ time, taken: false })),
      }
      // The case inherits the strictest limit of what it now holds.
      const cases = state.cases.map((c) =>
        c.id === action.caseId ? { ...c, limit: Math.min(c.limit, preset.limit) } : c,
      )
      return { ...state, cases, meds: [...state.meds, med] }
    }
    case 'toggleDose':
      return {
        ...state,
        meds: state.meds.map((m) =>
          m.id === action.id
            ? {
                ...m,
                doses: m.doses.map((d, i) => (i === action.index ? { ...d, taken: !d.taken } : d)),
              }
            : m,
        ),
      }
    case 'reset':
      return { ...initialState(), epoch: state.epoch + 1 }
    default:
      return state
  }
}

const SimContext = createContext(null)

export function SimProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), TICK_MS)
    return () => clearInterval(id)
  }, [])

  const value = useMemo(() => {
    const scene = SCENES[state.scene]
    const cases = state.cases.map((c) => {
      const meds = state.meds.filter((m) => m.caseId === c.id)
      return {
        ...c,
        status: statusOf(c.temp, c.limit),
        place: c.live ? scene.place : c.place,
        latlng: c.live ? scene.latlng : c.latlng,
        meds,
        contents: meds.map((m) => MEDICINES[m.type].label).join(', ') || 'Empty',
      }
    })
    return { state, dispatch, cases, meds: state.meds }
  }, [state])

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}

export function useSim() {
  return useContext(SimContext)
}

// First dose not yet taken, in the order medicines were added.
export function nextDose(meds) {
  for (const m of meds) {
    const index = m.doses.findIndex((d) => !d.taken)
    if (index !== -1) return { med: m, index, dose: m.doses[index] }
  }
  return null
}
