"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Flame } from "lucide-react";

export default function SelepasLoginPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Menyediakan dashboard anda...");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();
        if (cancelled) return;
        const role = session?.user?.role as string | undefined;
        if (!session?.user) {
          router.replace("/masuk");
          return;
        }
        if (role === "MERCHANT") router.replace("/merchant/dashboard");
        else if (role === "AFFILIATE") router.replace("/afiliator/dashboard");
        else if (role === "ADMIN") router.replace("/admin");
        else router.replace("/");
        router.refresh();
      } catch {
        setMsg("Gagal mendapatkan sesi. Sila log masuk semula.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bgalt px-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
        <Flame className="h-7 w-7 text-white" />
      </span>
      <div className="flex items-center gap-2 text-sm font-semibold text-textsec">
        <Loader2 className="h-4 w-4 animate-spin" /> {msg}
      </div>
    </div>
  );
}
