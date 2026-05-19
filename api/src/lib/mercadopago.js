import { MercadoPagoConfig, Payment } from 'mercadopago'

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export const paymentClient = new Payment(mpClient)