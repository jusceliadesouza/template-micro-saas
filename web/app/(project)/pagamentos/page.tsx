"use client";

import { useMercadoPago } from "@/app/hooks/useMercadoPago";
import { useStripe } from "@/app/hooks/useStripe";

export default function Pagamentos() {
  const {
    createPaymentStripeCheckout,
    createSubscriptionStripeCheckout,
    handleCreateStripePortal,
  } = useStripe();

  const { createMercadoPagoCheckout } = useMercadoPago();

  return (
    <div className="flex h-screen flex-col gap-10 items-center justify-center">
      <h1 className="text-4xl font-bold">Pagamentos</h1>
      <button
        type="button"
        className="border rounded-md px-4 py-2 cursor-pointer"
        onClick={() => createPaymentStripeCheckout({ testId: "123" })}
      >
        Criar Pagamento Stripe
      </button>
      <button
        type="button"
        className="border rounded-md px-4 py-2 cursor-pointer"
        onClick={() => createSubscriptionStripeCheckout({ testId: "123" })}
      >
        Criar Assinatura Stripe
      </button>
      <button
        type="button"
        className="border rounded-md px-4 py-2 cursor-pointer"
        onClick={handleCreateStripePortal}
      >
        Criar Portal Pagamento
      </button>
      <button
        type="button"
        className="border rounded-md px-4 py-2 cursor-pointer"
        onClick={() =>
          createMercadoPagoCheckout({ testId: "123", userEmail: "test@gmail.com" })
        }
      >
        Criar Pagamento Mercado Pago
      </button>
    </div>
  );
}
