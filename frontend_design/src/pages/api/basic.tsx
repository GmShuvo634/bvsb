import crypto from "crypto";

export const textEncrypt = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipherKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("base64")
    .substr(0, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc" as any, cipherKey as any, iv as any);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const textDecrypt = (encryptedText: string, key: string): string => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encrypted = textParts.join(":");
  const cipherKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("base64")
    .substr(0, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc" as any, cipherKey as any, iv as any);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
