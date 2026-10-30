export function createCartId(randomUUID: (() => string) | null =
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID.bind(globalThis.crypto)
    : null,
) {
  if (randomUUID) return randomUUID();
  return `cart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
