import {basename, normalize, resolve} from 'node:path';
import {defineStore as defineNanoStore, type TNanoStore, type TNanoStoreData} from 'fs-nano-store';

export type {TNanoStoreData, TNanoStore};

function resolveUserAppDataPath() {
  const arg = process.argv.find(arg => arg.startsWith('--user-data-dir='));
  if (!arg) {
    throw new Error('Unable to find --user-data-dir with valid path in process.argv');
  }
  const dir = arg.split('=')[1]?.trim();

  if (!dir) {
    throw new Error('Unable to find --user-data-dir with valid path in process.argv');
  }

  return normalize(dir);
}

/**
 * Create persistent storage. All data saved in filesystem in `electron.app.getPath('userData')` location.
 * For security reasons you can't change location in fs. Use directly `fs-nano-storage` for that.
 *
 * @param storeName It is used to define the file in which the data will be stored.
 * For security reasons, it is forbidden to use any path fragments
 */
export function defineStore<TStore extends TNanoStoreData>(storeName: string) {
  if (basename(storeName) !== storeName) {
    throw new Error(`${JSON.stringify(storeName)} in invalid store name. Store name should not containe any path fragments`);
  }

  const storeFile = resolve(resolveUserAppDataPath(), `${storeName}.json`);

  return defineNanoStore<TStore>(storeFile);
}
