import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

let sessionId: string;
const getSessionId = () => {
  if (!sessionId) {
    sessionId = sessionStorage.getItem("_vsid") || crypto.randomUUID();
    sessionStorage.setItem("_vsid", sessionId);
  }
  return sessionId;
};

export function useVisitorTracking(page: "home" | "checkout", step?: number) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const sid = getSessionId();
    const channel = supabase.channel("visitor-presence", {
      config: { presence: { key: sid } },
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ page, step: step ?? null, ts: Date.now() });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, step]);
}
