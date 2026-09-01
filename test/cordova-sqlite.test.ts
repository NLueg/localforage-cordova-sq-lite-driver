import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  return import('../src/cordova-sqlite');
}

describe('cordova-sqlite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('deviceReady', () => {
    it('resolves immediately when sqlitePlugin is already available', async () => {
      vi.stubGlobal('window', { sqlitePlugin: { openDatabase: vi.fn() } });
      vi.stubGlobal('document', { addEventListener: vi.fn() });

      const { deviceReady } = await loadModule();

      await expect(deviceReady).resolves.toBeUndefined();
    });

    it('rejects when neither sqlitePlugin nor cordova are available', async () => {
      vi.stubGlobal('window', {});
      vi.stubGlobal('document', { addEventListener: vi.fn() });

      const { deviceReady } = await loadModule();

      await expect(deviceReady).rejects.toThrow('cordova is not defined.');
    });

    it('waits for the deviceready event when cordova is still loading', async () => {
      let deviceReadyListener: (() => void) | undefined;
      vi.stubGlobal('window', { cordova: {} });
      vi.stubGlobal('document', {
        addEventListener: vi.fn((event: string, listener: () => void) => {
          if (event === 'deviceready') {
            deviceReadyListener = listener;
          }
        }),
      });

      const { deviceReady } = await loadModule();

      expect(deviceReadyListener).toBeDefined();
      deviceReadyListener?.();

      await expect(deviceReady).resolves.toBeUndefined();
    });
  });

  describe('getOpenDatabasePromise', () => {
    it('resolves with the openDatabase function once the plugin is present', async () => {
      const openDatabase = vi.fn();
      vi.stubGlobal('window', { sqlitePlugin: { openDatabase } });
      vi.stubGlobal('document', { addEventListener: vi.fn() });

      const { getOpenDatabasePromise } = await loadModule();

      await expect(getOpenDatabasePromise()).resolves.toBe(openDatabase);
    });

    it('throws when the sqlite plugin is not present', async () => {
      vi.stubGlobal('window', { sqlitePlugin: {} });
      vi.stubGlobal('document', { addEventListener: vi.fn() });

      const { getOpenDatabasePromise } = await loadModule();

      await expect(getOpenDatabasePromise()).rejects.toThrow(
        'SQLite plugin is not present.',
      );
    });
  });
});
