import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadStripe, type StripeElementLocale } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import styled, { useTheme } from 'styled-components';
import type { Product } from '@/lib/api/types';
import { usePayments } from '@/hooks/usePayments';
import { useWalletContext } from '@/features/wallet/WalletProvider';
import { ProductCard } from '@/features/wallet/ProductCard';
import {
  ModalBackdrop,
  ModalCard,
  ModalHeader,
  CloseButton,
  ProductGrid,
  PrimaryButton,
  GhostButton,
  HelperText,
  Divider,
  Spinner,
} from '@/features/wallet/styles';

// Lazy initialize Stripe inside the Checkout component so we don't throw
// IntegrationError at module load when the key is not configured yet.
const RECOMMENDED_SKU = 'SHARDS_4980';
const currencyFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

type CatalogState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  currency: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialSku?: string;
};

export const BuyShardsModal: React.FC<Props> = ({ open, onClose, initialSku }) => {
  const { fetchCatalog, beginOrder } = usePayments();
  const { refresh } = useWalletContext();
  const [catalog, setCatalog] = useState<CatalogState>({ products: [], loading: false, error: null, currency: 'JPY' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<'catalog' | 'checkout' | 'processing'>('catalog');
  const [message, setMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedProduct(null);
      setClientSecret(null);
      setOrderId(null);
      setStatus('catalog');
      setMessage(null);
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && modalRef.current) {
        trapFocus(event, modalRef.current);
      }
    };

    document.addEventListener('keydown', handleKey);
    const focusTimer = window.setTimeout(() => {
      const focusable = modalRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusable?.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', handleKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  const handleSelect = async (product: Product) => {
    setSelectedProduct(product);
    setStatus('processing');
    setMessage(null);
    try {
      console.info('wallet.select_sku', { sku: product.sku, ts: Date.now() });
      // Provide backend with priceId/amount/shards to avoid undefined fields
      const priceId = (product as any).priceId ?? (product as any).stripePriceId ?? undefined;
      const amount = Number.isFinite(Number((product as any).amount ?? (product as any).priceJpy))
        ? Number((product as any).amount ?? (product as any).priceJpy)
        : undefined;
      const { orderId: id, clientSecret: secret } = await beginOrder(product.sku, {
        priceId,
        amount,
        shards: (product as any).shards,
      });
      console.info('wallet.begin_order', { sku: product.sku, orderId: id, ts: Date.now() });
      setOrderId(id);
      setClientSecret(secret);
      setStatus('checkout');
    } catch (error) {
      setMessage(friendlyMessage(error));
      setStatus('catalog');
    }
  };

  useEffect(() => {
    if (!open) return;
    setCatalog(prev => ({ ...prev, loading: true, error: null }));
    fetchCatalog()
      .then(response => {
        console.info('wallet.catalog_loaded', { count: response.products.length, ts: Date.now() });
        // Debug: log full products received from backend for inspection
        try { console.log('[wallet] products_raw', response.products); } catch {}
        setCatalog({ products: response.products, loading: false, error: null, currency: response.currency });
        if (initialSku) {
          const found = response.products.find(p => p.sku === initialSku);
          if (found) void handleSelect(found);
        }
      })
      .catch(err => {
        setCatalog({ products: [], loading: false, error: friendlyMessage(err), currency: 'JPY' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedProduct(null);
      setClientSecret(null);
      setOrderId(null);
      setStatus('catalog');
      setMessage(null);
    }, 200);
  };

  if (!open) return null;

  return (
    <ModalBackdrop>
      <ModalCard ref={modalRef} role="dialog" aria-modal="true" aria-label="Buy shards">
        <ModalHeader>
          <h3>Shards Store</h3>
          <CloseButton type="button" onClick={resetAndClose}>✖</CloseButton>
        </ModalHeader>

        {catalog.loading && <Spinner />}
        {!catalog.loading && status === 'processing' && !clientSecret && <Spinner />}
        {catalog.error && <ErrorText>{catalog.error}</ErrorText>}

        {!catalog.loading && !clientSecret && (
          <Catalog products={catalog.products} onSelect={handleSelect} processing={status === 'processing'} />
        )}

        {clientSecret && selectedProduct && (
          <Checkout
            clientSecret={clientSecret}
            orderId={orderId}
            product={selectedProduct}
            onClose={resetAndClose}
            setMessage={setMessage}
            refresh={refresh}
          />
        )}

        {message && <Status>{message}</Status>}
      </ModalCard>
    </ModalBackdrop>
  );
};

const Catalog: React.FC<{ products: Product[]; onSelect: (p: Product) => void; processing: boolean }> = ({ products, onSelect, processing }) => {
  const recommended = useMemo(() => products.find(p => p.sku === RECOMMENDED_SKU)?.sku, [products]);

  if (!products.length) {
    return <HelperText>We couldn’t load products. Please try again shortly.</HelperText>;
  }

  return (
    <>
      <HelperText>Purchased shards unlock extra lessons and profile upgrades.</HelperText>
      <ProductGrid>
        {products.map(product => (
          <ProductCard
            key={product.sku}
            product={product}
            highlight={product.sku === recommended}
            onSelect={selected => {
              if (processing) return;
              onSelect(selected);
            }}
          />
        ))}
      </ProductGrid>
    </>
  );
};

type CheckoutProps = {
  clientSecret: string;
  orderId: string | null;
  product: Product;
  onClose: () => void;
  setMessage: (value: string | null) => void;
  refresh: () => Promise<void>;
};

const Checkout: React.FC<CheckoutProps> = ({ clientSecret, orderId, product, onClose, setMessage, refresh }) => {
  const theme = useTheme();
  const isDark = useMemo(() => {
    // Rough luminance check for theme background
    const hex = String(theme.colors.bg || '#000').replace('#','');
    const bigint = parseInt(hex.length === 3 ? hex.split('').map(c=>c+c).join('') : hex, 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    const luminance = 0.2126*r + 0.7152*g + 0.0722*b; // 0..255
    return luminance < 140;
  }, [theme.colors.bg]);

  const options = useMemo(() => ({
    clientSecret,
    locale: (import.meta.env.VITE_STRIPE_LOCALE ?? 'auto') as StripeElementLocale,
    appearance: {
      theme: (isDark ? 'night' : 'stripe') as 'flat' | 'stripe' | 'night',
      variables: {
        colorText: theme.colors.text,
        colorBackground: theme.colors.sheetBg,
        colorPrimary: theme.colors.primary,
        colorDanger: theme.colors.danger,
        fontFamily: theme.fonts.body,
        borderRadius: '10px',
      },
    },
  }), [clientSecret, isDark, theme.colors.text, theme.colors.sheetBg, theme.colors.primary, theme.colors.danger, theme.fonts.body]);

  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  if (!pk) {
    return <ErrorText>No Stripe publishable key configured.</ErrorText>;
  }

  const stripePromise = useMemo(() => loadStripe(pk), [pk]);

  return (
    <Elements stripe={stripePromise} options={options}>
      <Divider />
      <CheckoutForm product={product} orderId={orderId} onClose={onClose} setMessage={setMessage} refresh={refresh} />
    </Elements>
  );
};

type CheckoutFormProps = {
  product: Product;
  orderId: string | null;
  onClose: () => void;
  setMessage: (value: string | null) => void;
  refresh: () => Promise<void>;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, orderId, onClose, setMessage, refresh }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    setMessage(null);
  }, [setMessage]);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setMessage(null);
    console.info('wallet.confirm_payment', { sku: product.sku, orderId, ts: Date.now() });

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        // Provide minimal billing details so flows that require a name succeed
        payment_method_data: {
          billing_details: { name: 'Cardholder' },
        },
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setMessage(result.error.message ?? 'Payment was not completed.');
      setSubmitting(false);
      return;
    }

    await refresh();
    if (typeof window !== 'undefined' && window.location.pathname === '/wallet') {
      const el = document.getElementById('wallet-balance');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    console.info('wallet.sync_after_payment', { sku: product.sku, orderId, ts: Date.now()});
    setMessage('+ Shards added!');
    setTimeout(onClose, 800);
  };

  return (
    <CheckoutWrap>
      <CheckoutHeader>
        <div>
          <span role="img" aria-label="glyph shards">💠</span>
          <strong>{product.shards.toLocaleString('ja-JP')} shards</strong>
        </div>
        <small>{currencyFormatter.format(Number.isFinite(Number((product as any).amount)) ? Number((product as any).amount) : 0)}</small>
      </CheckoutHeader>

      <PaymentElement onReady={() => setPaymentReady(true)} />

      <Actions>
        <GhostButton type="button" onClick={onClose} disabled={submitting}>Cancel</GhostButton>
        <PrimaryButton
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !paymentReady}
        >
          {submitting ? 'Processing…' : `Pay ${currencyFormatter.format(Number.isFinite(Number((product as any).amount)) ? Number((product as any).amount) : 0)}`}
        </PrimaryButton>
      </Actions>
    </CheckoutWrap>
  );
};

function friendlyMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in (error as any)) {
    return String((error as any).message);
  }
  return 'Something went wrong.';
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return;
  const focusable = container.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
}

const ErrorText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.danger};
`;

const Status = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
`;

const CheckoutWrap = styled.div`
  display: grid;
  gap: 16px;
`;

const CheckoutHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    margin-right: 8px;
  }
  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
  }
  small {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text};
  }
  @media (max-width: 480px) { flex-direction: column; align-items: flex-start; gap: 6px; }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  @media (max-width: 480px) { flex-wrap: wrap; button { flex: 1 1 auto; } }
`;
