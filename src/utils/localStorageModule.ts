/**
 * Module to polymorphically polyfill localStorage on node (or ts-node) environments
 */
import { LocalStorage } from 'ts-localstorage';

//@ts-ignore
const storage = process.release.name === 'node' ? LocalStorage : localStorage;
export { storage };

