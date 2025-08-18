// lib/idempotency.ts
// Tiny in-memory idempotency guard for early-stage use.
// Drops quick duplicate requests for a short TTL window.
// NOTE: This is per-process memory. For multi-instance or edge/serverless scaling,
// switch to a shared store (e.g., Redis) later.

declare global {
  // Persist across hot reloads in dev
  // eslint-disable-next-line no-var
  var __IDEMPOTENCY_STORE__: Map<string, number> | undefined;
}

const TTL_MS = 2 * 60 * 1000; // 2 minutes

const store: Map<string, number> =
  globalThis.__IDEMPOTENCY_STORE__ ?? new Map<string, number>();

if (!globalThis.__IDEMPOTENCY_STORE__) {
  globalThis.__IDEMPOTENCY_STORE__ = store;
}

/**
 * Remove expired keys.
 */
function cleanup(now = Date.now()) {
  for (const [k, exp] of store) {
    if (exp <= now) store.delete(k);
  }
}

/**
 * Returns true if the given key has been seen within the TTL window.
 * Otherwise, records the key and returns false.
 *
 * @example
 * if (seenRecently(key)) return TooMany/Conflict; // duplicate
 */
export function seenRecently(key: string, ttlMs: number = TTL_MS): boolean {
  const now = Date.now();
  cleanup(now);

  const exp = store.get(key);
  if (exp && exp > now) {
    // Duplicate within TTL
    return true;
  }

  // First time (or expired) → record fresh expiry
  store.set(key, now + ttlMs);
  return false;
}

/**
 * Optional helper to clear all entries (useful in tests).
 */
export function resetIdempotencyStore() {
  store.clear();
}
