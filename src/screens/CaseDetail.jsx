import { AnimatePresence, motion } from 'motion/react'
import Icon from '../components/Icon'
import TempChart from '../components/TempChart'
import { Battery, StatusChip, StatusRing, item, list, spring, tap, useDragScroll } from '../components/ui'
import { LIMIT_MAX, LIMIT_MIN, SETPOINT_MAX, SETPOINT_MIN, STATUS, useSim } from '../state/sim'

export default function CaseDetail({ caseId, onBack, onFind }) {
  const { cases, dispatch } = useSim()
  const scrollRef = useDragScroll()
  const c = cases.find((x) => x.id === caseId)
  if (!c) return null

  const setLimit = (limit) => dispatch({ type: 'setLimit', id: c.id, limit })
  const reached = Math.abs(c.temp - c.setpoint) < 0.5

  return (
    <div className="view">
      <header className="topbar">
        <motion.button className="icon-btn" aria-label="Back" whileTap={tap} onClick={onBack}>
          <Icon name="back" />
        </motion.button>
        <div className="topbar-title">{c.name}</div>
        <span className="icon-btn-spacer" />
      </header>

      <div className="scroll" ref={scrollRef}>
        <motion.div className="stack" variants={list} initial="hidden" animate="show">
          <motion.section
            className="hero"
            variants={item}
            animate={{ backgroundColor: STATUS[c.status].bg, opacity: 1, y: 0 }}
          >
            <StatusRing temp={c.temp} limit={c.limit} status={c.status} size={176} stroke={13} />
            <StatusChip status={c.status} large />
            <span className="hero-sub">
              {c.status === 'hot' ? `${Math.floor(c.overMin)} min over ${c.limit}°F` : c.contents}
            </span>
          </motion.section>

          <AnimatePresence>
            {c.exposure && (
              <motion.div
                className="exposure"
                role="status"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <Icon name="alert" size={22} />
                <span className="case-main">
                  <span className="card-title">Heat exposure</span>
                  <span className="card-sub">
                    {c.exposure.minutes} min over {c.exposure.limit}°F
                  </span>
                </span>
                <motion.button
                  className="btn btn-hot btn-sm"
                  whileTap={tap}
                  onClick={() => dispatch({ type: 'clearExposure', id: c.id })}
                >
                  Checked
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.section className="card" variants={item}>
            <h2 className="card-label">Today</h2>
            <TempChart history={c.history} limit={c.limit} />
          </motion.section>

          <motion.section className="card limit" variants={item}>
            <span className="case-main">
              <span className="card-label">Alert above</span>
              <span className="limit-value">{c.limit}°F</span>
            </span>
            <motion.button
              className="step-btn"
              aria-label="Lower limit"
              disabled={c.limit <= LIMIT_MIN}
              whileTap={tap}
              onClick={() => setLimit(c.limit - 1)}
            >
              <Icon name="minus" />
            </motion.button>
            <motion.button
              className="step-btn"
              aria-label="Raise limit"
              disabled={c.limit >= LIMIT_MAX}
              whileTap={tap}
              onClick={() => setLimit(c.limit + 1)}
            >
              <Icon name="plus" />
            </motion.button>
          </motion.section>

          <motion.section className="card" variants={item}>
            <div className="limit">
              <span className="case-main">
                <span className="card-label">Cool to</span>
                <span className="limit-value">{c.setpoint}°F</span>
              </span>
              <motion.button
                className="step-btn"
                aria-label="Lower wanted temperature"
                disabled={c.setpoint <= SETPOINT_MIN}
                whileTap={tap}
                onClick={() => dispatch({ type: 'setSetpoint', id: c.id, setpoint: c.setpoint - 1 })}
              >
                <Icon name="minus" />
              </motion.button>
              <motion.button
                className="step-btn"
                aria-label="Raise wanted temperature"
                disabled={c.setpoint >= SETPOINT_MAX}
                whileTap={tap}
                onClick={() => dispatch({ type: 'setSetpoint', id: c.id, setpoint: c.setpoint + 1 })}
              >
                <Icon name="plus" />
              </motion.button>
              <motion.button
                className="switch"
                role="switch"
                aria-checked={c.cooling}
                aria-label="Cooling"
                whileTap={tap}
                onClick={() => dispatch({ type: 'setCooling', id: c.id, on: !c.cooling })}
              >
                <motion.span className="switch-knob" layout transition={spring} />
              </motion.button>
            </div>
            {c.cooling && (
              <div className="med-note">
                <Icon name={reached ? 'check' : 'thermometer'} size={16} />
                {reached
                  ? `Sensor ${c.setpoint}°F · Reached`
                  : `Sensor ${Math.round(c.temp)}°F · Cooling to ${c.setpoint}°F`}
              </div>
            )}
          </motion.section>

          <motion.div className="tiles" variants={item}>
            <div className="tile">
              <Battery level={c.battery} />
              <span className="tile-label">Battery</span>
            </div>
            <div className="tile">
              <span className="tile-value">
                <Icon name="bluetooth" size={18} />
                On
              </span>
              <span className="tile-label">Bluetooth</span>
            </div>
            <motion.button className="tile" whileTap={tap} onClick={() => onFind(c.id)}>
              <span className="tile-value">
                <Icon name="pin" size={18} />
                {c.place}
              </span>
              <span className="tile-label">Last seen</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
