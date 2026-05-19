import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /gifts — público, lista presentes disponíveis
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('gifts')
    .select('id, name, emoji, value, img_url, available')
    .order('created_at')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /gifts — admin cria presente
router.post('/', requireAdmin, async (req, res) => {
  const { name, emoji, value, img_url } = req.body
  if (!name || !value) return res.status(400).json({ error: 'name e value obrigatórios' })

  const { data, error } = await supabase
    .from('gifts')
    .insert({ name, emoji, value, img_url })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// DELETE /gifts/:id — admin remove
router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('gifts')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export default router