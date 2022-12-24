import {normalize, resolve} from "node:path";
import {defineStore as defineNanoStore, type TNanoStore, type TNanoStoreData} from 'fs-nano-store'

export type {TNanoStoreData, TNanoStore}

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

    return normalize(dir)
}


export function defineStore<TStore extends TNanoStoreData>(storeName: string, options: DefineStoreOptions = {}) {
    const storeFile = resolve(options.userDataPath || resolveUserAppDataPath(), `${storeName}.json`)
    return defineNanoStore<TStore>(storeFile)
}
