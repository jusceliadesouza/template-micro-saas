import mpClient, { validateMercadoPagoWebHook } from '@/app/lib/mercado-pago'
import { handleMercadoPagoPayment } from '@/app/server/mercado-pago/handle-payment'
import { Payment } from 'mercadopago'
import type { NextRequest } from 'next/server'

export async function POST (req: NextRequest) {
  try {
    validateMercadoPagoWebHook(req)

    const body = await req.json()

    const { type, data } = body

    switch (type) {
      case 'payment':
        // biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
        const payment = new Payment(mpClient)

        // biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
        const paymentData = await payment.get({ id: data.id })

        if (
          paymentData.status === 'approved' ||
          paymentData.date_approved === 'approved'
        ) {
          await handleMercadoPagoPayment(paymentData)
        }
        break
      case 'subscription_preapproval':
        // const subscription = new Subscription(mpClient)

        // const subscriptionData = await subscription.get({ id: data.id })

        // if (subscriptionData.status === 'approved') {
        //   await handleMercadoPagoSubscription(subscriptionData)
        // }
        break
      default:
        console.log('Event type not supported')
        break
    }
  } catch (error) {
    console.log(error)
  }
}
