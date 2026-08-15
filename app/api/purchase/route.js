import { NextResponse } from 'next/server';
import { decryptToken, hashToken } from '../../../lib/crypto';
import { sendMetaEvent } from '../../../lib/meta';
import { sendTelegramMessage } from '../../../lib/telegram';

export const runtime = 'nodejs';

const TTL_DAYS = Number(process.env.PURCHASE_LINK_TTL_DAYS || 30);
const CURRENCY = process.env.DEFAULT_CURRENCY || 'UZS';

export async function POST(request) {
  try {
    const { token, amount } = await request.json();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token yo'q" },
        { status: 400 }
      );
    }

    const value = Number(amount);
    if (!value || value <= 0) {
      return NextResponse.json(
        { ok: false, error: "Summani to'g'ri kiriting" },
        { status: 400 }
      );
    }

    const payload = decryptToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'Havola yaroqsiz' },
        { status: 400 }
      );
    }

    if (Date.now() - payload.ts > TTL_DAYS * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { ok: false, error: "Havola muddati o'tgan" },
        { status: 400 }
      );
    }

    // event_id token'dan hosil qilinadi — shu havola qayta ochib
    // yuborilsa ham, Meta bir xil eventni ikki marta hisoblamaydi
    const eventResult = await sendMetaEvent({
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: hashToken(token),
      action_source: 'website',
      ...(payload.url ? { event_source_url: payload.url } : {}),
      user_data: {
        ph: [payload.phHash],
        fn: [payload.fnHash],
        ln: [payload.lnHash],
        ...(payload.fbp ? { fbp: payload.fbp } : {}),
        ...(payload.fbc ? { fbc: payload.fbc } : {}),
        ...(payload.ip ? { client_ip_address: payload.ip } : {}),
        ...(payload.ua ? { client_user_agent: payload.ua } : {}),
      },
      custom_data: {
        content_name: 'Prava tayyorlov kursi',
        currency: CURRENCY,
        value,
      },
    });

    if (!eventResult.ok) {
      return NextResponse.json(
        { ok: false, error: 'Meta CAPI xatolik' },
        { status: 502 }
      );
    }

    await sendTelegramMessage(
      `✅ <b>To'lov tasdiqlandi</b>\n\n` +
        `👤 ${payload.fn} ${payload.ln}\n` +
        `📞 ${payload.phone || ''}\n` +
        `💰 ${value.toLocaleString('uz-UZ')} ${CURRENCY}\n\n` +
        `📈 Purchase event Meta'ga yuborildi.`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Purchase API xatolik:', err);
    return NextResponse.json(
      { ok: false, error: 'Server xatolik' },
      { status: 500 }
    );
  }
}
