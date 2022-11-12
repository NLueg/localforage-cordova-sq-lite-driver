declare global {
  interface Window {
    sqlitePlugin: {
      openDatabase: (options: any) => any;
    };
    cordova: any;
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

export function getOpenDatabasePromise(): Promise<(options: any) => any> {
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
