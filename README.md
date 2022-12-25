[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

---

# Nano Electron store

<a href="https://www.buymeacoffee.com/kozack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" height="60" alt="Buy Me A Coffee"></a>

A minimalistic, secure, type-safe data store for Electron. This package is flat wrapper around [fs-nano-store] and
automatically resolves the path to the user data directory.

## Usage

### Simple

Just expose `defineStore` function and use it directly in your renderer anywhere.

```ts
// In Electron Preload Script
import {defineStore} from "electron-nano-store"
import {contextBridge} from 'electron'

contextBridge.exposeInMainWorld('defineStore', defineStore)
```

```ts
// In Renderer
const store = await defineStore('user')

store.set('role', 'admin')
console.log(store.get('role')) // -> 'admin'
```

### Recommended

As an additional safety precaution, you can choose not to expose a `defineStore` function, but instead expose an already
defined store.
The examples below also show an example of use with TypeScript.

```ts
// contracts.ts
export type UserStore = {
  role: 'admin' | 'user'
}
```

```ts
// in Preload Script
import {defineStore} from "electron-nano-store"
import {contextBridge} from 'electron'
import type {UserStore} from 'contracts.ts'

const userStorePromise = defineStore<UserStore>('user')
contextBridge.exposeInMainWorld('userStorePromise', userStorePromise)
```

```ts
// In Renderer
import type {UserStore} from 'contracts.ts'
import type {defineStore} from 'electron-nano-store'

declare global {
  interface Window {
    userStorePromise: ReturnType<typeof defineStore<UserStore>>
  }
}
const store = await window.userStorePromise
store.set('role', 'admin')
console.log(store.get('role')) // -> 'admin'

store.set('role', 'wrong-role') // TS Error: Argument of type '"wrong-role"' is not assignable to parameter of type '"admin" | "user"'
```

### Recommended with automatic type inference

The exchange of types between the preload and the renderer can be a little annoying and complicated. So you can
use [unplugin-auto-expose](https://github.com/cawa-93/unplugin-auto-expose) for automatic type inference

```ts
// in Preload Script
import {defineStore} from "electron-nano-store"

type UserStore = {
  role: 'admin' | 'user'
}
export const userStorePromise = defineStore<UserStore>('user')
```

```ts
// In Renderer
import {userStorePromise} from '#preload'

const store = await userStorePromise
```

### In Main

This package was intentionally designed with many restrictions for use in preload. If you want to use it in main, or you
need more control you should use [fs-nano-store] directly

```ts
// In Main
import { defineStore } from 'fs-nano-store'
import { resolveStoreFilepath } from 'electron-nano-store'
import { app } from 'electron'

const store = await defineStore( 
  resolveStoreFilepath(
    'store-name',
    app.getPath('userData')
  )
)
```

### Listen store changes in Renderer

[fs-nano-store] automatically tracks all changes to the store, and emit a `changed` event if the store has been changed
out of context.

However, electron does not allow you to expose `EventEmitter` to the main world. This means that even though it defines
and returns `change` property, you can't add listeners directly.

```ts
const {changes} = defineStore('store-name')
changes.addListener // undefined
```

To do this, you **must** define store in the preload context, add listeners there, and proxy all events to an
existing `EventTarget`, such as a `window`

```ts
// in Preload Script
const storePromise = defineStore<Store>('user')
storePromise.then(({changes}) => {
  changes.addListener(
    'changed',
    () => globalThis.dispatchEvent(new CustomEvent('user:changed')),
  )
})
```

```ts
// in Renderer
globalThis.addEventListener(
  'user:changed',
  () => { /* ... */
  }
)
```

## Security limitation

1. You can't somehow change where are storage files placed in filesystems.
   It always in `electron.app.getPath('userData')` directory defined by electron.
   Since the `defineStore` function may be exposed to a non-secure context, this is done to prevent malicious code from
   making
   uncontrolled writes anywhere on the file system.
    ```ts
    // 🚫 Harmful use
    defineStore('.privat-config', { customPath: '/somewhere/in/user/filesystem/' })
    ```
   > **Note**
   > If you need create store in some different location, you should make your own wrapper around [fs-nano-store]. Look
   how use [In Main](#in-main).
2. For the same reasons, you cannot use any path fragments in the repository name
    ```ts
    // 🚫 Harmful use
    defineStore('../../somewhere/in/user/filesystem/privat-config')
    ```

[fs-nano-store]: https://github.com/cawa-93/fs-nano-store
