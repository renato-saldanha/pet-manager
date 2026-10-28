import { cn } from "@/lib/utils";

const baseURL = (process.env.NEXT_PUBLIC_URL_BACKEND || "").replace(/\/+$/, "");

export const MODO_DEMO = baseURL === "/api/mock" || baseURL.endsWith("/api/mock");

export default function ModoDemo({ className }: { className?: string }) {
  if (!MODO_DEMO) return null;

  return (
    <p
      role="status"
      className={cn(
        "bg-amber-50 text-amber-900 border border-amber-200 text-xs text-center px-3 py-1",
        className
      )}
    >
      Modo demonstração: dados fictícios (login: admin / admin)
    </p>
  );
}
