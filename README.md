> [!WARNING]
> **This project is archived and no longer maintained.** It will not receive fixes, dependency updates or new releases. Please do not use it in new projects.
>
> **Why:** the driver builds on [cordova-sqlite-storage](https://github.com/storesafe/cordova-sqlite-storage), which runs every transaction of a database one after another and sends each batch to the native side without an error callback or a time limit. In Capacitor apps on iOS a reply from the native side is sometimes lost. The plugin then keeps its transaction lock, and every later read and write waits until the app is restarted. Saves silently do nothing in the meantime. [Ionic Storage](https://github.com/ionic-team/ionic-storage), the usual way to use this driver, has not been updated in a long time either.
>
> **Alternatives:** use a Capacitor-native SQLite plugin such as [@capacitor-community/sqlite](https://github.com/capacitor-community/sqlite), or a small key-value plugin of your own on top of the system SQLite. In the browser, IndexedDB can be used directly.
>
> **Migrating existing data:** the database this driver created is `_ionicstorage` (table `_ionickv`, one row per key) in `Library/LocalDatabase` on iOS and in the app's `databases` folder on Android. Values are serialised by localforage (`JSON.stringify` for everything but binary data). Read the old file with SQLite itself, for example by attaching it (`ATTACH DATABASE`) to the new database and copying the rows in one transaction. Do not copy the database file on its own: on Android it is usually in WAL mode, and the most recent writes may still be in `_ionicstorage-wal`, which a plain file copy leaves behind.

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
