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

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function hmac(body) {
  const secret = process.env.LEAD_TOKEN_SECRET || '';
  return crypto.createHmac('sha256', secret).update(body).digest('base64url');
}

// Lead ma'lumotlarini imzolangan (o'zgartirib bo'lmaydigan) token qilib qadovlaydi
export function signToken(payload) {
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  return `${body}.${hmac(body)}`;
}

// Tokenni tekshiradi: imzo mos kelmasa yoki muddati o'tgan bo'lsa null qaytadi
export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  const [body, signature] = token.split('.');
  const expected = hmac(body);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
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
