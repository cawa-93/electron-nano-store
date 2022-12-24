[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

---

# Nano Electron store
<a href="https://www.buymeacoffee.com/kozack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 60px !important;" ></a>

A simple, super minimalistic data store on a file system with TypeScript support. This package is flat wrapper around [fs-nano-store](https://github.com/cawa-93/fs-nano-store) and automatically resolves the path to the user data directory.

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

## Data location
By default all data saving in user data dir - This is usually the path returned by `electron.app.getPath('userData')`. You can change this by setting custom path:

```ts
import {defineStore} from "./index";

defineStore('store-name', {
    userDataPath: '/path/to/custom/dir/'
})
```
