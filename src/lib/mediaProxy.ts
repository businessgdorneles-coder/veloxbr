const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function proxyUrl(originalUrl: string): string {
  return `${SUPABASE_URL}/functions/v1/media-proxy?url=${encodeURIComponent(originalUrl)}`;
}
