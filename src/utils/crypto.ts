import { openDB } from 'idb';

const DB_NAME = 'wallet-store', STORE = 'keys';

export async function saveEncrypted(privHex: string, data: ArrayBuffer) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE); }
  });
  return db.put(STORE, data, privHex);
}

export async function loadEncrypted(privHex: string) {
  const db = await openDB(DB_NAME, 1);
  return db.get(STORE, privHex);
}

export async function deriveKey(pass: string) {
  const pw = new TextEncoder().encode(pass);
  const salt = new Uint8Array(16); // all zeros; you could randomize and store it too
  const keyMat = await crypto.subtle.importKey(
    'raw', pw, 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
}

export async function encryptWithKey(key: CryptoKey, data: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, data);
  const ctArray = new Uint8Array(ct);
  const result = new Uint8Array(iv.length + ctArray.length);
  result.set(iv);
  result.set(ctArray, iv.length);
  return result;
}

export async function decryptWithKey(key: CryptoKey, buf: Uint8Array) {
  const iv = buf.slice(0,12);
  const ct = buf.slice(12);
  const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ct);
  return new Uint8Array(pt);
}

