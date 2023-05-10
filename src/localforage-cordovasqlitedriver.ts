import { getOpenDatabasePromise } from './cordova-sqlite';
import { getSerializerPromise, getWebSqlDriverPromise } from './sqlite-utils';

// Open the cordova sqlite plugin database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options: LocalForageOptions): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self: any = this;
  const dbInfo: any = {
    db: null,
  } as any;

  if (options) {
    for (const i in options) {
      dbInfo[i] =
        typeof options[i] !== 'string' ? options[i].toString() : options[i];
    }
  }

  const dbInfoPromise = getOpenDatabasePromise().then(function (openDatabase) {
    return new Promise<void>(function (resolve, reject) {
      // Open the database; the openDatabase API will automatically
      // create it for us if it doesn't exist.
      try {
        dbInfo.location = dbInfo.location || 'default';
        dbInfo.db = openDatabase({
          name: dbInfo.name,
          version: String(dbInfo.version),
          description: dbInfo.description,
          size: dbInfo.size,
          key: dbInfo.dbKey,
          location: dbInfo.location,
          androidDatabaseProvider: 'system',
        });
      } catch (e) {
        reject(e);
      }

      // Create our key/value table if it doesn't exist.
      dbInfo.db.transaction(function (t) {
        t.executeSql(
          'CREATE TABLE IF NOT EXISTS ' +
            dbInfo.storeName +
            ' (id INTEGER PRIMARY KEY, key unique, value)',
          [],
          function () {
            self._dbInfo = dbInfo;
            resolve();
          },
          function (t, error) {
            reject(error);
          }
        );
      });
    });
  });

  const serializerPromise = getSerializerPromise(self);
  const webSqlDriverPromise = getWebSqlDriverPromise(self);

  return Promise.all([
    serializerPromise,
    webSqlDriverPromise,
    dbInfoPromise,
  ]).then(function (results) {
    dbInfo.serializer = results[0];
    return dbInfoPromise;
  });
}

const cordovaSQLiteDriver: {
  removeItem: () => any;
  dropInstance: () => any;
  _support: () => Promise<boolean>;
  keys: () => any;
  _initStorage: (options: LocalForageOptions) => Promise<void>;
  clear: () => any;
  length: () => any;
  getItem: () => any;
  _driver: string;
  key: () => any;
  setItem: () => any;
  iterate: () => any;
} = {
  _driver: 'cordovaSQLiteDriverX',
  _initStorage: _initStorage,
  _support: function (): Promise<boolean> {
    return getOpenDatabasePromise()
      .then(function (openDatabase) {
        return !!openDatabase;
      })
      .catch(function () {
        return false;
      });
  },
  clear: sqlLiteDriverMethod('clear'),
  getItem: sqlLiteDriverMethod('getItem'),
  iterate: sqlLiteDriverMethod('iterate'),
  key: sqlLiteDriverMethod('key'),
  keys: sqlLiteDriverMethod('keys'),
  length: sqlLiteDriverMethod('length'),
  removeItem: sqlLiteDriverMethod('removeItem'),
  setItem: sqlLiteDriverMethod('setItem'),
  dropInstance: sqlLiteDriverMethod('dropInstance'),
};

function sqlLiteDriverMethod(name: string): () => any {
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const localForageInstance = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    return getWebSqlDriverPromise(localForageInstance).then(function (
      webSqlDriver
    ) {
      return webSqlDriver[name].apply(localForageInstance, args);
    });
  };
}

export const CordovaSQLiteDriver = cordovaSQLiteDriver;
