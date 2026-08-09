import { NextResponse } from 'next/server';
import { verifyToken, sendMetaCapiEvent } from '../../lib/meta';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { token, summa } = await request.json();

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'Havola yaroqsiz yoki muddati tugagan' },
        { status: 400 }
      );
    }

    const value = Number(summa);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { ok: false, error: "Summani to'g'ri kiriting" },
        { status: 400 }
      );
    }

    const result = await sendMetaCapiEvent({
      eventName: 'Purchase',
      eventSourceUrl: payload.url,
      testEventCode: process.env.META_TEST_EVENT_CODE,
      userData: {
        ph: [payload.ph],
        fn: [payload.fn],
        ln: [payload.ln],
        ...(payload.fbp ? { fbp: payload.fbp } : {}),
        ...(payload.fbc ? { fbc: payload.fbc } : {}),
        ...(payload.ip ? { client_ip_address: payload.ip } : {}),
        ...(payload.ua ? { client_user_agent: payload.ua } : {}),
      },
      customData: {
        value,
        currency: 'UZS',
        content_name: 'Prava tayyorlov kursi',
      },
    });

    if (result.skipped || !result.ok) {
      console.error('Meta CAPI Purchase xatolik:', result);
      return NextResponse.json(
        { ok: false, error: 'Metaga yuborishda xatolik yuz berdi' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Purchase API xatolik:', err);
    return NextResponse.json(
      { ok: false, error: 'Server xatolik' },
      { status: 500 }
    );
  }
}
