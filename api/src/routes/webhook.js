import { Router } from 'express'
import { paymentClient } from '../lib/mercadopago.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

// POST /webhook — Mercado Pago notifica aqui
router.post('/', async (req, res) => {
  const { type, data } = req.body

  // Só processa notificações de pagamento
  if (type !== 'payment') return res.sendStatus(200)

  try {
    // Busca o pagamento no MP para confirmar
    const payment = await paymentClient.get({ id: data.id })
    const status = payment.status // 'approved', 'rejected', etc.

    // Atualiza no banco
    await supabase
      .from('payments')
      .update({ status })
      .eq('mp_payment_id', String(data.id))

    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

export default router