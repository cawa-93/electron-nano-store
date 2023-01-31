import { basename, normalize, resolve } from 'node:path';
import { defineStore as defineNanoStore, type NanoStore, type NanoStoreData } from 'fs-nano-store';

export type { NanoStoreData, NanoStore };

/**
 * @private
 * @return value of `--user-data-dir` command line argument
 */
function resolveUserAppDataPath() {
	const arg = process.argv.find((arg) => arg.startsWith('--user-data-dir='));
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
 * Resolve full path to store file by store name
 * @param storeName
 * @param dir custom store dir. By default in `electron.app.getPath('userData')`
 * @return Absolute path to file
 */
export function resolveStoreFilepath(storeName: string, dir: string = resolveUserAppDataPath()) {
	if (basename(storeName) !== storeName) {
		throw new Error(
			`${JSON.stringify(
				storeName
			)} in invalid store name. Store name should not contain any path fragments. Did you mean ${JSON.stringify(
				basename(storeName)
			)}`
		);
	}

	return resolve(dir, `${storeName}.nano-store.json`);
}

/**
 * Create persistent storage. All data saved in filesystem in `electron.app.getPath('userData')` location.
 * For security reasons you can't change location in fs. Use directly `fs-nano-storage` for that.
 *
 * @param storeName It is used to define the file in which the data will be stored.
 * For security reasons, it is forbidden to use any path fragments
 */
export function defineStore<TStore extends NanoStoreData>(storeName: string) {
	return defineNanoStore<TStore>(resolveStoreFilepath(storeName, resolveUserAppDataPath()));
}
