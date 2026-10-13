import { useEffect, useState } from 'react'
import { SCENE_ORDER, useSim } from '../state/sim'
import CaseDevice from './CaseDevice'

// The stage is laid out at a fixed size and scaled to whatever the projector gives us.
const STAGE_W = 720
const STAGE_H = 1010

export default function Stage({ children }) {
  const { dispatch } = useSim()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // Presenter backups: 1/2/3 pick a scene, R resets, F toggles fullscreen.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const scene = SCENE_ORDER[Number(e.key) - 1]
      if (scene) return dispatch({ type: 'scene', scene })
      const key = e.key.toLowerCase()
      if (key === 'r') dispatch({ type: 'reset' })
      if (key === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  return (
    <main className="stage-wrap">
      <div
        className="stage"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className="phone">
          <div className="phone-screen">
            <div className="island" />
            {children}
          </div>
        </div>
        <CaseDevice />
      </div>
    </main>
  )
}
