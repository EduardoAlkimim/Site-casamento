import { useState, useEffect } from 'react'
import { useGifts } from '../hooks/useGifts'
import api from '../lib/api'

export default function AdminPortal({ onClose }) {
  const [authed, setAuthed]     = useState(false)
  const [pass, setPass]         = useState('')
  const [error, setError]       = useState(false)
  const [form, setForm]         = useState({ name: '', emoji: '🎁', value: '', img_url: '' })
  const [tab, setTab]           = useState('gifts')
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const { gifts, addGift, removeGift } = useGifts()

  const handleLogin = () => {
    const token = import.meta.env.VITE_ADMIN_TOKEN
    if (pass === token) {
      sessionStorage.setItem('admin_token', token)
      setAuthed(true)
    } else {
      setError(true)
    }
  }

  const fetchMessages = async () => {
    setLoadingMsgs(true)
    try {
      const token = sessionStorage.getItem('admin_token')
      const { data } = await api.get('/messages', {
        headers: { 'x-admin-token': token }
      })
      setMessages(data)
    } catch {
      alert('Erro ao carregar mensagens.')
    } finally {
      setLoadingMsgs(false)
    }
  }

  useEffect(() => {
    if (authed && tab === 'messages') fetchMessages()
  }, [authed, tab])

  const handleAdd = async () => {
    if (!form.name || !form.value) return alert('Preencha nome e valor')
    await addGift({ ...form, value: parseFloat(form.value) })
    setForm({ name: '', emoji: '🎁', value: '', img_url: '' })
  }

  const handleRemove = async (id) => {
    if (!confirm('Remover este presente?')) return
    await removeGift(id)
  }

  return (
    <div className="admin-portal">
      <div className="admin-inner">
        <div className="admin-header">
          <h2>✦ Painel Administrativo</h2>
          <button onClick={onClose}>Fechar ✕</button>
        </div>

        {!authed ? (
          <div className="admin-gate">
            <p>Área restrita. Informe a senha para continuar.</p>
            <input
              type="password" placeholder="••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button onClick={handleLogin}>Entrar</button>
            {error && <p className="err-msg">Senha incorreta.</p>}
          </div>
        ) : (
          <div className="admin-panel">

            {/* Tabs */}
            <div style={{ display:'flex', gap:0, marginBottom:'1.5rem', background:'rgba(255,255,255,.06)', borderRadius:'10px', overflow:'hidden', border:'1px solid rgba(255,255,255,.08)' }}>
              {[['gifts','🎁 Presentes'], ['messages','💌 Mensagens']].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ flex:1, padding:'.7rem', background: tab===key ? 'var(--rose)' : 'transparent', color:'#fff', border:'none', fontFamily:'inherit', fontSize:'.7rem', letterSpacing:'.14em', textTransform:'uppercase', cursor:'pointer', transition:'background .2s' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Presentes */}
            {tab === 'gifts' && (
              <>
                <div className="a-card">
                  <h3>Cadastrar novo presente</h3>
                  <div className="a-grid">
                    <div>
                      <label>Nome do presente</label>
                      <input placeholder="Ex: Jogo de Panelas" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label>Valor (R$)</label>
                      <input type="number" placeholder="0.00" value={form.value}
                        onChange={e => setForm({ ...form, value: e.target.value })} />
                    </div>
                    <div>
                      <label>Emoji</label>
                      <input placeholder="🎁" maxLength={2} value={form.emoji}
                        onChange={e => setForm({ ...form, emoji: e.target.value })} />
                    </div>
                    <div>
                      <label>URL da imagem (opcional)</label>
                      <input placeholder="https://..." value={form.img_url}
                        onChange={e => setForm({ ...form, img_url: e.target.value })} />
                    </div>
                    <div className="a-full">
                      <button onClick={handleAdd}>+ Adicionar à lista</button>
                    </div>
                  </div>
                </div>

                <div className="a-card">
                  <h3>Itens cadastrados ({gifts.length})</h3>
                  <div className="a-list">
                    {gifts.length === 0 && <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.82rem' }}>Nenhum item ainda.</p>}
                    {gifts.map(g => (
                      <div className="a-item" key={g.id}>
                        <span>{g.emoji}</span>
                        <div>
                          <strong>{g.name}</strong>
                          <span>R$ {Number(g.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <button onClick={() => handleRemove(g.id)}>Remover</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tab Mensagens */}
            {tab === 'messages' && (
              <div className="a-card">
                <h3 style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  💌 Mensagens recebidas
                  <button onClick={fetchMessages} style={{ background:'none', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.6)', borderRadius:'6px', padding:'.3rem .7rem', fontSize:'.65rem', cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>
                    Atualizar
                  </button>
                </h3>
                {loadingMsgs && <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.82rem' }}>Carregando...</p>}
                {!loadingMsgs && messages.length === 0 && (
                  <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.82rem' }}>Nenhuma mensagem ainda.</p>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'.5rem' }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'1rem 1.2rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.4rem' }}>
                        <strong style={{ color:'#fff', fontSize:'.9rem' }}>{m.sender_name}</strong>
                        <span style={{ fontSize:'.7rem', color:'rgba(255,255,255,.3)' }}>
                          {new Date(m.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      {m.gift_name && (
                        <p style={{ fontSize:'.72rem', color:'var(--rose)', marginBottom:'.4rem' }}>
                          🎁 {m.gift_name} {m.amount ? `— R$ ${Number(m.amount).toLocaleString('pt-BR', { minimumFractionDigits:2 })}` : ''}
                        </p>
                      )}
                      <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.7)', lineHeight:1.6, fontStyle:'italic' }}>
                        "{m.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}