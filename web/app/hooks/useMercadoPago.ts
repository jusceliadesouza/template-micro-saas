import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { toast } from 'react-toastify'

export function useMercadoPago () {
  const router = useRouter()

  useEffect(() => {
    if (process.env.MERCADO_PAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.MERCADO_PAGO_PUBLIC_KEY)
    } else {
      console.error('MERCADO_PAGO_PUBLIC_KEY is not defined')
    }
  }, [])
  async function createMercadoPagoCheckout ({
    testId,
    userEmail
  }: {
    testId: string
    userEmail: string
  }) {
    try {
      const response = await fetch('/api/mercado-pago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testId, userEmail })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }

      const data = await response.json()
      router.push(data.initPoint)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar checkout')
      throw error
    }
  }

  return {
    createMercadoPagoCheckout
  }
}
