import crypto from 'crypto';

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

// Meta Conversions API'ga bitta event yuboradi
export async function sendMetaEvent(eventData) {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const CAPI_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE;

  if (!PIXEL_ID || !CAPI_TOKEN) {
    console.warn("⚠️ Meta CAPI sozlanmagan (PIXEL_ID yoki CAPI_TOKEN yo'q)");
    return { ok: false, error: 'CAPI sozlanmagan' };
  }

  const body = {
    data: [eventData],
    ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    if (!res.ok) {
      console.error('Meta CAPI xatolik:', json);
      return { ok: false, error: json };
    }
    return { ok: true, result: json };
  } catch (err) {
    console.error('Meta CAPI xatolik:', err);
    return { ok: false, error: String(err) };
  }
}
