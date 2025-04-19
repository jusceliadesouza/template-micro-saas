import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import stripe from '@/app/lib/stripe'
import { handleStripeCancelSubscription } from '@/app/server/stripe/handle-cancel'
import { handleStripeSubscription } from '@/app/server/stripe/handle-subscription'
import { handleStripePayment } from '@/app/server/stripe/handle-payment'

const secret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST (req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature || !secret) {
      return NextResponse.json(
        { error: 'Not signature or secret' },
        { status: 400 }
      )
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret)

    switch (event.type) {
      // Pagamento realizado se status = paid - Pode ser tanto pamento único quanto assinatura
      case 'checkout.session.completed':
        // biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
        const metadata = event.data.object.metadata

        if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
          await handleStripePayment(event)
        }

        if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
          await handleStripeSubscription(event)
        }

        break
      case 'checkout.session.expired': // Expirou o tempo de pagamento
        console.log(
          'Enviar um email para o usuário informando que o pagamento expirou'
        )
        break
      case 'checkout.session.async_payment_succeeded': //Boleto pago
        console.log(
          'Enviar um email para o usuário informando que o boleto foi pago'
        )
        break
      case 'checkout.session.async_payment_failed': //Boleto falhou
        console.log(
          'Enviar um email para o usuário informando que o boleto falhou'
        )
        break
      case 'customer.subscription.created': // Assinatura criada
        console.log(
          'Enviar um email para o usuário informando que a assinatura foi criada'
        )
        break
      case 'customer.subscription.updated': // Assinatura atualizada
        console.log(
          'Enviar um email para o usuário informando que a assinatura foi atualizada'
        )
        break
      case 'customer.subscription.deleted': // Cancelou a assinatura
        await handleStripeCancelSubscription(event)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }
    return NextResponse.json({ received: 'Webhook received' }, { status: 200 })
  } catch (error) {
    console.error(error)
  }
}
