import { supabase } from "@/integrations/supabase/client";

interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface MetaCustomData {
  value?: number;
  currency?: string;
  content_type?: string;
  content_name?: string;
  content_ids?: string[];
  contents?: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
}

// Get fbclid cookie (_fbc) and browser id (_fbp) if present
function getFbc(): string | undefined {
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      return fbc;
    }
    // Try cookie
    const match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/);
    return match?.[1] || undefined;
  } catch {
    return undefined;
  }
}

function getFbp(): string | undefined {
  try {
    const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/);
    return match?.[1] || undefined;
  } catch {
    return undefined;
  }
}

// Fire client-side pixel event
function firePixelEvent(eventName: string, params?: MetaCustomData): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (fbq) {
      if (params) {
        fbq("track", eventName, params);
      } else {
        fbq("track", eventName);
      }
    }
  } catch (err) {
    console.error("[Meta Pixel] Client-side error:", err);
  }
}

// Fire server-side CAPI event
async function fireServerEvent(
  eventName: string,
  userData: MetaUserData = {},
  customData?: MetaCustomData
): Promise<void> {
  try {
    const enrichedUser: MetaUserData = {
      ...userData,
      userAgent: navigator.userAgent,
      fbc: userData.fbc || getFbc(),
      fbp: userData.fbp || getFbp(),
    };

    await supabase.functions.invoke("meta-events", {
      body: {
        eventName,
        userData: enrichedUser,
        customData,
        eventSourceUrl: window.location.href,
      },
    });
  } catch (err) {
    console.error("[Meta CAPI] Server-side error:", err);
  }
}

// ===== Public event functions =====

export async function metaTrackPageView(userData?: MetaUserData): Promise<void> {
  firePixelEvent("PageView");
  await fireServerEvent("PageView", userData || {});
}

export async function metaTrackViewContent(userData?: MetaUserData): Promise<void> {
  const customData: MetaCustomData = {
    content_type: "product",
    content_name: "Tapetes Bandeja 3D Premium",
    content_ids: ["tapetes-bandeja-3d"],
    currency: "BRL",
    value: 173.93,
  };

  firePixelEvent("ViewContent", customData);
  await fireServerEvent("ViewContent", userData || {}, customData);
}

export async function metaTrackInitiateCheckout(
  userData: MetaUserData,
  price: number,
  kitLabel: string
): Promise<void> {
  const customData: MetaCustomData = {
    value: price,
    currency: "BRL",
    content_type: "product",
    content_name: kitLabel,
    content_ids: ["tapetes-bandeja-3d"],
    contents: [{ id: "tapetes-bandeja-3d", quantity: 1, item_price: price }],
  };

  firePixelEvent("InitiateCheckout", customData);
  await fireServerEvent("InitiateCheckout", userData, customData);
}

export async function metaTrackPurchase(
  userData: MetaUserData,
  price: number,
  kitLabel: string
): Promise<void> {
  const customData: MetaCustomData = {
    value: price,
    currency: "BRL",
    content_type: "product",
    content_name: kitLabel,
    content_ids: ["tapetes-bandeja-3d"],
    contents: [{ id: "tapetes-bandeja-3d", quantity: 1, item_price: price }],
  };

  firePixelEvent("Purchase", customData);
  await fireServerEvent("Purchase", userData, customData);
}
