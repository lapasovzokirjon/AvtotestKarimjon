'use client';

import { useState } from 'react';

export default function PurchaseForm({ token, firstName, lastName, phone }) {
  const [summa, setSumma] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const value = Number(summa);
    if (!summa || !Number.isFinite(value) || value <= 0) {
      setError("Iltimos, summani to'g'ri kiriting");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, summa: value }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Yuborishda xatolik yuz berdi');
      }

      setSuccess(true);
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="sheet">
        <div className="grip"></div>
        <div className="success-box">
          <div className="success-check">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3>Sotuv qayd etildi!</h3>
          <p>
            Purchase eventi Metaga muvaffaqiyatli yuborildi.
            <br />
            {firstName} {lastName} — {Number(summa).toLocaleString('uz-UZ')} so&apos;m
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet">
      <div className="grip"></div>

      <div className="form-head">
        <div className="form-head-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h2>Sotuvni belgilash</h2>
          <p>
            <b>
              {firstName} {lastName}
            </b>{' '}
            — {phone}
          </p>
        </div>
      </div>

      <div className="notice">
        <span className="nd"></span>
        <p>Summani kiritib yuborsangiz, Purchase eventi Metaga avtomatik yuboriladi</p>
      </div>

      <div className="input-field">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Summa (so'm)"
          value={summa}
          onChange={(e) => {
            setSumma(e.target.value);
            if (error) setError('');
          }}
        />
      </div>

      {error && <div className="err-text">{error}</div>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Yuborilmoqda...
          </>
        ) : (
          <>Purchase yuborish</>
        )}
      </button>
    </div>
  );
}
