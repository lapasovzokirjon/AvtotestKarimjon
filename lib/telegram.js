// buttons: [{ text: 'Tugma nomi', url: 'https://...' }] — xabar ostiga bosiladigan tugma qo'shadi
export async function sendTelegramMessage(text, buttons) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...(buttons
          ? { reply_markup: { inline_keyboard: [buttons.map((b) => ({ text: b.text, url: b.url }))] } }
          : {}),
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      // masalan: tugma URL manzili https bo'lmasa Telegram xabarni rad etadi
      console.error('Telegram xatolik:', json);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram xatolik:', err);
    return false;
  }
}
