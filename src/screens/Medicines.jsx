import { useState } from 'react'
import { motion } from 'motion/react'
import Icon from '../components/Icon'
import { Sheet, item, list, tap, useDragScroll } from '../components/ui'
import { MEDICINES, MEDICINE_ORDER } from '../state/medicines'
import { useSim } from '../state/sim'

export default function Medicines({ onAdd }) {
  const { cases, meds, dispatch } = useSim()
  const scrollRef = useDragScroll()

  return (
    <div className="view">
      <header className="topbar">
        <div className="brand">Medicines</div>
        <motion.button className="icon-btn" aria-label="Add a medicine" whileTap={tap} onClick={onAdd}>
          <Icon name="plus" />
        </motion.button>
      </header>

      <div className="scroll" ref={scrollRef}>
        <motion.div className="stack" variants={list} initial="hidden" animate="show">
          {meds.map((m) => {
            const preset = MEDICINES[m.type]
            const holder = cases.find((c) => c.id === m.caseId)
            return (
              <motion.section key={m.id} className="card med" variants={item}>
                <div className="med-head">
                  <span className="med-icon">
                    <Icon name={preset.icon} />
                  </span>
                  <span className="case-main">
                    <span className="card-title">{preset.label}</span>
                    <span className="card-sub">
                      {holder?.name} · Below {preset.limit}°F
                    </span>
                  </span>
                </div>
                {m.doses.length === 0 ? (
                  <div className="med-note">
                    <Icon name="clock" size={16} />
                    As needed
                  </div>
                ) : (
                  <div className="doses">
                    {m.doses.map((d, i) => (
                      <motion.button
                        key={d.time}
                        className="dose"
                        aria-pressed={d.taken}
                        whileTap={tap}
                        onClick={() => dispatch({ type: 'toggleDose', id: m.id, index: i })}
                      >
                        <span className="dose-check">{d.taken && <Icon name="check" size={15} stroke={3.2} />}</span>
                        <span className="dose-time">{d.time}</span>
                        <span className="dose-state">{d.taken ? 'Taken' : 'Due'}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.section>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

export function AddMedicine({ onClose }) {
  const { cases, dispatch } = useSim()
  const [medType, setMedType] = useState('inhaler')
  const [caseId, setCaseId] = useState(cases[cases.length - 1].id)

  const add = () => {
    dispatch({ type: 'addMed', medType, caseId })
    onClose()
  }

  return (
    <Sheet label="Add a medicine" onClose={onClose}>
      <div className="sheet-title">Add a medicine</div>
      <div className="pick-grid" role="group" aria-label="Medicine">
        {MEDICINE_ORDER.map((id) => (
          <motion.button
            key={id}
            className="pick"
            aria-pressed={medType === id}
            whileTap={tap}
            onClick={() => setMedType(id)}
          >
            <Icon name={MEDICINES[id].icon} size={26} />
            <span className="pick-name">{MEDICINES[id].label}</span>
            <span className="pick-sub">Below {MEDICINES[id].limit}°F</span>
          </motion.button>
        ))}
      </div>
      <div className="card-label">Case</div>
      <div className="pick-row" role="group" aria-label="Case">
        {cases.map((c) => (
          <motion.button
            key={c.id}
            className="pick-chip"
            aria-pressed={caseId === c.id}
            whileTap={tap}
            onClick={() => setCaseId(c.id)}
          >
            {c.name}
          </motion.button>
        ))}
      </div>
      <motion.button className="btn btn-primary btn-block" whileTap={tap} onClick={add}>
        Add
      </motion.button>
    </Sheet>
  )
}
