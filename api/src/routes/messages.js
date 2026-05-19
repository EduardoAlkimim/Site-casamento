import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// POST /messages — salva mensagem pós pagamento (público)
router.post('/', async (req, res) => {
  const { payment_id, sender_name, message, gift_name, amount } = req.body

  if (!sender_name || !message) {
    return res.status(400).json({ error: 'Nome e mensagem obrigatórios' })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ payment_id: payment_id || null, sender_name, message, gift_name, amount })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// GET /messages — lista mensagens (só admin)
router.get('/', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router