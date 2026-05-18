import { useEffect, type ReactNode } from "react";
import { Link, Route, Routes } from "react-router-dom";

const IMG_BASE = "./images/";
const HERO_IMAGE = `${IMG_BASE}zigarrenkombinat_zigarren_sortiert.png`;
const HOST_IMAGE = `${IMG_BASE}zigarrenkombinat_store_panorama_treppe.jpeg`;
const ABOUT_IMAGE = `${IMG_BASE}rike.jpeg`;
const VIDEO_IMAGE = `${IMG_BASE}zigarrenkombinat_spirituosen_tasting_tisch.jpeg`;
const NEWS_IMAGE = `${IMG_BASE}zigarrenkombinat_store_tresen_halbtotal.jpeg`;

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function HomePage() {
  usePageTitle("ZIGARRENKOMBINAT | Eisenach");

  useEffect(() => {
    const STORAGE_KEY = "thomas_geissler_age_verified_until";
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const gate = document.querySelector<HTMLElement>(".js-age-gate");
    const yesButton = gate?.querySelector<HTMLButtonElement>("[data-age='yes']");
    const noButton = gate?.querySelector<HTMLButtonElement>("[data-age='no']");
    const errorNode = gate?.querySelector<HTMLElement>("[data-age='error']");

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get("preview") === "1";

    const lockPage = (lock: boolean) => {
      document.documentElement.style.overflow = lock ? "hidden" : "";
      document.body.style.overflow = lock ? "hidden" : "";
    };

    const getExpiry = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number(raw) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const isVerified = () => getExpiry() > Date.now();

    const storeVerification = () => {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + THIRTY_DAYS_MS));
    };

    const hideGate = () => {
      if (gate) {
        gate.dataset.state = "hidden";
      }
      lockPage(false);
    };

    document.documentElement.classList.toggle("preview-mode", previewMode);

    if (gate) {
      if (previewMode || isVerified()) {
        hideGate();
      } else {
        gate.dataset.state = "visible";
        lockPage(true);
      }
    }

    const onYes = () => {
      storeVerification();
      hideGate();
      if (errorNode) {
        errorNode.textContent = "";
      }
    };

    const onNo = () => {
      if (errorNode) {
        errorNode.textContent = "Zugriff nicht erlaubt. Diese Seite ist nur für volljährige Besucher.";
      }
    };

    yesButton?.addEventListener("click", onYes);
    noButton?.addEventListener("click", onNo);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    document.querySelectorAll<HTMLElement>(".reveal").forEach((item) => observer.observe(item));

    return () => {
      yesButton?.removeEventListener("click", onYes);
      noButton?.removeEventListener("click", onNo);
      observer.disconnect();
      lockPage(false);
    };
  }, []);

  return (
    <>
      <div className="gate js-age-gate" data-state="visible" aria-modal="true" role="dialog">
        <div className="gate__card">
          <p className="gate__eyebrow">Zigarrenkombinat Eisenach</p>
          <h2 className="gate__title">Eintritt ab 18 Jahren</h2>
          <p className="gate__copy">
            Diese Website enthält Inhalte zu Zigarren, Wein und Spirituosen. Bitte bestätige, dass du volljährig bist.
          </p>
          <div className="gate__actions">
            <button className="gate__btn gate__btn--yes" data-age="yes" type="button">
              Ja, ich bin 18+
            </button>
            <button className="gate__btn gate__btn--no" data-age="no" type="button">
              Nein
            </button>
          </div>
          <p className="gate__note">Deine Auswahl wird für 30 Tage gespeichert.</p>
          <p className="gate__error" data-age="error" aria-live="polite"></p>
        </div>
      </div>

      <div className="page-shell" id="top">
        <header className="topbar" aria-label="Seitennavigation">
          <nav className="topbar__nav">
            <a className="topbar__nav-link" href="#top">
              Start
            </a>
            <a className="topbar__nav-link" href="#host">
              Beratung
            </a>
            <a className="topbar__nav-link" href="#shop">
              Angebot
            </a>
            <a className="topbar__nav-link" href="#events">
              Abende
            </a>
            <a className="topbar__nav-link" href="#visit">
              Kontakt
            </a>
          </nav>
        </header>

        <main>
          <section className="hero reveal" aria-labelledby="hero-title">
            <figure className="hero__media">
              <img src={HERO_IMAGE} alt="Rike und Thomas im Zigarrenkombinat Eisenach" />
            </figure>
            <div className="hero__shade"></div>
            <div className="hero__content">
              <p className="eyebrow">ZIGARRENKOMBINAT · RIKE UND THOMAS</p>
              <h1 id="hero-title">Ein guter Einkauf beginnt nicht im Warenkorb.</h1>
              <p className="hero__lead">
                Zigarren, Spirituosen, Wein und Zubehör. Fachlich beraten. Präzise empfohlen.
              </p>
              <div className="hero__actions" aria-label="Hauptaktionen">
                <a className="button button--primary" href="#visit">
                  Besuch im Fachgeschäft planen
                </a>
                <a className="button button--secondary" href="#shop">
                  Fachgeschäft entdecken
                </a>
              </div>
            </div>
            <aside className="hero__note" aria-label="Kurzprofil">
              <span>Fachgeschäft</span>
              <p>Zigarren, Spirituosen und Accessories direkt vor Ort. Beratung ohne Verkaufsdruck.</p>
            </aside>
          </section>

          <section className="host wrapper section reveal" id="host" aria-labelledby="host-title">
            <div className="host__layout">
              <article className="host__intro">
                <p className="eyebrow">Das Zigarrenkombinat als Gastgeber</p>
                <h2 id="host-title" className="host-title">
                  Beratung beginnt mit Zuhören.
                </h2>
                <p>
                  Rike und Thomas Geißler haben das Zigarrenkombinat als stilvollen Ort für allerlei Genuss aufgebaut.
                </p>
                <a className="button button--secondary" href="#visit">
                  Mehr erfahren
                </a>
              </article>
              <figure className="host__portrait">
                <img src={HOST_IMAGE} alt="Rike und Thomas im Fachgeschäft Zigarrenkombinat Eisenach" />
              </figure>
              <aside className="host__points" aria-label="Beratungs-Vorteile">
                <ul>
                  <li>Individuelle Empfehlungen</li>
                  <li>Persönliche Atmosphäre</li>
                  <li>Zigarren, Spirituosen &amp; Accessoires</li>
                  <li>Fachwissen aus Leidenschaft</li>
                </ul>
              </aside>
            </div>
          </section>

          <section className="about-panel reveal" id="about-panel" aria-labelledby="about-panel-title">
            <div className="about-panel__left">
              <div className="about-panel__note">
                <p>
                  Guter Genuss braucht Zeit,
                  <br />
                  gute Beratung &amp;
                  <br />
                  Vertrauen.
                </p>
                <span>Rike &amp; Thomas</span>
              </div>
            </div>

            <div className="about-panel__right">
              <article className="about-panel__copy">
                <p className="eyebrow">Über mich</p>
                <h2 id="about-panel-title">Für Menschen mit Sinn für das Echte.</h2>
                <p>
                  Ich nehme mir Zeit für dich, deine Wünsche und deine Fragen. Gemeinsam finden wir genau das, was zu
                  dir passt. Persönlich. Unabhängig. Mit Leidenschaft.
                </p>
                <p className="about-panel__signature">Rike &amp; Thomas</p>
                <p className="about-panel__role">Inhaber &amp; Gründer von Zigarrenkombinat.</p>
              </article>

              <figure className="about-panel__polaroid">
                <img src={ABOUT_IMAGE} alt="Rike und Thomas im Fachgeschäft Zigarrenkombinat Eisenach" />
              </figure>
            </div>
          </section>

          <section className="shop wrapper section reveal" id="shop" aria-labelledby="shop-title">
            <div className="shop__head">
              <div className="section-heading">
                <p className="eyebrow">Vor Ort erleben</p>
                <h2 id="shop-title">Vor Ort sehen, anfassen, vergleichen.</h2>
              </div>
              <a
                className="shop__visit eyebrow"
                href="https://maps.google.com/?q=Georgenstra%C3%9Fe+19+C,+99817+Eisenach"
                target="_blank"
                rel="noreferrer"
              >
                Besuchen Sie uns <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="shop__grid">
              <article>
                <span className="shop__icon shop__icon--selection" aria-hidden="true"></span>
                <h3>Auswahl mit Haltung</h3>
                <p>Sorgfältig ausgewählte Produkte, die wir selbst schätzen.</p>
              </article>
              <article>
                <span className="shop__icon shop__icon--advice" aria-hidden="true"></span>
                <h3>Beratung mit Herz</h3>
                <p>Wir nehmen uns Zeit für dich und deine Wünsche.</p>
              </article>
              <article>
                <span className="shop__icon shop__icon--gift" aria-hidden="true"></span>
                <h3>Schöne Geschenke</h3>
                <p>Besondere Ideen für besondere Menschen.</p>
              </article>
            </div>
          </section>

          <section className="profile section reveal" id="profile" aria-labelledby="profile-title">
            <div className="wrapper profile__intro">
              <p className="eyebrow">Genussprofil statt Shop</p>
              <h2 id="profile-title">Dein Profil im Fokus.</h2>
              <p>Für jedes Budget und jeden Geschmack das passende Produkt.</p>
            </div>
            <div className="profile__rail" aria-label="Kuratierte Genussbereiche">
              <article className="profile-card profile-card--wide">
                <span>01</span>
                <h3>ZIGARREN</h3>
                <p>
                  Für jedes Budget und jeden Geschmack das passende Produkt. Ob Shortfiller, Zigarillo oder Longfiller
                  aus dem begehbaren Humidor? Hier gibt es aus unterschiedlichsten Ländern, hochwertige Zigarren in
                  allen Formaten und Preisklassen.
                </p>
              </article>
              <article className="profile-card">
                <span>02</span>
                <h3>SPIRITUOSEN</h3>
                <p>R(h)um, Whisk(e)y, Liköre und Digestive, die nicht blenden sondern begleiten.</p>
              </article>
              <article className="profile-card">
                <span>03</span>
                <h3>WEIN/CREMANT/CHAMPAGNER</h3>
                <p>Für ruhige Abende, gutes Essen oder als Geschenk zu vernünftigen Preisen.</p>
              </article>
              <article className="profile-card">
                <span>04</span>
                <h3>LOUNGE</h3>
                <p>
                  In der Zigarrenlounge können Sie entspannt eine Zigarre genießen und gleichgesinnte Genießer kennen
                  lernen. Die Lounge kann auch außerhalb der Öffnungszeiten von Gruppen gemietet werden. Sprechen Sie
                  uns an.
                </p>
              </article>
            </div>
          </section>

          <section className="video wrapper section reveal" id="video" aria-labelledby="video-title">
            <div className="video__layout">
              <figure className="video__media">
                <img src={VIDEO_IMAGE} alt="Getränk und Zigarren auf Holztisch im Zigarrenkombinat Eisenach" />
              </figure>

              <article className="video__content">
                <p className="eyebrow">Persönlich statt anonym</p>
                <h2 id="video-title">Videoberatung</h2>
                <p className="video__lead">
                  Für Erste Orientierung und konkrete Fragen. Ob Pairingideen oder Geschenke. Bei Terminabsprache
                  nehmen wir uns die Zeit, die Sie brauchen.
                </p>
                <ul className="video__benefits" aria-label="Vorteile der Beratung">
                  <li>Sie bezahlen bequem per Paypal.</li>
                  <li>Ab 100€ versenden wir portofrei.</li>
                  <li>Terminberatung Montag und Dienstag</li>
                  <li>Samstag auch ohne Termin von 11:00-17:00 Uhr</li>
                </ul>
                <a className="button button--primary" href="mailto:zigarrenkombinat@web.de?subject=Videoberatung%20anfragen">
                  Termin anfragen
                </a>
              </article>

              <ol className="steps steps--timeline">
                <li>
                  <span>01</span>
                  <h3>ANFRAGE SENDEN</h3>
                  <p>Du nennst Anlass……</p>
                </li>
                <li>
                  <span>02</span>
                  <h3>GESCHMACK KLÄREN</h3>
                  <p>
                    Wir fragen dich nach Erfahrung, Vorlieben, deiner Preisvorstellung und eventuell nach dem geplanten
                    Anlass.
                  </p>
                </li>
                <li>
                  <span>03</span>
                  <h3>DEINE AUSWAHL</h3>
                  <p>Geht dann, nach Zahlungseingang direkt und gut verpackt auf den Weg.</p>
                </li>
              </ol>
            </div>
          </section>

          <section className="events section reveal" id="events" aria-labelledby="events-title">
            <div className="wrapper section-heading">
              <h2 id="events-title">Events im Zigarrenkombinat</h2>
            </div>
            <div className="event-grid wrapper">
              <article className="event-card">
                <p className="event-card__type">Einsteigerabend</p>
                <h3>Ruhig anfangen.</h3>
                <p>
                  Grundlagen zu Formaten, Lagerung, Anschnitt und Geschmack. Für alle, die ohne Fachjargon starten
                  wollen.
                </p>
                <a href="mailto:zigarrenkombinat@web.de?subject=Verbindliche%20Zusage%20Einsteigerabend">Verbindliche Zusage</a>
              </article>
              <article className="event-card">
                <p className="event-card__type">Zigarrenlausch</p>
                <h3>Hören, fragen, probieren.</h3>
                <p>Ein ruhiger Abend mit Gespräch, Hintergrundwissen und passender Auswahl aus dem Fachgeschäft.</p>
                <a href="mailto:zigarrenkombinat@web.de?subject=Verbindliche%20Zusage%20Zigarrenlausch">Verbindliche Zusage</a>
              </article>
              <article className="event-card">
                <p className="event-card__type">Private Runde</p>
                <h3>Ein Abend für euch.</h3>
                <p>Für kleine Gruppen und besondere Anlässe mit persönlicher Auswahl durch Rike und Thomas.</p>
                <a href="mailto:zigarrenkombinat@web.de?subject=Verbindliche%20Zusage%20Private%20Runde">Verbindliche Zusage</a>
              </article>
            </div>
          </section>

          <section className="contact-merged wrapper section reveal" id="newsletter-visit" aria-label="Newsletter und Besuch">
            <div className="contact-merged__row contact-merged__row--newsletter" id="newsletter" aria-labelledby="newsletter-title">
              <div className="journal__text">
                <p className="eyebrow">Newsletter</p>
                <h2 id="newsletter-title">Immer auf dem neuesten Stand</h2>
                <p>
                  Hinterlassen Sie uns Ihre Handynummer und wir fügen Sie zur WhatsApp Gruppe hinzu. So sind Sie immer
                  zeitnah informiert, ohne Spam.
                </p>
              </div>
              <form
                className="newsletter-form"
                action="mailto:zigarrenkombinat@web.de?subject=Newsletter%20Anmeldung"
                method="post"
                encType="text/plain"
              >
                <label htmlFor="newsletter-phone" className="sr-only">
                  Handynummer
                </label>
                <div className="newsletter-form__row">
                  <input id="newsletter-phone" name="phone" type="tel" placeholder="Handynummer" required />
                  <button type="submit">Eintragen</button>
                </div>
              </form>
              <figure className="journal__visual" aria-hidden="true">
                <img src={NEWS_IMAGE} alt="" />
              </figure>
            </div>

            <div className="contact-merged__row contact-merged__row--visit" id="visit" aria-labelledby="visit-title">
              <div className="visit__content">
                <p className="eyebrow">Besuch &amp; Vertrauen</p>
                <h2 id="visit-title">Georgenstraße 19 C, 99817 Eisenach</h2>
                <p>Direkt in der Innenstadt. Für persönliche Beratung und ruhige Abende.</p>
                <div className="visit__actions">
                  <a
                    className="button button--primary"
                    href="https://maps.google.com/?q=Georgenstra%C3%9Fe+19+C,+99817+Eisenach"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Route öffnen
                  </a>
                  <a className="button button--secondary" href="mailto:zigarrenkombinat@web.de?subject=Besuch%20planen">
                    Kontakt aufnehmen
                  </a>
                </div>
              </div>
              <div className="hours" aria-label="Öffnungszeiten">
                <h3>Öffnungszeiten</h3>
                <dl>
                  <div>
                    <dt>Montag</dt>
                    <dd>Nach Termin</dd>
                  </div>
                  <div>
                    <dt>Dienstag</dt>
                    <dd>Nach Termin</dd>
                  </div>
                  <div>
                    <dt>Mittwoch</dt>
                    <dd>11:00-19:00 Uhr</dd>
                  </div>
                  <div>
                    <dt>Donnerstag</dt>
                    <dd>11:00-19:00 Uhr</dd>
                  </div>
                  <div>
                    <dt>Freitag</dt>
                    <dd>11:00-19:30 Uhr</dd>
                  </div>
                  <div>
                    <dt>Samstag</dt>
                    <dd>11:00-17:00 Uhr</dd>
                  </div>
                </dl>
              </div>
              <a
                className="map-panel"
                href="https://maps.google.com/?q=Georgenstra%C3%9Fe+19+C,+99817+Eisenach"
                target="_blank"
                rel="noreferrer"
                aria-label="Karte in Google Maps öffnen"
              >
                <span className="map-panel__marker"></span>
                <span className="map-panel__label">
                  Innenstadt
                  <br />
                  Eisenach
                </span>
              </a>
            </div>
          </section>

        </main>

        <a className="floating-video" href="#video" aria-label="Zur Videoberatung springen">
          Videoberatung
        </a>

        <footer className="footer wrapper">
          <div className="footer__top">
            <div className="footer__meta">
              <p>Zigarrenkombinat Eisenach · Rike und Thomas</p>
              <p className="footer__note">
                Inhalte zu Tabak, Wein und Spirituosen richten sich ausschließlich an Personen ab 18 Jahren.
              </p>
            </div>
            <nav className="footer__menu" aria-label="Footer-Menü">
              <a href="#shop">Fachgeschäft</a>
              <a href="#profile">Genussprofil</a>
              <a href="#host">Beratung</a>
              <a href="#visit">Besuch</a>
            </nav>
          </div>

          <p className="footer__title" aria-label="Zigarrenkombinat">
            <span>ZIGARREN</span>
            <span>KOMBINAT</span>
          </p>

          <nav className="footer__legal" aria-label="Rechtliches">
            <Link to="/impressum">Impressum</Link>
            <Link to="/datenschutz">Datenschutz</Link>
            <Link to="/jugendschutz">Jugendschutz 18+</Link>
            <a href="#top">Startseite</a>
          </nav>
        </footer>
      </div>
    </>
  );
}

type LegalPageProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  usePageTitle(`${title} | Zigarrenkombinat Eisenach`);

  return (
    <main className="legal-main">
      <div className="legal-shell">
        <Link className="legal-back" to="/">
          Zurück zur Seite
        </Link>
        <article className="legal-article">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {children}
        </article>
      </div>
    </main>
  );
}

function ImpressumPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <address>
        Zigarrenkombinat Eisenach
        <br />
        Thomas Geißler
        <br />
        Georgenstraße 19 C
        <br />
        99817 Eisenach
        <br />
        Deutschland
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href="mailto:zigarrenkombinat@web.de">zigarrenkombinat@web.de</a>
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>Thomas Geißler, Anschrift wie oben.</p>

      <h2>Hinweis vor Veröffentlichung</h2>
      <p>
        Dieser Entwurf ersetzt keine juristische Prüfung. Telefonnummer, Umsatzsteuerangaben und weitere Pflichtangaben
        müssen vor Livegang ergänzt werden, falls sie für das Unternehmen zutreffen.
      </p>
    </LegalPage>
  );
}

function DatenschutzPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Datenschutz">
      <h2>Verantwortlicher</h2>
      <p>
        Verantwortlich für diese Website ist Thomas Geißler, Zigarrenkombinat Eisenach, Georgenstraße 19 C, 99817
        Eisenach. Kontakt: <a href="mailto:zigarrenkombinat@web.de">zigarrenkombinat@web.de</a>.
      </p>

      <h2>Altersbestätigung</h2>
      <p>
        Die Website speichert die Altersbestätigung lokal im Browser. Der Eintrag wird für 30 Tage gespeichert und dient
        nur dazu, die 18+-Abfrage nicht bei jedem Seitenaufruf erneut zu zeigen.
      </p>

      <h2>Kontakt und Newsletter</h2>
      <p>
        Anfrage- und Newsletter-Links öffnen dein E-Mail-Programm. Eine Nachricht wird erst verschickt, wenn du sie dort
        absendest. In diesem Entwurf ist kein externer Newsletter-Dienst angebunden.
      </p>

      <h2>Externe Links</h2>
      <p>Der Routen-Link führt zu Google Maps. Beim Öffnen gelten die Datenschutzregeln des jeweiligen Anbieters.</p>

      <h2>Livegang-Hinweis</h2>
      <p>
        Vor Veröffentlichung müssen Newsletter-Double-Opt-in, Analyse-Tools, Hosting, Cookies und Auftragsverarbeitung
        konkret geprüft und in dieser Erklärung ergänzt werden, falls solche Dienste eingesetzt werden.
      </p>
    </LegalPage>
  );
}

function JugendschutzPage() {
  return (
    <LegalPage eyebrow="18+ Hinweis" title="Jugendschutz">
      <h2>Nur für volljährige Personen</h2>
      <p>
        Diese Website enthält Inhalte zu Zigarren, Wein und Spirituosen. Sie richtet sich ausschließlich an Personen, die
        mindestens 18 Jahre alt sind.
      </p>

      <h2>Kein Verkauf an Minderjährige</h2>
      <p>
        Tabak- und Alkoholprodukte werden nicht an Minderjährige abgegeben. Beim Besuch im Zigarrenkombinat kann ein
        Altersnachweis verlangt werden.
      </p>

      <h2>Verantwortungsvoller Genuss</h2>
      <p>
        Beratung, Tastings und Empfehlungen sind auf erwachsene Gäste ausgerichtet. Genuss soll bewusst, ruhig und
        verantwortungsvoll stattfinden.
      </p>
    </LegalPage>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/impressum" element={<ImpressumPage />} />
      <Route path="/datenschutz" element={<DatenschutzPage />} />
      <Route path="/jugendschutz" element={<JugendschutzPage />} />
    </Routes>
  );
}
