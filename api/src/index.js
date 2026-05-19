import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import giftsRouter    from './routes/gifts.js'
import paymentsRouter from './routes/payments.js'
import webhookRouter  from './routes/webhook.js'
import messagesRouter from './routes/messages.js'

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
})

const statusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
})

const allowedOrigins = process.env.FRONTEND_URL.split(',')

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())
app.use(limiter)

app.use('/gifts',            giftsRouter)
app.use('/payments/status', statusLimiter)
app.use('/payments',        paymentsRouter)
app.use('/webhook',         webhookRouter)
app.use('/messages',        messagesRouter)
app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`))