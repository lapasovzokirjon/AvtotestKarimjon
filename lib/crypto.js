import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

// LINK_SECRET istalgan uzunlikdagi matn bo'lishi mumkin — undan 32-baytli kalit hosil qilinadi
function getKey() {
  const secret = process.env.LINK_SECRET;
  if (!secret) {
    throw new Error("LINK_SECRET sozlanmagan (.env.local ga qo'shing)");
  }
  return crypto.createHash('sha256').update(secret).digest();
}

// Lead ma'lumotlarini (hash + fbp/fbc) shifrlab, havolaga qo'yiladigan token yaratadi
export function encryptToken(payload) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

// Tokenni ochadi. Noto'g'ri/buzilgan token bo'lsa null qaytaradi
export function decryptToken(token) {
  try {
    const key = getKey();
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }
}

// Purchase event_id sifatida ishlatiladi — token o'zgarmasa hash ham o'zgarmaydi,
// shu orqali bir xil havola qayta yuborilsa Meta tomonida takroriy hisoblanishning oldi olinadi
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
