import { useState } from 'react'
import { useGifts } from '../hooks/useGifts'

export default function AdminPortal({ onClose }) {
  const [authed, setAuthed]   = useState(false)
  const [pass, setPass]       = useState('')
  const [error, setError]     = useState(false)
  const [form, setForm]       = useState({ name: '', emoji: '🎁', value: '', img_url: '' })
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
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button onClick={handleLogin}>Entrar</button>
            {error && <p className="err-msg">Senha incorreta.</p>}
          </div>
        ) : (
          <div className="admin-panel">
            <div className="a-card">
              <h3>Cadastrar novo presente</h3>
              <div className="a-grid">
                <div>
                  <label>Nome do presente</label>
                  <input placeholder="Ex: Jogo de Panelas"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label>Valor (R$)</label>
                  <input type="number" placeholder="0.00"
                    value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })} />
                </div>
                <div>
                  <label>Emoji</label>
                  <input placeholder="🎁" maxLength={2}
                    value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })} />
                </div>
                <div>
                  <label>URL da imagem (opcional)</label>
                  <input placeholder="https://..."
                    value={form.img_url}
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
                {gifts.length === 0 && <p>Nenhum item ainda.</p>}
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
          </div>
        )}
      </div>
    </div>
  )
}