/**
 * useFacebookPixel
 * Hook centralizado para disparo de eventos do Meta (Facebook) Pixel.
 * ID: 965826996147177
 */

type FbqStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'AddToCart'
  | 'Lead'
  | 'Search'
  | 'CompleteRegistration';

interface FbqParams {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  [key: string]: unknown;
}

export const useFacebookPixel = () => {
  const track = (event: FbqStandardEvent, params?: FbqParams) => {
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', event, params);
      }
    } catch (e) {
      console.warn('[FacebookPixel] Erro ao disparar evento:', event, e);
    }
  };

  const trackViewContent = (params?: FbqParams) => track('ViewContent', params);
  const trackInitiateCheckout = (params?: FbqParams) => track('InitiateCheckout', params);
  const trackAddPaymentInfo = (params?: FbqParams) => track('AddPaymentInfo', params);
  const trackPurchase = (value: number, currency = 'BRL', extra?: FbqParams) =>
    track('Purchase', { value, currency, ...extra });

  return {
    track,
    trackViewContent,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
  };
};
