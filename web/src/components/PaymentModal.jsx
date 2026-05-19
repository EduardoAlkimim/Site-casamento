import { useState, useEffect } from 'react'
import api from '../lib/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const [method, setMethod]       = useState('pix')
  const [step, setStep]           = useState('form')
  const [loading, setLoading]     = useState(false)
  const [qrData, setQrData]       = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')

  const [cardNumber, setCardNumber]         = useState('')
  const [expiry, setExpiry]                 = useState('')
  const [cvv, setCvv]                       = useState('')
  const [cardName, setCardName]             = useState('')
  const [cpf, setCpf]                       = useState('')
  const [installments, setInstallments]     = useState(1)
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
    if (!EMAIL_REGEX.test(email)) { setEmailError('Digite um e-mail válido'); return }
    setEmailError('')
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
    if (!EMAIL_REGEX.test(email)) { setEmailError('Digite um e-mail válido'); return }
    setEmailError('')
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
              <button className={`pay-method-btn ${method === 'pix' ? 'on' : 'off'}`} onClick={() => setMethod('pix')}>PIX</button>
              <button className={`pay-method-btn ${method === 'card' ? 'on' : 'off'}`} onClick={() => setMethod('card')}>Cartão</button>
            </div>

            <input placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />
            <input
              placeholder="Seu e-mail"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              style={emailError ? { borderColor: '#e05c5c' } : {}}
            />
            {emailError && <p style={{ color: '#e05c5c', fontSize: '.8rem', margin: '-8px 0 4px' }}>{emailError}</p>}

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
          </>
        )}

        {step === 'success' && (
          <>
            <div className="modal-icon">🎉</div>
            <h3>Tudo certo!</h3>
            <p>{statusMsg}</p>
            <button onClick={onClose} style={{ marginTop: '1rem' }}>Fechar</button>
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