import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig } from 'mercadopago'
import crypto from 'node:crypto'

const mpClient = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    (() => {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined')
    })()
})

export default mpClient

export function validateMercadoPagoWebHook (req: NextRequest) {
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    return NextResponse.json(
      {
        error: 'Missing x-signature or x-request-id header'
      },
      { status: 400 }
    )
  }

  const signatureParts = xSignature.split(',')
  let ts = ''
  let v1 = ''

  // biome-ignore lint/complexity/noForEach: <explanation>
  signatureParts.forEach(part => {
    const [key, value] = part.split('=')

    if (key.trim() === 'ts') {
      ts = value.trim()
    } else if (key.trim() === 'v1') {
      v1 = value.trim()
    }
  })

  if (ts && v1) {
    return NextResponse.json({ error: 'Invalid x-signature' }, { status: 400 })
  }

  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id')

  let manifest = ''

  if (dataId) {
    manifest += `id: ${dataId}\n`
  }

  if (xRequestId) {
    manifest += `request-id: ${xRequestId}\n`
  }

  manifest += `ts: ${ts}\n`

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET!
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(manifest)

  const generatedHash = hmac.digest('hex')
  if (generatedHash !== v1) {
    return NextResponse.json({ error: 'Invalid x-signature' }, { status: 401 })
  }
}
