import crypto from 'crypto';

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 kun

// SHA-256 hash (Meta CAPI uchun shaxsiy ma'lumotlar hash qilinadi)
export function sha256(value) {
  if (!value) return undefined;
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

// telefonni faqat raqamlar shaklida normalizatsiya (CAPI uchun)
export function normalizePhone(phone) {
  return String(phone).replace(/[^0-9]/g, '');
}

// LEAD_TOKEN_SECRET dan aynan 32 baytli AES-256 kalit hosil qilamiz
function encryptionKey() {
  const secret = process.env.LEAD_TOKEN_SECRET || '';
  return crypto.createHash('sha256').update(secret).digest();
}

// Lead ma'lumotlarini (ism, telefon, fbp/fbc, ip/ua) shifrlangan token qilib
// qadovlaydi — AES-256-GCM: maxfiy kalitsiz hech kim tokenni o'qiy olmaydi,
// o'zgartirib bo'lmaydi (GCM avtomatik yaxlitlikni tekshiradi)
export function signToken(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);

  const plaintext = JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64url'),
    encrypted.toString('base64url'),
    authTag.toString('base64url'),
  ].join('.');
}

// Tokenni deshifrlaydi: kalit mos kelmasa, o'zgartirilgan bo'lsa yoki muddati
// o'tgan bo'lsa null qaytadi
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [ivB64, encryptedB64, authTagB64] = parts;

  let payload;
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      encryptionKey(),
      Buffer.from(ivB64, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedB64, 'base64url')),
      decipher.final(),
    ]);
    payload = JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.iat || Date.now() / 1000 - payload.iat > TOKEN_TTL_SECONDS) return null;

  return payload;
}

// Meta Conversions API (CAPI) ga hodisa yuborish
export async function sendMetaCapiEvent({
  eventName,
  userData,
  customData,
  eventSourceUrl,
  testEventCode,
}) {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const CAPI_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

  if (!PIXEL_ID || !CAPI_TOKEN) {
    return { skipped: true, reason: 'Meta CAPI sozlanmagan (PIXEL_ID yoki CAPI_TOKEN yo’q)' };
  }

  const eventPayload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
        user_data: userData,
        custom_data: customData,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    }
  );

  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body: json };
}
