import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CordovaSQLiteDriver } from '../src/localforage-cordovasqlitedriver';

const { getOpenDatabasePromise } = vi.hoisted(() => ({
  getOpenDatabasePromise: vi.fn(),
}));
vi.mock('../src/cordova-sqlite', () => ({ getOpenDatabasePromise }));

const { getSerializerPromise, getWebSqlDriverPromise } = vi.hoisted(() => ({
  getSerializerPromise: vi.fn(),
  getWebSqlDriverPromise: vi.fn(),
}));
vi.mock('../src/sqlite-utils', () => ({
  getSerializerPromise,
  getWebSqlDriverPromise,
}));

describe('CordovaSQLiteDriver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('_support', () => {
    it('resolves true when openDatabase is available', async () => {
      getOpenDatabasePromise.mockResolvedValue(vi.fn());

      await expect(CordovaSQLiteDriver._support()).resolves.toBe(true);
    });

    it('resolves false when the plugin promise rejects', async () => {
      getOpenDatabasePromise.mockRejectedValue(new Error('nope'));

      await expect(CordovaSQLiteDriver._support()).resolves.toBe(false);
    });
  });

  describe('_initStorage', () => {
    it('opens the database, creates the table and stores dbInfo on the localForage instance', async () => {
      const executeSql = vi.fn(
        (_sql: string, _params: unknown[], success: () => void) => {
          success();
        },
      );
      const transaction = vi.fn(
        (callback: (t: { executeSql: typeof executeSql }) => void) => {
          callback({ executeSql });
        },
      );
      const db = { transaction };
      const openDatabase = vi.fn(() => db);

      getOpenDatabasePromise.mockResolvedValue(openDatabase);
      getSerializerPromise.mockResolvedValue({ serialized: true });
      getWebSqlDriverPromise.mockResolvedValue({});

      const localForageInstance: Record<string, unknown> = {};

      await CordovaSQLiteDriver._initStorage.call(localForageInstance, {
        name: 'testDb',
        storeName: 'testStore',
        version: 1,
        description: 'test',
      });

      expect(openDatabase).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'testDb',
          version: '1',
          description: 'test',
          location: 'default',
          androidDatabaseProvider: 'system',
        }),
      );
      expect(executeSql).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS testStore'),
        [],
        expect.any(Function),
        expect.any(Function),
      );
      expect(localForageInstance._dbInfo).toMatchObject({
        name: 'testDb',
        storeName: 'testStore',
        db,
        serializer: { serialized: true },
      });
    });

    it('rejects when creating the table fails', async () => {
      const failure = new Error('sql error');
      const executeSql = vi.fn(
        (
          _sql: string,
          _params: unknown[],
          _success: () => void,
          onError: (t: unknown, error: Error) => void,
        ) => {
          onError(undefined, failure);
        },
      );
      const transaction = vi.fn(
        (callback: (t: { executeSql: typeof executeSql }) => void) => {
          callback({ executeSql });
        },
      );
      const openDatabase = vi.fn(() => ({ transaction }));

      getOpenDatabasePromise.mockResolvedValue(openDatabase);
      getSerializerPromise.mockResolvedValue({});
      getWebSqlDriverPromise.mockResolvedValue({});

      await expect(
        CordovaSQLiteDriver._initStorage.call({}, { name: 'testDb' }),
      ).rejects.toBe(failure);
    });
  });

  describe('driver method delegation', () => {
    it('delegates clear() to the resolved webSql driver, preserving `this` and arguments', async () => {
      const clear = vi.fn(() => Promise.resolve('cleared'));
      getWebSqlDriverPromise.mockResolvedValue({ clear });

      const localForageInstance = {};
      const result = await CordovaSQLiteDriver.clear.call(
        localForageInstance,
        'arg1',
        'arg2',
      );

      expect(getWebSqlDriverPromise).toHaveBeenCalledWith(localForageInstance);
      expect(clear).toHaveBeenCalledWith('arg1', 'arg2');
      expect(clear.mock.contexts[0]).toBe(localForageInstance);
      expect(result).toBe('cleared');
    });
  });
});
