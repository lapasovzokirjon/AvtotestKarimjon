'use client';

import { useState } from 'react';

export default function LeadForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    certificate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Iltimos, ism va familyangizni kiriting');
      return;
    }
    if (!form.phone.trim()) {
      setError('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    if (!form.location.trim()) {
      setError('Iltimos, yashash joyingizni kiriting');
      return;
    }
    if (!form.certificate) {
      setError('Iltimos, guvohnoma haqida belgilang');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Serverga yuborishda xatolik');
      }

      // Meta Pixel - Lead event (brauzer tomonida)
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: 'Prava tayyorlov ro_yxat',
        });
      }

      setSuccess(true);
    } catch (e) {
      setError('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\u2019ring.');
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
          <h3>Rahmat, qabul qilindi!</h3>
          <p>
            Siz bilan mutaxassislarimiz tez orada bog&apos;lanishadi.
            <br />
            Telefoningizni yoqiq tuting!
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </div>
        <div>
          <h2>Ro&apos;yxatdan o&apos;tish</h2>
          <p>
            Formani to&apos;ldiring — <b>mutaxassislarimiz</b> tez orada bog&apos;lanishadi!
          </p>
        </div>
      </div>

      <div className="notice">
        <span className="nd"></span>
        <p>Bugun ro&apos;yxatdan o&apos;ting va yangi guruh bilan boshlang</p>
      </div>

      <div className="input-field">
        <input
          type="text"
          placeholder="Ismingiz"
          value={form.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
        />
      </div>

      <div className="input-field">
        <input
          type="text"
          placeholder="Familyangiz"
          value={form.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
      </div>

      <div className="input-field">
        <input
          type="tel"
          placeholder="Telefon raqamingiz"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div className="input-field">
        <input
          type="text"
          placeholder="Yashash joyingiz"
          value={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div className="q-label">Avtomaktab guvohnomangiz bormi?</div>
      <div className="radio-row">
        <label className={`radio-box ${form.certificate === 'Ha' ? 'active' : ''}`}>
          <input
            type="radio"
            name="cert"
            style={{ display: 'none' }}
            checked={form.certificate === 'Ha'}
            onChange={() => handleChange('certificate', 'Ha')}
          />
          <span className="rc"></span>
          Ha
        </label>
        <label className={`radio-box ${form.certificate === 'Yoq' ? 'active' : ''}`}>
          <input
            type="radio"
            name="cert"
            style={{ display: 'none' }}
            checked={form.certificate === 'Yoq'}
            onChange={() => handleChange('certificate', 'Yoq')}
          />
          <span className="rc"></span>
          Yoq
        </label>
      </div>

      {error && <div className="err-text">{error}</div>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Yuborilmoqda...
          </>
        ) : (
          <>Bepul ro&apos;yxatdan o&apos;tish</>
        )}
      </button>

      <div className="secure">🔒 Ma&apos;lumotlaringiz xavfsiz va maxfiy</div>
    </div>
  );
}
