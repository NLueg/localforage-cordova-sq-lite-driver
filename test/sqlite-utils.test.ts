import { describe, expect, it, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  return import('../src/sqlite-utils');
}

function createLocalForageInstance(): LocalForage {
  return {
    WEBSQL: 'webSQLStorage',
    getSerializer: vi.fn(() => Promise.resolve({} as LocalForageSerializer)),
    getDriver: vi.fn((name: string) =>
      Promise.resolve({ _driver: name } as unknown as LocalForageDriver),
    ),
  } as unknown as LocalForage;
}

describe('sqlite-utils', () => {
  describe('getSerializerPromise', () => {
    it('caches the serializer promise across calls', async () => {
      const { getSerializerPromise } = await loadModule();
      const instance = createLocalForageInstance();

      const first = getSerializerPromise(instance);
      const second = getSerializerPromise(instance);

      expect(second).toBe(first);
      expect(instance.getSerializer).toHaveBeenCalledTimes(1);
      await expect(first).resolves.toEqual({});
    });
  });

  describe('getDriverPromise', () => {
    it('caches a promise per driver name', async () => {
      const { getDriverPromise } = await loadModule();
      const instance = createLocalForageInstance();

      const webSql = getDriverPromise(instance, 'webSQLStorage');
      const webSqlAgain = getDriverPromise(instance, 'webSQLStorage');
      const otherDriver = getDriverPromise(instance, 'asyncStorage');

      expect(webSqlAgain).toBe(webSql);
      expect(otherDriver).not.toBe(webSql);
      expect(instance.getDriver).toHaveBeenCalledTimes(2);
    });
  });

  describe('getWebSqlDriverPromise', () => {
    it('resolves the driver registered under instance.WEBSQL', async () => {
      const { getWebSqlDriverPromise } = await loadModule();
      const instance = createLocalForageInstance();

      const driver = await getWebSqlDriverPromise(instance);

      expect(instance.getDriver).toHaveBeenCalledWith('webSQLStorage');
      expect(driver._driver).toBe('webSQLStorage');
    });
  });

  describe('executeCallback', () => {
    it('invokes the callback with the result on success', async () => {
      const { executeCallback } = await loadModule();
      const callback = vi.fn();

      executeCallback(Promise.resolve('value'), callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith(null, 'value');
      });
    });

    it('invokes the callback with the error on failure', async () => {
      const { executeCallback } = await loadModule();
      const callback = vi.fn();
      const error = new Error('boom');

      executeCallback(Promise.reject(error), callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith(error);
      });
    });

    it('does nothing when no callback is provided', async () => {
      const { executeCallback } = await loadModule();

      expect(() =>
        executeCallback(
          Promise.resolve('value'),
          undefined as unknown as (
            error: Error | null,
            result?: string,
          ) => unknown,
        ),
      ).not.toThrow();
    });
  });
});
