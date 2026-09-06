// Vitest runs outside Next.js's webpack pipeline, which is what normally sets
// the resolve condition that makes the real `server-only` package a no-op on
// the server. This shim stands in for it in tests so importing a
// "server-only" module doesn't throw — see vitest.config.mts.
export {};
