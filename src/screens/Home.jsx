import { motion } from 'motion/react'
import Icon from '../components/Icon'
import { Battery, Logo, StatusChip, StatusRing, item, list, tap, useDragScroll } from '../components/ui'
import { MEDICINES } from '../state/medicines'
import { nextDose, useSim } from '../state/sim'

export default function Home({ onOpenCase, onPair }) {
  const { cases, meds, dispatch } = useSim()
  const scrollRef = useDragScroll()
  const next = nextDose(meds)

  return (
    <div className="view">
      <header className="topbar">
        <div className="brand">
          <Logo />
          Dose Guard
        </div>
        <motion.button className="icon-btn" aria-label="Pair a case" whileTap={tap} onClick={onPair}>
          <Icon name="plus" />
        </motion.button>
      </header>

      <div className="scroll" ref={scrollRef}>
        <h1 className="title">My cases</h1>
        <motion.div className="stack" variants={list} initial="hidden" animate="show">
          {cases.map((c) => (
            <motion.button
              key={c.id}
              className="card case-card"
              variants={item}
              whileTap={tap}
              onClick={() => onOpenCase(c.id)}
            >
              <StatusRing temp={c.temp} limit={c.limit} status={c.status} />
              <span className="case-main">
                <span className="card-title">{c.name}</span>
                <span className="card-sub">
                  {c.contents} · {c.place}
                </span>
                <span className="case-meta">
                  <StatusChip status={c.status} />
                  {c.exposure && c.status !== 'hot' && (
                    <span className="chip chip-flag">
                      <Icon name="alert" size={14} stroke={2.6} />
                      Check
                    </span>
                  )}
                  <Battery level={c.battery} />
                </span>
              </span>
              <Icon name="forward" size={20} className="case-chevron" />
            </motion.button>
          ))}
        </motion.div>

        <h2 className="section">Next dose</h2>
        <div className="card dose-card">
          <span className="med-icon">
            <Icon name={next ? MEDICINES[next.med.type].icon : 'check'} />
          </span>
          <span className="case-main">
            <span className="card-title">{next ? MEDICINES[next.med.type].label : 'All done'}</span>
            <span className="card-sub">{next ? next.dose.time : 'No doses left today'}</span>
          </span>
          {next && (
            <motion.button
              className="btn btn-primary btn-sm"
              whileTap={tap}
              onClick={() => dispatch({ type: 'toggleDose', id: next.med.id, index: next.index })}
            >
              <Icon name="check" size={16} stroke={2.8} />
              Taken
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
