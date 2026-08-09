import { verifyToken } from '../../lib/meta';
import PurchaseForm from './PurchaseForm';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default function PurchasePage({ params }) {
  const payload = verifyToken(params.token);

  if (!payload) {
    return (
      <main className="standalone-page">
        <div className="sheet">
          <div className="grip"></div>
          <div className="success-box">
            <h3>Havola yaroqsiz</h3>
            <p>
              Bu havola yaroqsiz yoki muddati tugagan. Iltimos, Telegramdagi
              eng so&apos;nggi ariza xabaridan foydalaning.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="standalone-page">
      <PurchaseForm
        token={params.token}
        firstName={payload.firstName}
        lastName={payload.lastName}
        phone={payload.phone}
      />
    </main>
  );
}
