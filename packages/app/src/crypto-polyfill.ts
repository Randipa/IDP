(function applyCryptoRandomUuidPolyfill() {
  function randomUUID(): string {
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) {
        bytes[i] = (Math.random() * 256) | 0;
      }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return;
  }

  const base =
    globalThis.crypto ??
    ({
      getRandomValues(arr: Uint8Array) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = (Math.random() * 256) | 0;
        }
        return arr;
      },
    } as Crypto);

  try {
    Object.defineProperty(base, 'randomUUID', {
      value: randomUUID,
      configurable: true,
      writable: true,
    });
    globalThis.crypto = base;
  } catch {
    globalThis.crypto = new Proxy(base, {
      get(target, prop, receiver) {
        if (prop === 'randomUUID') {
          return randomUUID;
        }
        const value = Reflect.get(target, prop, receiver);
        return typeof value === 'function'
          ? (value as (...args: unknown[]) => unknown).bind(target)
          : value;
      },
    }) as Crypto;
  }
})();
