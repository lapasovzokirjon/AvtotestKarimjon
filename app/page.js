import LeadForm from './components/LeadForm';

export default function Home() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="topbar">
          <div className="logo">
            <div className="logo-box">K</div>
            <div className="logo-text">
              <strong>AVTOTEST</strong>
              <span>KARIMJON</span>
            </div>
          </div>
          <a href="tel:+998870027111" className="call-btn">
            <span className="call-dot"></span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5a2 2 0 0 1 2-2h3.3a1 1 0 0 1 .95.68l1.5 4.5a1 1 0 0 1-.5 1.2L8.5 10.7a12 12 0 0 0 4.8 4.8l1.3-2.2a1 1 0 0 1 1.2-.5l4.5 1.5a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5Z" />
            </svg>
            Bog&apos;lanish
          </a>
        </div>

        <div className="hero-content">
          <div className="trust-pill">🛡️ 2000+ O&apos;QUVCHI · JIZZAX</div>
          <h1>
            Prava nazariy <em>imtihoniga</em> tayyorlov
          </h1>
          <p className="hero-desc">
            Bir urinishda imtihondan o&apos;ting.{' '}
            <b>Darslarga vaqtida kelib, vazifalarni bajaring — kafolat beramiz!</b>
          </p>
          <div className="stats">
            <div className="stat">
              <strong>
                91<em>%</em>
              </strong>
              <span>NATIJA</span>
            </div>
            <div className="stat">
              <strong>
                2000<em>+</em>
              </strong>
              <span>O&apos;QUVCHI</span>
            </div>
            <div className="stat">
              <strong>
                5<em>+</em>
              </strong>
              <span>YIL TAJRIBA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <LeadForm />

      {/* ===== FOOTER ===== */}
      <footer>
        <strong>AVTOTEST KARIMJON</strong>
        <p>
          Jizzax viloyati · <a href="tel:+998870027111">+998 87 002 71 11</a>
        </p>
      </footer>
    </main>
  );
}
