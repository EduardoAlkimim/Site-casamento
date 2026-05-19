import { Router } from 'express'
import { paymentClient } from '../lib/mercadopago.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/', async (req, res) => {
  console.log('WEBHOOK RECEBIDO:', JSON.stringify(req.body))
  const { type, data } = req.body

  if (type !== 'payment') return res.sendStatus(200)

  try {
    const payment = await paymentClient.get({ id: data.id })
    const status = payment.status
    console.log('STATUS DO PAGAMENTO:', status, 'ID:', data.id)

    await supabase
      .from('payments')
      .update({ status })
      .eq('mp_payment_id', String(data.id))

    res.sendStatus(200)
  } catch (err) {
    console.error('ERRO WEBHOOK:', err)
    res.sendStatus(500)
  }
})

export default router