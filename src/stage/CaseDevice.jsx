import { motion } from 'motion/react'
import Icon from '../components/Icon'
import { spring } from '../components/ui'
import { SCENES, SCENE_ORDER, useSim } from '../state/sim'

// Presenter control: where the case "is". Drives the temperature in the app.
export default function CaseDevice() {
  const { state, dispatch } = useSim()

  return (
    <div className="scenes" role="group" aria-label="Where the case is">
      {SCENE_ORDER.map((id) => {
        const active = state.scene === id
        return (
          <motion.button
            key={id}
            className="scene"
            aria-pressed={active}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            onClick={() => dispatch({ type: 'scene', scene: id })}
          >
            {active && <motion.span layoutId="scene-pill" className="scene-pill" transition={spring} />}
            <Icon name={SCENES[id].icon} size={22} />
            <span>{SCENES[id].label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
