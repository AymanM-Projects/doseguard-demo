import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Battery, StatusChip, item, list, tap, useDragScroll } from '../components/ui'
import { STATUS, useSim } from '../state/sim'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

// A real map: Leaflet drawing OpenStreetMap tiles, so it needs a connection.
function Map({ cases, selectedId, onSelect }) {
  const el = useRef(null)
  const map = useRef(null)
  const markers = useRef({})
  const select = useRef(onSelect)
  select.current = onSelect

  const selected = cases.find((c) => c.id === selectedId)
  const focus = selected ? selected.latlng.join(',') : ''

  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false }).setView([37.5538, -77.4603], 14)
    L.tileLayer(TILES, { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(m)
    map.current = m
    return () => {
      m.remove()
      map.current = null
      markers.current = {}
    }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    cases.forEach((c) => {
      let marker = markers.current[c.id]
      if (!marker) {
        marker = L.circleMarker(c.latlng, { color: '#fff', weight: 4, fillOpacity: 1 })
          .addTo(m)
          .on('click', () => select.current(c.id))
        markers.current[c.id] = marker
      }
      marker.setLatLng(c.latlng)
      marker.setStyle({ fillColor: STATUS[c.status].color })
      marker.setRadius(c.id === selectedId ? 14 : 10)
    })
  }, [cases, selectedId])

  // Follow the selected case, including when a scene change moves it.
  useEffect(() => {
    if (!map.current || !focus) return
    map.current.flyTo(focus.split(',').map(Number), 15, { duration: 0.8 })
  }, [focus])

  return <div className="map" ref={el} role="img" aria-label="Map of your cases" />
}

export default function Find({ selectedId, onSelect }) {
  const { cases } = useSim()
  const scrollRef = useDragScroll()

  return (
    <div className="view">
      <Map cases={cases} selectedId={selectedId} onSelect={onSelect} />
      <div className="scroll find-list" ref={scrollRef}>
        <motion.div className="stack" variants={list} initial="hidden" animate="show">
          {cases.map((c) => (
            <motion.button
              key={c.id}
              className="card find-card"
              aria-pressed={c.id === selectedId}
              variants={item}
              whileTap={tap}
              onClick={() => onSelect(c.id)}
            >
              <span className="case-main">
                <span className="card-title">{c.name}</span>
                <span className="card-sub">{c.place} · Now</span>
              </span>
              <span className="find-meta">
                <StatusChip status={c.status} />
                <Battery level={c.battery} />
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
