import { Router } from 'express'
import { paymentClient } from '../lib/mercadopago.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/create', async (req, res) => {
  const {
    gift_id, payer_name, payer_email, amount, type,
    payment_method, installments, payer_cpf,
    card_number, card_expiry, card_cvv, card_name,
  } = req.body

  if (!payer_name || !payer_email || !amount) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' })
  }

  try {
    let paymentBody

    if (payment_method === 'card' && card_number) {
      // Tokeniza o cartão via API REST do MP
      const [expMonth, expYear] = (card_expiry || '').split('/')

      const tokenRes = await fetch('https://api.mercadopago.com/v1/card_tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_number,
          cardholder: {
            name: card_name,
            identification: {
              type:   'CPF',
              number: payer_cpf?.replace(/\D/g, ''),
            }
          },
          expiration_month: Number(expMonth),
          expiration_year:  Number(`20${expYear}`),
          security_code:    card_cvv,
        })
      })

      const tokenData = await tokenRes.json()

      if (!tokenData.id) {
        console.error('Erro tokenização:', tokenData)
        return res.status(400).json({ error: 'Dados do cartão inválidos' })
      }

      paymentBody = {
        transaction_amount: Number(amount),
        description: gift_id ? 'Presente de casamento' : 'Contribuição livre',
        token: tokenData.id,
        installments: Number(installments) || 1,
        payer: {
          email:      payer_email,
          first_name: payer_name.split(' ')[0],
          last_name:  payer_name.split(' ').slice(1).join(' ') || '-',
          identification: {
            type:   'CPF',
            number: payer_cpf?.replace(/\D/g, ''),
          },
        },
      }

    } else {
      // PIX
      paymentBody = {
        transaction_amount: Number(amount),
        description: gift_id ? 'Presente de casamento' : 'Contribuição livre',
        payment_method_id: 'pix',
        payer: {
          email:      payer_email,
          first_name: payer_name,
        },
      }
    }

    const payment = await paymentClient.create({ body: paymentBody })

    const { error: insertError } = await supabase.from('payments').insert({
      gift_id:        gift_id || null,
      payer_name,
      amount,
      type:           type || 'free',
      status:         payment.status || 'pending',
      mp_payment_id:  String(payment.id),
      payment_method: payment_method === 'card' ? 'card' : 'pix',
    })

    if (insertError) console.error('Erro ao salvar pagamento:', insertError)

    if (payment_method === 'card') {
      return res.json({
        status:        payment.status,
        status_detail: payment.status_detail,
        payment_id:    payment.id,
      })
    }

    return res.json({
      qr_code:        payment.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
      payment_id:     payment.id,
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar cobrança' })
  }
})

router.get('/status/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('mp_payment_id', req.params.id)
      .single()
    if (error) return res.status(404).json({ error: 'Não encontrado' })
    res.json({ status: data.status })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar status' })
  }
})

router.get('/installments', async (req, res) => {
  const { amount, bin } = req.query
  if (!amount || !bin) return res.status(400).json({ error: 'amount e bin obrigatórios' })

  try {
    const url = `https://api.mercadopago.com/v1/payment_methods/installments?amount=${amount}&bin=${bin}`
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    })
    const data = await resp.json()
    const installments = data?.[0]?.payer_costs || []
    res.json(installments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar parcelamento' })
  }
})

export default router