import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: () => {},
});

const storage = new Map<string, string>();
const localStorageStub = {
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  removeItem: (key: string) => storage.delete(key),
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  get length() {
    return storage.size;
  },
};

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: localStorageStub,
});

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: localStorageStub,
});
