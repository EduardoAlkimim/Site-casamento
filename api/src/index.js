import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import giftsRouter    from './routes/gifts.js'
import paymentsRouter from './routes/payments.js'
import webhookRouter  from './routes/webhook.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use('/gifts',    giftsRouter)
app.use('/payments', paymentsRouter)
app.use('/webhook',  webhookRouter)

app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`))