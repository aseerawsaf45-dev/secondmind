/**
 * Next.js Server Instrumentation Hook
 * Runs once upon server startup across development and production environments.
 * Ensures fixed DNS and reliable networking are established before requests are handled.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setupFixedDns } = await import('@/lib/init-dns');
    setupFixedDns();
  }
}
