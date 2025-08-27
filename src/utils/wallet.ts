// src/utils/wallet.ts
import { openDB } from "idb";
import { Wallet } from "ethers";

// IndexedDB configuration
const DB_NAME = "ephemeral-wallet-db";
const DB_VERSION = 1;
const STORE_NAME = "keys";

// Keys within the object store
const SALT_KEY = "encryptionSalt";
const DATA_KEY = "encryptedKey";

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// helper: convert ArrayBuffer ↔︎ base64
function buf2hex(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
}
function hex2buf(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

// derive a CryptoKey from passphrase + salt
async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Generate a new wallet, encrypt its privateKey, store ciphertext + salt in IndexedDB
export async function generateAndStoreWallet(
  passphrase: string
): Promise<Wallet> {
  const wallet = Wallet.createRandom();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);

  // AES‑GCM needs a nonce
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(wallet.privateKey)
  );

  // store: salt + iv + ciphertext
  const db = await getDb();
  await db.put(STORE_NAME, buf2hex(salt.buffer), SALT_KEY);
  await db.put(
    STORE_NAME,
    [buf2hex(iv.buffer), buf2hex(ciphertext)].join(":"),
    DATA_KEY
  );

  return wallet;
}

// Load & decrypt wallet given passphrase, or null if not present/invalid
export async function loadStoredWallet(
  passphrase: string
): Promise<Wallet | null> {
  const db = await getDb();
  const saltB64 = (await db.get(STORE_NAME, SALT_KEY)) as string;
  const stored = (await db.get(STORE_NAME, DATA_KEY)) as string;
  if (!saltB64 || !stored) return null;

  const [ivB64, cipherB64] = stored.split(":");
  const salt = new Uint8Array(hex2buf(saltB64));
  const iv = new Uint8Array(hex2buf(ivB64));
  const cipher = hex2buf(cipherB64);

  try {
    const key = await deriveKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher
    );
    const dec = new TextDecoder();
    const pk = dec.decode(decrypted);
    return new Wallet(pk);
  } catch {
    return null;
  }
}




