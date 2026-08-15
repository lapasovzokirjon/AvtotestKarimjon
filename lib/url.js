// So'rov headerlaridan sayt manzilini aniqlaydi (Telegram xabaridagi
// xarid havolasini to'liq URL qilib qurish uchun kerak)
export function getBaseUrl(request) {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, '');
  }
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}
