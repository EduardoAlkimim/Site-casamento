import { useState, useEffect } from 'react'
import api from '../lib/api'

function formatCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim()
}

function formatExpiry(v) {
  return v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')
}

export default function PaymentModal({ gift, amount, onClose }) {
  const valor = gift?.value || amount

  const [method, setMethod]         = useState('pix')
  const [step, setStep]             = useState('form')
  const [loading, setLoading]       = useState(false)
  const [qrData, setQrData]         = useState(null)
  const [statusMsg, setStatusMsg]   = useState('')
  const [lastPaymentId, setLastPaymentId] = useState(null)
  const [msgStep, setMsgStep]       = useState('')
  const [msgText, setMsgText]       = useState('')

  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')

  const [cardNumber, setCardNumber]           = useState('')
  const [expiry, setExpiry]                   = useState('')
  const [cvv, setCvv]                         = useState('')
  const [cardName, setCardName]               = useState('')
  const [cpf, setCpf]                         = useState('')
  const [installments, setInstallments]       = useState(1)
  const [installmentOpts, setInstallmentOpts] = useState([])

  useEffect(() => {
    const bin = cardNumber.replace(/\s/g, '').slice(0, 6)
    if (bin.length < 6 || !valor) { setInstallmentOpts([]); return }
    api.get(`/payments/installments?amount=${valor}&bin=${bin}`)
      .then(r => setInstallmentOpts(r.data))
      .catch(() => setInstallmentOpts([]))
  }, [cardNumber, valor])

  const handlePix = async () => {
    if (!name || !email) return alert('Preencha nome e e-mail')
    setLoading(true)
    try {
      const { data } = await api.post('/payments/create', {
        gift_id:        gift?.id || null,
        payer_name:     name,
        payer_email:    email,
        amount:         valor,
        type:           gift ? 'gift' : 'free',
        payment_method: 'pix',
      })
      setQrData(data)
      setLastPaymentId(data.payment_id)
      setStep('qr')
    } catch {
      alert('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCard = async () => {
    if (!name || !email || !cardNumber || !expiry || !cvv || !cardName || !cpf) {
      return alert('Preencha todos os campos do cartão')
    }
    setLoading(true)
    try {
      const { data } = await api.post('/payments/create', {
        gift_id:        gift?.id || null,
        payer_name:     name,
        payer_email:    email,
        amount:         valor,
        type:           gift ? 'gift' : 'free',
        payment_method: 'card',
        card_number:    cardNumber.replace(/\s/g, ''),
        card_expiry:    expiry,
        card_cvv:       cvv,
        card_name:      cardName,
        installments,
        payer_cpf:      cpf,
      })

      setLastPaymentId(data.payment_id)

      if (data.status === 'approved') {
        setStatusMsg('Pagamento aprovado! Obrigado pelo presente 💕')
        setStep('success')
      } else if (data.status === 'in_process') {
        setStatusMsg('Pagamento em análise. Você receberá uma confirmação por e-mail.')
        setStep('success')
      } else {
        setStatusMsg('Pagamento não aprovado. Verifique os dados e tente novamente.')
        setStep('error')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao processar pagamento. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!msgText.trim()) return alert('Escreva uma mensagem!')
    try {
      await api.post('/messages', {
        payment_id:  lastPaymentId,
        sender_name: name,
        message:     msgText,
        gift_name:   gift?.name || 'Contribuição livre',
        amount:      valor,
      })
      setMsgStep('sent')
    } catch {
      alert('Erro ao enviar mensagem. Tente novamente.')
    }
  }

  const MsgBlock = () => (
    <>
      {msgStep === '' && (
        <button onClick={() => setMsgStep('form')} style={{ marginTop:'1rem', width:'100%', padding:'.75rem', background:'var(--rose)', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'inherit', fontSize:'.7rem', letterSpacing:'.16em', textTransform:'uppercase', cursor:'pointer' }}>
          💌 Deixar uma mensagem aos noivos
        </button>
      )}
      {msgStep === 'form' && (
        <div style={{ marginTop:'1rem' }}>
          <textarea
            placeholder="Escreva sua mensagem com carinho... 💕"
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            rows={4}
            style={{ width:'100%', padding:'.75rem', borderRadius:'8px', border:'1px solid #f2dede', fontFamily:'inherit', fontSize:'.9rem', resize:'vertical', outline:'none', color:'#1a1410' }}
          />
          <button onClick={handleSendMessage} style={{ marginTop:'.5rem', width:'100%', padding:'.75rem', background:'var(--rose)', color:'#fff', border:'none', borderRadius:'8px', fontFamily:'inherit', fontSize:'.7rem', letterSpacing:'.16em', textTransform:'uppercase', cursor:'pointer' }}>
            Enviar mensagem 💌
          </button>
        </div>
      )}
      {msgStep === 'sent' && (
        <p style={{ marginTop:'1rem', color:'var(--rose)', fontSize:'.85rem', textAlign:'center' }}>
          💌 Mensagem enviada! Obrigado pelo carinho.
        </p>
      )}
    </>
  )

  const valorFmt = Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-pay">
        <button className="modal-x" onClick={onClose}>✕</button>

        <div className="modal-icon">{method === 'pix' ? '💸' : '💳'}</div>
        <h3>{gift ? gift.name : 'Contribuição Livre'}</h3>
        <p>Valor: <strong>R$ {valorFmt}</strong></p>

        {step === 'form' && (
          <>
            <div className="pay-method-toggle">
              <button className={`pay-method-btn ${method === 'pix' ? 'on' : ''}`} onClick={() => setMethod('pix')}>PIX</button>
              <button className={`pay-method-btn ${method === 'card' ? 'on' : ''}`} onClick={() => setMethod('card')}>Cartão</button>
            </div>

            <input placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Seu e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />

            {method === 'pix' && (
              <button onClick={handlePix} disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar QR Code PIX'}
              </button>
            )}

            {method === 'card' && (
              <>
                <input placeholder="Número do cartão" value={cardNumber}
                  onChange={e => setCardNumber(formatCard(e.target.value))} inputMode="numeric" />
                <div className="card-row">
                  <input placeholder="Validade MM/AA" value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))} inputMode="numeric" />
                  <input placeholder="CVV" value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" />
                </div>
                <input placeholder="Nome no cartão" value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())} />
                <input placeholder="CPF do titular" value={cpf}
                  onChange={e => setCpf(formatCPF(e.target.value))} inputMode="numeric" />
                {installmentOpts.length > 0 && (
                  <select className="install-select" value={installments}
                    onChange={e => setInstallments(Number(e.target.value))}>
                    {installmentOpts.map(opt => (
                      <option key={opt.installments} value={opt.installments}>
                        {opt.recommended_message}
                      </option>
                    ))}
                  </select>
                )}
                <button onClick={handleCard} disabled={loading}>
                  {loading ? 'Processando...' : `Pagar R$ ${valorFmt}`}
                </button>
              </>
            )}
          </>
        )}

        {step === 'qr' && qrData && (
          <>
            <div className="modal-icon">✅</div>
            <h3>Escaneie o QR Code</h3>
            <img src={`data:image/png;base64,${qrData.qr_code_base64}`} alt="QR Code PIX"
              style={{ width: '180px', margin: '1rem auto', display: 'block' }} />
            <p>Ou copie o código PIX:</p>
            <div className="pix-box" onClick={() => navigator.clipboard.writeText(qrData.qr_code)} title="Clique para copiar">
              {qrData.qr_code.slice(0, 60)}...
            </div>
            <p style={{ fontSize: '.75rem', marginTop: '1rem', color: '#7a6e68' }}>
              Após pagar, o presente é confirmado automaticamente 💕
            </p>
            <MsgBlock />
          </>
        )}

        {step === 'success' && (
          <>
            <div className="modal-icon">🎉</div>
            <h3>Tudo certo!</h3>
            <p>{statusMsg}</p>
            <MsgBlock />
            <button onClick={onClose} style={{ marginTop:'1rem', background:'none', border:'1px solid #f2dede', borderRadius:'8px', padding:'.6rem 1.2rem', cursor:'pointer', color:'#7a6e68', fontSize:'.75rem' }}>
              Fechar
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <div className="modal-icon">❌</div>
            <h3>Não aprovado</h3>
            <p>{statusMsg}</p>
            <button onClick={() => setStep('form')} style={{ marginTop: '1rem' }}>Tentar novamente</button>
          </>
        )}
      </div>
    </div>
  )
}