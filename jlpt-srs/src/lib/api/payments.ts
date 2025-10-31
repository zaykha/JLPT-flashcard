import { apiFetch } from '@/lib/api/http';
import type { ProductsResponse, CreateOrderResponse, CreatePIResponse, SetupIntentResponse } from '@/lib/api/types';

export function listProducts(): Promise<ProductsResponse> {
  return apiFetch<ProductsResponse>('/listProducts');
}

export function createCheckoutOrder(
  sku: string,
  extra?: { priceId?: string; amount?: number; shards?: number }
): Promise<CreateOrderResponse> {
  const payload: any = { sku, ...extra };
  return apiFetch<CreateOrderResponse>('/createCheckoutOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function createPaymentIntent(orderId: string): Promise<CreatePIResponse> {
  return apiFetch<CreatePIResponse>('/createPaymentIntent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });
}

export function createSetupIntent(): Promise<SetupIntentResponse> {
  return apiFetch<SetupIntentResponse>('/createSetupIntent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
}
