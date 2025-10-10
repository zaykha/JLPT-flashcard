import { useCallback } from 'react';
import { listProducts, createCheckoutOrder, createPaymentIntent, createSetupIntent } from '@/lib/api/payments';
import type { CreatePIResponse, CreateOrderResponse, ProductsResponse, SetupIntentResponse } from '@/lib/api/types';

export function usePayments() {
  const fetchCatalog = useCallback(async (): Promise<ProductsResponse> => {
    const catalog = await listProducts();
    console.info('[wallet] payments_products', { count: catalog.products.length, ts: Date.now() });
    return catalog;
  }, []);

  const beginOrder = useCallback(async (sku: string): Promise<{ orderId: string; clientSecret: string }> => {
    const order: CreateOrderResponse = await createCheckoutOrder(sku);
    console.info('[wallet] begin_order', { sku, orderId: order.orderId, ts: Date.now() });
    const intent: CreatePIResponse = await createPaymentIntent(order.orderId);
    return { orderId: order.orderId, clientSecret: intent.clientSecret };
  }, []);

  const createSetup = useCallback(async (): Promise<SetupIntentResponse> => {
    const result = await createSetupIntent();
    console.info('[wallet] setup_intent', { ts: Date.now() });
    return result;
  }, []);

  return { fetchCatalog, beginOrder, createSetup };
}
