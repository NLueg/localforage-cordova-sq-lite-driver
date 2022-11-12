let serializerPromise: Promise<LocalForageSerializer> | undefined;
const driverPromises: {
  [driverName: string]: Promise<LocalForageDriver> | undefined;
} = {};

export function getSerializerPromise(
  localForageInstance: LocalForage
): Promise<LocalForageSerializer> {
  if (serializerPromise) {
    return serializerPromise;
  }
  serializerPromise = localForageInstance.getSerializer();
  return serializerPromise;
}

export function getDriverPromise(
  localForageInstance: LocalForage,
  driverName: string
): Promise<LocalForageDriver> {
  let relevantDriverPromise = driverPromises[driverName];
  if (relevantDriverPromise) {
    return relevantDriverPromise;
  }

  relevantDriverPromise = localForageInstance.getDriver(driverName);
  driverPromises[driverName] = relevantDriverPromise;

  return relevantDriverPromise;
}

export function getWebSqlDriverPromise(
  localForageInstance: LocalForage
): Promise<LocalForageDriver> {
  return getDriverPromise(localForageInstance, localForageInstance.WEBSQL);
}

export function executeCallback<T>(
  promise: Promise<T>,
  callback: (error: Error | null, result?: T) => unknown
): any {
  if (callback) {
    promise.then(
      function (result) {
        callback(null, result);
      },
      function (error) {
        callback(error);
      }
    );
  }
}
