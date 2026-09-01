export interface CordovaSQLiteTransaction {
  executeSql(
    sql: string,
    params: unknown[],
    successCallback?: () => void,
    errorCallback?: (
      transaction: CordovaSQLiteTransaction,
      error: unknown,
    ) => void,
  ): void;
}

export interface CordovaSQLiteDatabase {
  transaction(callback: (transaction: CordovaSQLiteTransaction) => void): void;
}

export interface CordovaSQLiteOpenDatabaseOptions {
  name: string;
  version: string;
  description?: string;
  size?: number;
  key?: string;
  location: string;
  androidDatabaseProvider?: string;
}

export type CordovaOpenDatabaseFn = (
  options: CordovaSQLiteOpenDatabaseOptions,
) => CordovaSQLiteDatabase;

declare global {
  interface Window {
    sqlitePlugin: {
      openDatabase: CordovaOpenDatabaseFn;
    };
    cordova: unknown;
  }
}

export const deviceReady = new Promise<void>(function (resolve, reject) {
  if (typeof window.sqlitePlugin !== 'undefined') {
    resolve();
  } else if (typeof window.cordova === 'undefined') {
    reject(new Error('cordova is not defined.'));
  } else {
    // Wait for Cordova to load
    document.addEventListener('deviceready', () => resolve(), false);
  }
});

const deviceReadyDone = deviceReady.catch(() => Promise.resolve());

export function getOpenDatabasePromise(): Promise<CordovaOpenDatabaseFn> {
  return deviceReadyDone.then(function () {
    if (
      typeof window.sqlitePlugin !== 'undefined' &&
      typeof window.sqlitePlugin.openDatabase === 'function'
    ) {
      return window.sqlitePlugin.openDatabase;
    } else {
      throw new Error('SQLite plugin is not present.');
    }
  });
}
