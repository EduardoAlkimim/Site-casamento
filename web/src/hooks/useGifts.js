import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useGifts() {
  const [gifts, setGifts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchGifts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/gifts')
      setGifts(data)
    } catch (err) {
      setError('Erro ao carregar presentes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGifts() }, [])

  const addGift = async (gift) => {
    const { data } = await api.post('/gifts', gift)
    setGifts(prev => [...prev, data])
  }

  const removeGift = async (id) => {
    await api.delete(`/gifts/${id}`)
    setGifts(prev => prev.filter(g => g.id !== id))
  }

  return { gifts, loading, error, addGift, removeGift, refetch: fetchGifts }
}