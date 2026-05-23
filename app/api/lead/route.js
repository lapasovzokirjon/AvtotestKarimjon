import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// SHA-256 hash (Meta CAPI uchun shaxsiy ma'lumotlar hash qilinadi)
function sha256(value) {
  if (!value) return undefined;
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

// telefonni faqat raqamlar shaklida normalizatsiya (CAPI uchun)
function normalizePhone(phone) {
  return String(phone).replace(/[^0-9]/g, '');
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      firstName,
      lastName,
      phone,
      location,
      certificate,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      page_url,
    } = data;

    // ----- validatsiya -----
    if (!firstName || !lastName || !phone || !location || !certificate) {
      return NextResponse.json(
        { ok: false, error: "Ma'lumotlar to'liq emas" },
        { status: 400 }
      );
    }

    // ----- UTM matni (Telegram xabari uchun) -----
    const hasUtm =
      utm_source || utm_medium || utm_campaign || utm_content || utm_term;
    const utmText = hasUtm
      ? `\n\n📊 <b>Reklama manbasi:</b>` +
        (utm_source ? `\n  • source: ${utm_source}` : '') +
        (utm_medium ? `\n  • medium: ${utm_medium}` : '') +
        (utm_campaign ? `\n  • campaign: ${utm_campaign}` : '') +
        (utm_content ? `\n  • content: ${utm_content}` : '') +
        (utm_term ? `\n  • term: ${utm_term}` : '')
      : `\n\n📊 <b>Reklama manbasi:</b> to\u2019g\u2019ridan-to\u2019g\u2019ri (UTM yo\u2019q)`;

    // ============================================================
    //  1) TELEGRAM BOTGA YUBORISH
    // ============================================================
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message =
        `🆕 <b>Yangi ariza — Avtotest Karimjon</b>\n\n` +
        `👤 <b>Ism:</b> ${firstName}\n` +
        `👥 <b>Familya:</b> ${lastName}\n` +
        `📞 <b>Telefon:</b> ${phone}\n` +
        `📍 <b>Yashash joyi:</b> ${location}\n` +
        `🎓 <b>Guvohnoma:</b> ${certificate}` +
        utmText +
        `\n\n🕐 ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`;

      try {
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: 'HTML',
            }),
          }
        );
      } catch (tgErr) {
        console.error('Telegram xatolik:', tgErr);
        // Telegram ishlamasa ham, foydalanuvchiga xatolik chiqarmaymiz
      }
    } else {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan');
    }

    // ============================================================
    //  2) META CONVERSIONS API (CAPI) — server tomonda Lead event
    // ============================================================
    const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const CAPI_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
    const TEST_CODE = process.env.META_TEST_EVENT_CODE;

    if (PIXEL_ID && CAPI_TOKEN) {
      // mijoz IP va user-agent (yaxshiroq moslik uchun)
      const clientIp =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        undefined;
      const userAgent = request.headers.get('user-agent') || undefined;

      const eventPayload = {
        data: [
          {
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            ...(page_url ? { event_source_url: page_url } : {}),
            user_data: {
              ph: [sha256(normalizePhone(phone))],
              fn: [sha256(firstName)],
              ln: [sha256(lastName)],
              ...(clientIp ? { client_ip_address: clientIp } : {}),
              ...(userAgent ? { client_user_agent: userAgent } : {}),
            },
            custom_data: {
              content_name: 'Prava tayyorlov royxat',
              certificate: certificate,
              ...(utm_source ? { utm_source } : {}),
              ...(utm_medium ? { utm_medium } : {}),
              ...(utm_campaign ? { utm_campaign } : {}),
              ...(utm_content ? { utm_content } : {}),
              ...(utm_term ? { utm_term } : {}),
            },
          },
        ],
        ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
      };

      try {
        await fetch(
          `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventPayload),
          }
        );
      } catch (capiErr) {
        console.error('Meta CAPI xatolik:', capiErr);
      }
    } else {
      console.warn('⚠️ Meta CAPI sozlanmagan (PIXEL_ID yoki CAPI_TOKEN yo\u2019q)');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead API xatolik:', err);
    return NextResponse.json(
      { ok: false, error: 'Server xatolik' },
      { status: 500 }
    );
  }
}