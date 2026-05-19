import { useState } from 'react'
import { useGifts } from '../hooks/useGifts'
import PaymentModal from './PaymentModal'

export default function Presentes() {
  const { gifts, loading, error } = useGifts()
  const [tab, setTab]             = useState('items')
  const [selectedGift, setSelectedGift] = useState(null)
  const [freeAmount, setFreeAmount]     = useState('')
  const [showFreeModal, setShowFreeModal] = useState(false)

  return (
    <section id="presentes">
      <p className="s-label">Lista de Presentes</p>
      <h2 className="s-title">Presenteie com Amor</h2>
      <p className="s-sub">Cada presente é uma forma de fazer parte deste novo capítulo.</p>
      <div className="s-rule">
        <div className="s-rule-line"></div>
        <div className="s-rule-dot"></div>
        <div className="s-rule-line"></div>
      </div>

      <div className="gift-toggle">
        <button className={`g-tab ${tab === 'items' ? 'on' : ''}`} onClick={() => setTab('items')}>Itens</button>
        <button className={`g-tab ${tab === 'free'  ? 'on' : ''}`} onClick={() => setTab('free')}>Valor Livre</button>
      </div>

      {tab === 'items' && (
        <div id="gift-grid">
          {loading && <p style={{ textAlign: 'center', color: '#7a6e68' }}>Carregando...</p>}
          {error   && <p style={{ textAlign: 'center', color: '#c47b7e' }}>{error}</p>}
          {!loading && gifts.map(g => (
            <div className="g-card" key={g.id}>
              <div className="g-thumb">
                {g.img_url
                  ? <img src={g.img_url} alt={g.name} onError={e => e.target.style.display='none'} />
                  : <span>{g.emoji || '🎁'}</span>}
              </div>
              <div className="g-body">
                <div className="g-name">{g.name}</div>
                <div className="g-price">
                  R$ {Number(g.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <button className="btn-pix" onClick={() => setSelectedGift(g)}>
                  Presentear 💝
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'free' && (
        <div className="free-box">
          <p>Quer contribuir com qualquer valor para nossa nova vida juntos?</p>
          <div className="inp-wrap">
            <i>R$</i>
            <input
              type="number" placeholder="0,00" min="1"
              value={freeAmount}
              onChange={e => setFreeAmount(e.target.value)}
            />
          </div>
          <button className="btn-rose" onClick={() => {
            if (!freeAmount || freeAmount <= 0) return alert('Informe um valor válido')
            setShowFreeModal(true)
          }}>
            Contribuir 💝
          </button>
        </div>
      )}

      {selectedGift && (
        <PaymentModal gift={selectedGift} onClose={() => setSelectedGift(null)} />
      )}
      {showFreeModal && (
        <PaymentModal amount={parseFloat(freeAmount)} onClose={() => setShowFreeModal(false)} />
      )}
    </section>
  )
}