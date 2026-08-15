'use client';

import { useState } from 'react';

export default function PurchaseForm({ token, firstName, lastName, phone }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Iltimos, to'g'ri summa kiriting");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, amount: value }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Xatolik');
      }

      setSuccess(true);
    } catch (e) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
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
          <h3>Xarid yuborildi!</h3>
          <p>
            Purchase event Meta&apos;ga yuborildi.
            <br />
            ROAS statistikasi yangilanadi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet">
      <div className="grip"></div>

      <div className="form-head">
        <div>
          <h2>Xaridni tasdiqlash</h2>
          <p>
            <b>
              {firstName} {lastName}
            </b>
            {phone ? ` — ${phone}` : ''}
          </p>
        </div>
      </div>

      <div className="input-field">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Summani kiriting (so'm)"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
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
          <>✅ Purchase yuborish</>
        )}
      </button>
    </div>
  );
}
