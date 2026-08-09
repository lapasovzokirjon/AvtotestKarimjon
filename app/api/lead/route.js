import { NextResponse } from 'next/server';
import { sha256, normalizePhone, signToken, sendMetaCapiEvent } from '../../lib/meta';

export const runtime = 'nodejs';

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
      fbp,
      fbc,
    } = data;

    // ----- validatsiya -----
    if (!firstName || !lastName || !phone || !location || !certificate) {
      return NextResponse.json(
        { ok: false, error: "Ma'lumotlar to'liq emas" },
        { status: 400 }
      );
    }

    // mijoz IP va user-agent (Meta CAPI moslik sifatini oshirish uchun)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

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
      : `\n\n📊 <b>Reklama manbasi:</b> to’g’ridan-to’g’ri (UTM yo’q)`;

    // ============================================================
    //  0) SOTUVNI BELGILASH HAVOLASI — Purchase eventi uchun
    //     bu lead haqidagi ma'lumotlar imzolangan tokenga qadovlanadi
    // ============================================================
    let purchaseUrl;
    try {
      const token = signToken({
        v: 1,
        ph: sha256(normalizePhone(phone)),
        fn: sha256(firstName),
        ln: sha256(lastName),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        ...(clientIp ? { ip: clientIp } : {}),
        ...(userAgent ? { ua: userAgent } : {}),
        ...(page_url ? { url: page_url } : {}),
        firstName,
        lastName,
        phone,
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;

      purchaseUrl = `${baseUrl}/purchase/${token}`;
    } catch (tokenErr) {
      console.error('Token yaratishda xatolik:', tokenErr);
    }

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
              ...(purchaseUrl
                ? {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: '💰 Sotuvni belgilash', url: purchaseUrl }],
                      ],
                    },
                  }
                : {}),
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
    try {
      const result = await sendMetaCapiEvent({
        eventName: 'Lead',
        eventSourceUrl: page_url,
        testEventCode: process.env.META_TEST_EVENT_CODE,
        userData: {
          ph: [sha256(normalizePhone(phone))],
          fn: [sha256(firstName)],
          ln: [sha256(lastName)],
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          ...(clientIp ? { client_ip_address: clientIp } : {}),
          ...(userAgent ? { client_user_agent: userAgent } : {}),
        },
        customData: {
          content_name: 'Prava tayyorlov royxat',
          certificate: certificate,
          ...(utm_source ? { utm_source } : {}),
          ...(utm_medium ? { utm_medium } : {}),
          ...(utm_campaign ? { utm_campaign } : {}),
          ...(utm_content ? { utm_content } : {}),
          ...(utm_term ? { utm_term } : {}),
        },
      });
      if (result.skipped) console.warn('⚠️', result.reason);
    } catch (capiErr) {
      console.error('Meta CAPI xatolik:', capiErr);
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
