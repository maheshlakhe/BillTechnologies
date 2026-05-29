declare global {
  var localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    length: number;
    key(index: number): string | null;
  };
  var sessionStorage: typeof localStorage;
  var window: any;
  var Blob: any;
}

export {};
