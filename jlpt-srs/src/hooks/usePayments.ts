import { useCallback } from 'react';
import { listProducts, createCheckoutOrder, createPaymentIntent, createSetupIntent } from '@/lib/api/payments';
import type { CreatePIResponse, CreateOrderResponse, ProductsResponse, SetupIntentResponse } from '@/lib/api/types';

export function usePayments() {
  const fetchCatalog = useCallback(async (): Promise<ProductsResponse> => {
    const catalog = await listProducts();
    // Normalize amounts to numbers and ensure currency
    const products = (catalog.products || []).map((p: any) => {
      const raw = p?.amount ?? p?.priceJpy ?? p?.unit_amount ?? p?.unitAmount ?? p?.price;
      const amount = Number(raw);
      const currency = (p?.currency || catalog.currency || 'jpy');
      return {
        ...p,
        amount: Number.isFinite(amount) ? amount : 0,
        currency: String(currency).toLowerCase() as 'jpy',
      };
    });
    const normalized = { ...catalog, products } as ProductsResponse;
    console.info('[wallet] payments_products', { count: products.length, ts: Date.now() });
    try { console.log('[wallet] products_normalized', products); } catch {}
    return normalized;
  }, []);

  const beginOrder = useCallback(
    async (
      sku: string,
      details?: { priceId?: string; amount?: number; shards?: number }
    ): Promise<{ orderId: string; clientSecret: string }> => {
      const order: CreateOrderResponse = await createCheckoutOrder(sku, details);
      console.info('[wallet] begin_order', {
        sku,
        provided: details ?? null,
        orderId: order.orderId,
        ts: Date.now(),
      });
      const intent: CreatePIResponse = await createPaymentIntent(order.orderId);
      return { orderId: order.orderId, clientSecret: intent.clientSecret };
    },
    []
  );

  const createSetup = useCallback(async (): Promise<SetupIntentResponse> => {
    const result = await createSetupIntent();
    console.info('[wallet] setup_intent', { ts: Date.now() });
    return result;
  }, []);

  return { fetchCatalog, beginOrder, createSetup };
}
