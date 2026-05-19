import { useState, useEffect, useCallback } from 'react'
import Presentes from './components/Presentes'
import AdminPortal from './components/AdminPortal'

// ── Countdown ──────────────────────────────────────────────────────────
function useCountdown(target) {
  const [time, setTime] = useState({})
  useEffect(() => {
    const tick = () => {
      let diff = Math.max(0, new Date(target) - new Date())
      const d = Math.floor(diff / 86400000); diff -= d * 86400000
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000
      const m = Math.floor(diff / 60000);    diff -= m * 60000
      const s = Math.floor(diff / 1000)
      setTime({ d, h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return time
}

// ── Timeline data ───────────────────────────────────────────────────────
const timeline = [
  { year: '2020', tag: 'O começo',     emoji: '🌸', title: 'O dia em que tudo começou',       text: 'Foi numa tarde comum que nossos caminhos se cruzaram pela primeira vez.' },
  { year: '2021', tag: 'A certeza',    emoji: '💫', title: 'Quando soubemos que éramos nós',  text: 'Com o tempo, cada momento juntos foi revelando uma verdade já escrita.' },
  { year: '2022', tag: 'A aventura',   emoji: '✈️', title: 'Descobrindo o mundo lado a lado', text: 'Viagens, risadas, desafios superados juntos. Cada experiência foi um tijolo.' },
  { year: '2024', tag: 'O pedido',     emoji: '💍', title: 'Ela disse sim',                    text: 'Com o coração na garganta, o pedido aconteceu. E o sim dela foi a resposta mais bonita.' },
  { year: '2027', tag: 'O grande dia', emoji: '🕊️', title: 'Para sempre começa aqui',         text: 'No dia 21 de abril de 2027, vamos prometer um ao outro tudo o que já sentimos.' },
]

// ── Galeria ─────────────────────────────────────────────────────────────
const fotos = [
  { src: '/foto1.jpg', legenda: 'Nosso pôr do sol' },
  { src: '/foto2.jpg', legenda: 'Na praia juntos' },
  { src: '/foto3.jpg', legenda: 'Um beijo no mar' },
  { src: '/foto4.jpg', legenda: 'Com flores' },
  { src: '/foto5.jpg', legenda: 'O anel' },
  { src: '/foto6.jpg', legenda: 'Correndo livres' },
  { src: '/foto7.jpg', legenda: 'O pedido' },
]

// ── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ fotos, index, onClose }) {
  const [current, setCurrent] = useState(index)

  const prev = useCallback(() => setCurrent(i => (i - 1 + fotos.length) % fotos.length), [fotos.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % fotos.length), [fotos.length])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  return (
    <div className="lightbox-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <button className="lb-nav lb-prev" onClick={prev}>‹</button>
      <div className="lb-content">
        <img src={fotos[current].src} alt={fotos[current].legenda} />
        <p className="lb-legenda">{fotos[current].legenda}</p>
        <span className="lb-counter">{current + 1} / {fotos.length}</span>
      </div>
      <button className="lb-nav lb-next" onClick={next}>›</button>
    </div>
  )
}

export default function App() {
  const { d, h, m, s } = useCountdown('2027-04-21T12:00:00')
  const [adminOpen, setAdminOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (window.location.search.includes('painel=et2027')) setAdminOpen(true)
    const keys = new Set()
    const down = e => {
      if (!e.key) return
      keys.add(e.key.toLowerCase())
      if (keys.has('control') && keys.has('shift') && keys.has('a')) {
        e.preventDefault(); setAdminOpen(true)
      }
    }
    const up = e => {
      if (!e.key) return
      keys.delete(e.key.toLowerCase())
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  return (
    <>
      {/* NAV */}
      <nav id="nav">
        <a href="#hero"      className="nav-link">Início</a>
        <a href="#historia"  className="nav-link">Nossa História</a>
        <a href="#galeria"   className="nav-link">Galeria</a>
        <a href="#presentes" className="nav-link">Presentes</a>
      </nav>

      {/* HERO com foto de fundo */}
      <section id="hero" style={{ backgroundImage: 'url(/foto2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <div className="hero-overlay"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <p className="hero-eyebrow">Convidamos você para celebrar</p>
        <div className="hero-names">
          <span className="first">Eduardo</span>
          <span className="amp">&</span>
          <span className="second">Thamires</span>
        </div>
        <p className="hero-tagline">21 de Abril de 2027 · Brasília, DF</p>
        <div className="hero-ornament">
          <div className="ornament-line"></div>
          <div className="ornament-diamond"></div>
          <div className="ornament-line right"></div>
        </div>
        <div id="countdown">
          {[['cd-d', d, 'Dias'], ['cd-h', h, 'Horas'], ['cd-m', m, 'Min'], ['cd-s', s, 'Seg']].map(([id, val, label]) => (
            <div className="cd" key={id}>
              <div className="cd-n">{String(val ?? '—').padStart(2, '0')}</div>
              <div className="cd-l">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HISTÓRIA */}
      <section id="historia">
        <p className="s-label">De dois a um</p>
        <h2 className="s-title">Nossa História</h2>
        <div className="s-rule"><div className="s-rule-line"></div><div className="s-rule-dot"></div><div className="s-rule-line"></div></div>
        <div className="timeline">
          {timeline.map((item, i) => (
            <div className="tl-item visible" key={i}>
              {i % 2 === 0 ? (
                <>
                  <div className="tl-content">
                    <span className="tl-tag">{item.tag}</span>
                    <h3 className="tl-heading">{item.title}</h3>
                    <p className="tl-text">{item.text}</p>
                  </div>
                  <div className="tl-photo-wrap">
                    <div className="tl-dot"></div>
                    <div className="tl-photo">{item.emoji}</div>
                    <span className="tl-year">{item.year}</span>
                  </div>
                  <div className="tl-content"></div>
                </>
              ) : (
                <>
                  <div className="tl-content"></div>
                  <div className="tl-photo-wrap">
                    <div className="tl-dot"></div>
                    <div className="tl-photo">{item.emoji}</div>
                    <span className="tl-year">{item.year}</span>
                  </div>
                  <div className="tl-content">
                    <span className="tl-tag">{item.tag}</span>
                    <h3 className="tl-heading">{item.title}</h3>
                    <p className="tl-text">{item.text}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA com fotos reais */}
      <section id="galeria">
        <p className="s-label">Momentos</p>
        <h2 className="s-title">Nossa Galeria</h2>
        <div className="s-rule"><div className="s-rule-line"></div><div className="s-rule-dot"></div><div className="s-rule-line"></div></div>
        <div className="gallery-grid">
          {fotos.map((foto, i) => (
            <div
              className="g-photo"
              key={i}
              onClick={() => setLightbox(i)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={foto.src}
                alt={foto.legenda}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="g-overlay">
                <span style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{foto.legenda}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRESENTES */}
      <Presentes />

      {/* FOOTER */}
      <footer>
        <div className="f-names">Eduardo & Thamires</div>
        <p>21 de Abril de 2027 · Brasília, DF · Feito com amor 🌸</p>
      </footer>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <Lightbox fotos={fotos} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* ADMIN */}
      {adminOpen && <AdminPortal onClose={() => setAdminOpen(false)} />}
    </>
  )
}