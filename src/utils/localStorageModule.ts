/**
 * Module to polymorphically polyfill localStorage on node (or ts-node) environments
 */
import { LocalStorage } from 'ts-localstorage';

let storage;
if (process.release.name == 'node') {
    storage = LocalStorage;
} else {
    storage = localStorage;
}

export { storage };

