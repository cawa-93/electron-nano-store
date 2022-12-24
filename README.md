[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

---

# Nano Electron store
<a href="https://www.buymeacoffee.com/kozack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" height="60" alt="Buy Me A Coffee"></a>

A minimalistic, secure, type-safe data store for Electron. This package is flat wrapper around [fs-nano-store](https://github.com/cawa-93/fs-nano-store) and automatically resolves the path to the user data directory.

## Usage

```ts
// In Electron Preload Script
import {defineStore} from "electron-nano-store";
import {contextBridge} from 'electron'

/**
 * Declare types for you storage
 */
interface UserStore {
    name: string,
    role: 'admin' | 'user'
}

contextBridge.exposeInMainWorld('userStorePromise', defineStore<UserStore>('user'))
```
```ts
// Somewhere in the renderer context of your application

// Tell typesctipt about store
declare global {
    interface Window {
        userStorePromise: Promise<TNanoStore<UserStore>>
    }
}

// Use it
const {get, set} = await window.userStorePromise
get('role') // 'admin' | 'user'
set('name', 123) // Type error: Argument of type number is not assignable to parameter of type string
```

### Auto-inferred types
You can use [unplugin-auto-expose](https://github.com/cawa-93/unplugin-auto-expose) to automatically pass information about types between the preload and the renderer:
```ts
// In Electron Preload Script
import {defineStore} from 'electron-nano-store';

type UserStore = {
  role: 'admin' | 'user'
}

export const storePromise = defineStore<UserStore>('userStore');
```
```ts
// Somewhere in the renderer context of your application
import { storePromise } from '#preload';

const {get, set} = await storePromise;
get('role') // 'admin' | 'user'
set('name', 123) // Type error: Argument of type number is not assignable to parameter of type string
```

### Listen store changes
fs-nano-store automatically tracks all changes to the store, and emit a `changed` event if the store has been changed out of context.

Since the electron does not allow you to expose `EventTarget` to the main world, you can proxy events to an existing target yourself
```ts
// in Preload Script
const storePromise = defineStore<Store>('user');
storePromise.then(({ changes }) => {
  changes.addListener(
    'changed',
    () => globalThis.dispatchEvent( new CustomEvent('user:changed') ),
  );
});
```
```ts
// in Renderer
globalThis.addEventListener(
  'user:changed',
  () => { /* ... */ }
)
```
## Data location
By default, all data saving in user data dir - This is usually the path returned by `electron.app.getPath('userData')`. You can change this by setting custom path:

```ts
defineStore('store-name', {
    userDataPath: '/path/to/custom/dir/'
})
```
