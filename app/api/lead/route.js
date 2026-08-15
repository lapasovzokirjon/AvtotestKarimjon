import { NextResponse } from 'next/server';
import { sha256, normalizePhone, sendMetaEvent } from '../../../lib/meta';
import { encryptToken } from '../../../lib/crypto';
import { sendTelegramMessage } from '../../../lib/telegram';
import { getBaseUrl } from '../../../lib/url';

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
    } = data;

    // ----- validatsiya -----
    if (!firstName || !lastName || !phone || !location || !certificate) {
      return NextResponse.json(
        { ok: false, error: "Ma'lumotlar to'liq emas" },
        { status: 400 }
      );
    }

    // mijoz IP, user-agent va Meta pixel qo'ygan _fbp/_fbc cookie'lari
    // (moslik sifatini oshiradi, keyinroq Purchase eventda ham ishlatiladi)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const fbp = request.cookies.get('_fbp')?.value;
    const fbc = request.cookies.get('_fbc')?.value;

    // ============================================================
    //  0) XARID HAVOLASI — shu leadga tegishli barcha ma'lumotlar
    //     (hashlangan ism/familya/telefon + fbp/fbc) shifrlab tokenga
    //     joylanadi. Sotuvchi shu havolani ochib summani kiritsa,
    //     Purchase eventi aynan shu odam uchun Meta'ga yuboriladi.
    // ============================================================
    let purchaseLink = '';
    try {
      const token = encryptToken({
        fn: firstName,
        ln: lastName,
        phone,
        fnHash: sha256(firstName),
        lnHash: sha256(lastName),
        phHash: sha256(normalizePhone(phone)),
        fbp,
        fbc,
        ip: clientIp,
        ua: userAgent,
        url: page_url,
        ts: Date.now(),
      });
      purchaseLink = `${getBaseUrl(request)}/purchase/${token}`;
    } catch (tokenErr) {
      console.error("Xarid tokeni yaratishda xatolik:", tokenErr);
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
      : `\n\n📊 <b>Reklama manbasi:</b> to’g’ridan-to’g’ri (UTM yo’q)`;

    // ============================================================
    //  1) TELEGRAM BOTGA YUBORISH
    // ============================================================
    const message =
      `🆕 <b>Yangi ariza — Avtotest Karimjon</b>\n\n` +
      `👤 <b>Ism:</b> ${firstName}\n` +
      `👥 <b>Familya:</b> ${lastName}\n` +
      `📞 <b>Telefon:</b> ${phone}\n` +
      `📍 <b>Yashash joyi:</b> ${location}\n` +
      `🎓 <b>Guvohnoma:</b> ${certificate}` +
      utmText +
      `\n\n🕐 ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`;

    await sendTelegramMessage(
      message,
      purchaseLink ? [{ text: "💳 Sotuvni tasdiqlash", url: purchaseLink }] : undefined
    );

    // ============================================================
    //  2) META CONVERSIONS API (CAPI) — server tomonda Lead event
    // ============================================================
    await sendMetaEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      ...(page_url ? { event_source_url: page_url } : {}),
      user_data: {
        ph: [sha256(normalizePhone(phone))],
        fn: [sha256(firstName)],
        ln: [sha256(lastName)],
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
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
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead API xatolik:', err);
    return NextResponse.json(
      { ok: false, error: 'Server xatolik' },
      { status: 500 }
    );
  }
}
