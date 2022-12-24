import * as path from "path";
import {defineStore as defineNanoStore, TNanoStoreData} from 'fs-nano-store'
export type {TNanoStoreData, TNanoStore} from 'fs-nano-store'
interface DefineStoreOptions {
    userDataPath?: string
}

function resolveUserAppDataPath() {
    const arg = process.argv.find(arg => arg.startsWith('--user-data-dir='))
    if (!arg) {
        throw new Error('Unable to find --user-data-dir with valid path in process.argv')
    }
    const dir = arg.split('=')[1]?.trim()

    if (!dir) {
        throw new Error('Unable to find --user-data-dir with valid path in process.argv')
    }

    return path.resolve(dir)
}


export function defineStore<TStore extends TNanoStoreData>(storeName: string, options: DefineStoreOptions = {}) {
    const storeFile = path.resolve(options.userDataPath || resolveUserAppDataPath(), `${storeName}.json`)
    return defineNanoStore<TStore>(storeFile)
}
