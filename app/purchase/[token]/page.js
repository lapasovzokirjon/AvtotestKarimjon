import { decryptToken } from '../../../lib/crypto';
import PurchaseForm from './PurchaseForm';

export const metadata = {
  title: 'Xaridni tasdiqlash — Avtotest Karimjon',
  robots: 'noindex, nofollow',
};

const TTL_DAYS = Number(process.env.PURCHASE_LINK_TTL_DAYS || 30);

export default function PurchasePage({ params }) {
  const payload = decryptToken(params.token);
  const expired =
    !payload || Date.now() - payload.ts > TTL_DAYS * 24 * 60 * 60 * 1000;

  if (expired) {
    return (
      <main>
        <div className="sheet" style={{ marginTop: 40 }}>
          <div className="grip"></div>
          <div className="form-head">
            <div>
              <h2>Havola yaroqsiz</h2>
              <p>Bu havola noto&apos;g&apos;ri yoki muddati o&apos;tgan.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PurchaseForm
        token={params.token}
        firstName={payload.fn}
        lastName={payload.ln}
        phone={payload.phone}
      />
    </main>
  );
}
