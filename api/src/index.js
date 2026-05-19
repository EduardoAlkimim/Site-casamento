import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import giftsRouter    from './routes/gifts.js'
import paymentsRouter from './routes/payments.js'
import webhookRouter  from './routes/webhook.js'

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
})

app.use(cors({
  origin: process.env.FRONTEND_URL.split(',')
}))
app.use(express.json())
app.use(limiter)

app.use('/gifts',    giftsRouter)
app.use('/payments', paymentsRouter)
app.use('/webhook',  webhookRouter)

app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`))