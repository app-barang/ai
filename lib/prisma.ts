// Prisma Client Singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// ===================== RETRY HELPER =====================
// Ulangi operasi DB yang gagal akibat masalah sambungan sementara
// (Supabase intermittent: P1001/P1002/P1017, ECONNRESET, timeout).

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1017"]);

function isTransient(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  if (code && TRANSIENT_CODES.has(code)) return true;
  const msg = (error as Error).message ?? "";
  return /can't reach database|connection (closed|reset|timed out)|timed out|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(
    msg
  );
}

export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransient(error) || i === attempts - 1) throw error;
      const delay = 500 * 2 ** i; // 500ms, 1s
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
