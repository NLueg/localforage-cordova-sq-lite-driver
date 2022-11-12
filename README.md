
# localforage-cordovaq-sq-lite-driver-ts

[![npm version](https://badge.fury.io/js/localforage-cordova-sq-lite-driver-ts.svg)](https://badge.fury.io/js/localforage-cordova-sq-lite-driver-ts)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/localforage-cordova-sq-lite-driver-ts)

SQLite driver for Cordova or Capacitor apps using [localForage](https://github.com/localForage/localForage).

It's heavily inspired by [localForage-cordovaSQLiteDriver
](https://github.com/thgreasi/localForage-cordovaSQLiteDriver) which isn't actively maintained.


## Setup with ionic

Install all required packages:

```sh
npm i @ionic/storage-angular localforage-cordova-sq-lite-driver-ts cordova-sqlite-storage
```

Next have to define the `driverOrder` for the `IonicStorageModule`:

```ts
import { IonicStorageModule } from '@ionic/storage-angular';
import { CordovaSQLiteDriver } from 'localforage-cordova-sq-lite-driver-ts';

@NgModule({
    ...
    imports: [
        ...
        IonicStorageModule.forRoot({
            driverOrder: [
                CordovaSQLiteDriver._driver,
                Drivers.IndexedDB,
                Drivers.LocalStorage,
            ],
        }),
        ...
    ]
})
```
## Authors

- [@NLueg](https://github.com/NLueg)
