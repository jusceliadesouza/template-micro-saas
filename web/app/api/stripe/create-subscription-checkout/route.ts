import { NextResponse, type NextRequest } from 'next/server'

import { auth } from '@/app/lib/auth'
import stripe from '@/app/lib/stripe'

import { getOrCreateCustomer } from '@/app/server/stripe/get-customer-id'

export async function POST (req: NextRequest) {
  try {
    const { testId } = await req.json()

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID!

    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 500 })
    }

    const session = await auth()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = await getOrCreateCustomer(userId, userEmail)

    const metadata = {
      testId,
      price,
      userId
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/`,
      customer: customerId,
      metadata
    })

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Session URL not found' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessionId: checkoutSession.id }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Interval Server Error' },
      { status: 500 }
    )
  }
}
