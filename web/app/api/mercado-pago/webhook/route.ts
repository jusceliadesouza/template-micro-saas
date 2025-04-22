import { NextResponse, type NextRequest } from 'next/server'
import { Payment } from 'mercadopago'

import mpClient, { validateMercadoPagoWebhook } from '@/app/lib/mercado-pago'
import { handleMercadoPagoPayment } from '@/app/server/mercado-pago/handle-payment'

export async function POST (req: NextRequest) {
  try {
    validateMercadoPagoWebhook(req)

    const body = await req.json()

    const { type, data } = body

    switch (type) {
      case 'payment': {
        const payment = new Payment(mpClient)

        const paymentData = await payment.get({ id: data.id })

        if (
          paymentData.status === 'approved' ||
          paymentData.date_approved !== null
        ) {
          await handleMercadoPagoPayment(paymentData)
        }
        break
      }
      // case 'subscription_preapproval':
      //   const subscription = new Subscription(mpClient)

      //   const subscriptionData = await subscription.get({ id: data.id })

      //   if (subscriptionData.status === 'approved') {
      //     await handleMercadoPagoSubscription(subscriptionData)
      //   }
      //   break
      default:
        console.log('Event type not supported')
        break
    }

    return NextResponse.json(
      {
        received: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Error handling webhook', error)
    return NextResponse.json(
      {
        error: 'Error handling webhook'
      },
      { status: 500 }
    )
  }
}
