import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Link, Route, Routes } from "react-router-dom";

const IMG_BASE = "./images/";
const HERO_IMAGE = `${IMG_BASE}zigarrenkombinat_zigarren_sortiert.png`;
const HOST_IMAGE = `${IMG_BASE}zigarrenkombinat_store_panorama_treppe.jpeg`;
const ABOUT_IMAGE = `${IMG_BASE}rike.jpeg`;
const VIDEO_IMAGE = `${IMG_BASE}zigarrenkombinat_spirituosen_tasting_tisch.jpeg`;
const NEWS_IMAGE = `${IMG_BASE}zigarrenkombinat_store_tresen_halbtotal.jpeg`;
const EVENTS_IMAGE = `${IMG_BASE}zigarrenkombinat_event_nicaragua_display.jpeg`;
// TODO: Ersetzen Sie den Platzhalter durch den finalen Gruppen-Einladungslink.
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/";

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function HomePage() {
  usePageTitle("ZIGARRENKOMBINAT | Eisenach");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    const section = document.getElementById(id);
    if (!section) return;
    const topbar = document.querySelector<HTMLElement>(".topbar");
    const offset = (topbar?.offsetHeight ?? 0) + 10;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const onSectionLink =
    (id: string) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setMobileNavOpen(false);
      scrollToSection(id);
    };

  useEffect(() => {
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

    const hideGate = () => {
      if (gate) {
        gate.dataset.state = "hidden";
      }
      lockPage(false);
    };

    document.documentElement.classList.toggle("preview-mode", previewMode);

    if (gate) {
      if (previewMode) {
        hideGate();
      } else {
        gate.dataset.state = "visible";
        lockPage(true);
      }
    }

    const onYes = () => {
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

    const revealSections = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealSelector = [
      ".hero__media",
      ".hero__content",
      ".hero__note",
      ".host__intro",
      ".host__portrait",
      ".host__points",
      ".about-panel__left",
      ".about-panel__right",
      ".shop__head",
      ".shop__grid article",
      ".profile__intro",
      ".profile-card",
      ".video__media",
      ".video__content",
      ".steps li",
      ".events-whatsapp__card",
      ".contact-merged__row",
      ".journal__visual",
      ".hours > div"
    ].join(", ");

    revealSections.forEach((section) => {
      const majorItems = Array.from(section.querySelectorAll<HTMLElement>(revealSelector));
      const fallbackItems = Array.from(section.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
      const items = majorItems.length > 0 ? majorItems : fallbackItems;
      items.forEach((item, index) => {
        item.dataset.revealItem = "true";
        item.style.setProperty("--item-order", String(index));
      });
    });

    let revealObserver: IntersectionObserver | null = null;

    if (reduceMotion) {
      revealSections.forEach((item) => item.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
      );

      revealSections.forEach((item) => revealObserver?.observe(item));
    }

    return () => {
      yesButton?.removeEventListener("click", onYes);
      noButton?.removeEventListener("click", onNo);
      revealObserver?.disconnect();
      lockPage(false);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 760) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <div className="gate js-age-gate" data-state="visible" aria-modal="true" role="dialog">
        <div className="gate__card">
          <p className="gate__eyebrow">Zigarrenkombinat Eisenach</p>
          <h2 className="gate__title">Eintritt ab 18 Jahren</h2>
          <p className="gate__copy">
            Diese Website enthält Inhalte zu Zigarren, Wein und Spirituosen. Bitte bestätigen Sie, dass Sie volljährig
            sind.
          </p>
          <div className="gate__actions">
            <button className="gate__btn gate__btn--yes" data-age="yes" type="button">
              Ja, ich bin 18+
            </button>
            <button className="gate__btn gate__btn--no" data-age="no" type="button">
              Nein
            </button>
          </div>
          <p className="gate__note">Ihre Auswahl gilt nur für diesen Besuch.</p>
          <p className="gate__error" data-age="error" aria-live="polite"></p>
        </div>
      </div>

      <div className="page-shell" id="top">
        <header className="topbar" aria-label="Seitennavigation">
          <a className="topbar__brand" href="#top" onClick={onSectionLink("top")}>
            Zigarrenkombinat
          </a>
          <button
            className="topbar__toggle"
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="main-nav"
            aria-label="Menü öffnen"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav id="main-nav" className={`topbar__nav${mobileNavOpen ? " is-open" : ""}`}>
            <a className="topbar__nav-link" href="#top" onClick={onSectionLink("top")}>
              Start
            </a>
            <a className="topbar__nav-link" href="#host" onClick={onSectionLink("host")}>
              Beratung
            </a>
            <a className="topbar__nav-link" href="#shop" onClick={onSectionLink("shop")}>
              Angebot
            </a>
            <a className="topbar__nav-link" href="#events" onClick={onSectionLink("events")}>
              Abende
            </a>
            <a className="topbar__nav-link" href="#visit" onClick={onSectionLink("visit")}>
              Kontakt
            </a>
          </nav>
        </header>

        <main>
          <section className="hero reveal" data-reveal="up" aria-labelledby="hero-title">
            <figure className="hero__media">
              <img src={HERO_IMAGE} alt="Rike und Thomas Geißler im Zigarrenkombinat Eisenach" />
            </figure>
            <div className="hero__shade"></div>
            <div className="hero__content">
              <p className="eyebrow">ZIGARRENKOMBINAT · RIKE UND THOMAS GEIßLER</p>
              <h1 id="hero-title">Ein guter Einkauf beginnt nicht im Warenkorb.</h1>
              <p className="hero__lead">
                Zigarren, Spirituosen, Wein und Zubehör. Fachlich beraten. Präzise empfohlen.
              </p>
              <div className="hero__actions" aria-label="Hauptaktionen">
                <a className="button button--primary" href="#visit" onClick={onSectionLink("visit")}>
                  Besuch im Fachgeschäft planen
                </a>
                <a className="button button--secondary" href="#shop" onClick={onSectionLink("shop")}>
                  Fachgeschäft entdecken
                </a>
              </div>
            </div>
            <aside className="hero__note" aria-label="Kurzprofil">
              <span>Fachgeschäft</span>
              <p>Zigarren, Spirituosen und Accessories direkt vor Ort. Beratung ohne Verkaufsdruck.</p>
            </aside>
          </section>

          <section className="host wrapper section reveal" id="host" data-reveal="left" aria-labelledby="host-title">
            <div className="host__layout">
              <article className="host__intro">
                <p className="eyebrow">Das Zigarrenkombinat als Gastgeber</p>
                <h2 id="host-title" className="host-title">
                  Beratung beginnt mit Zuhören.
                </h2>
                <p>
                  Rike und Thomas Geißler haben das Zigarrenkombinat als stilvollen Ort für allerlei Genuss aufgebaut.
                </p>
                <a className="button button--secondary" href="#visit" onClick={onSectionLink("visit")}>
                  Mehr erfahren
                </a>
              </article>
              <figure className="host__portrait">
                <img src={HOST_IMAGE} alt="Rike und Thomas Geißler im Fachgeschäft Zigarrenkombinat Eisenach" />
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

          <section className="about-panel reveal" id="about-panel" data-reveal="right" aria-labelledby="about-panel-title">
            <div className="about-panel__left">
              <div className="about-panel__note">
                <p>
                  Guter Genuss braucht Zeit,
                  <br />
                  gute Beratung &amp;
                  <br />
                  Vertrauen.
                </p>
                <span>Rike &amp; Thomas Geißler</span>
              </div>
            </div>

            <div className="about-panel__right">
              <article className="about-panel__copy">
                <p className="eyebrow">Über uns</p>
                <h2 id="about-panel-title">Für Menschen mit Sinn für das Echte.</h2>
                <p>
                  Ich nehme mir Zeit für Sie, Ihre Wünsche und Ihre Fragen. Gemeinsam finden wir genau das, was zu
                  Ihnen passt. Persönlich. Unabhängig. Mit Leidenschaft.
                </p>
                <p className="about-panel__signature">Rike &amp; Thomas Geißler</p>
                <p className="about-panel__role">Inhaber &amp; Gründer von Zigarrenkombinat.</p>
              </article>

              <figure className="about-panel__polaroid">
                <img src={ABOUT_IMAGE} alt="Rike und Thomas Geißler im Fachgeschäft Zigarrenkombinat Eisenach" />
              </figure>
            </div>
          </section>

          <section className="shop wrapper section reveal" id="shop" data-reveal="up" aria-labelledby="shop-title">
            <div className="shop__head">
              <div className="section-heading">
                <p className="eyebrow">Vor Ort erleben</p>
                <h2 id="shop-title">Vor Ort sehen, erleben, vergleichen.</h2>
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
                <p>Wir nehmen uns Zeit für Sie und Ihre Wünsche.</p>
              </article>
              <article>
                <span className="shop__icon shop__icon--gift" aria-hidden="true"></span>
                <h3>Schöne Geschenke</h3>
                <p>Besondere Ideen für besondere Menschen.</p>
              </article>
            </div>
          </section>

          <section className="profile section reveal" id="profile" data-reveal="left" aria-labelledby="profile-title">
            <div className="wrapper profile__intro">
              <p className="eyebrow">Genussprofil statt Shop</p>
              <h2 id="profile-title">Ihr Profil im Fokus.</h2>
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

          <section className="video wrapper section reveal" id="video" data-reveal="right" aria-labelledby="video-title">
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
                  <p>Sie nennen Anlass……</p>
                </li>
                <li>
                  <span>02</span>
                  <h3>GESCHMACK KLÄREN</h3>
                  <p>
                    Wir fragen Sie nach Erfahrung, Vorlieben, Ihrer Preisvorstellung und eventuell nach dem geplanten
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

          <section className="events section reveal" id="events" data-reveal="up" aria-labelledby="events-title">
            <div className="wrapper section-heading">
              <h2 id="events-title">Aktuelle Termine per WhatsApp</h2>
            </div>
            <div className="events-whatsapp wrapper">
              <article className="events-whatsapp__card" style={{ backgroundImage: `url(${EVENTS_IMAGE})` }}>
                <p className="event-card__type">WhatsApp-Gruppe</p>
                <h3>Alle Events auf einen Blick.</h3>
                <p>
                  Alle Tasting-Termine, Zigarrenlausch-Abende und kurzfristigen Plätze finden Sie in unserer
                  WhatsApp-Gruppe. So sind Sie direkt informiert, sobald neue Termine feststehen.
                </p>
                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Zur WhatsApp-Gruppe wechseln"
                >
                  Zur WhatsApp-Gruppe
                </a>
              </article>
            </div>
          </section>

          <section
            className="contact-merged wrapper section reveal"
            id="newsletter-visit"
            data-reveal="left"
            aria-label="Newsletter und Besuch"
          >
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
                    <dd>11:00-18:00 Uhr</dd>
                  </div>
                  <div>
                    <dt>Dienstag</dt>
                    <dd>Nach Vereinbarung</dd>
                  </div>
                  <div>
                    <dt>Mittwoch</dt>
                    <dd>11:00-18:00 Uhr</dd>
                  </div>
                  <div>
                    <dt>Donnerstag</dt>
                    <dd>11:00-18:00 Uhr</dd>
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
            </div>
          </section>

        </main>

        <a className="floating-video" href="#video" aria-label="Zur Videoberatung springen" onClick={onSectionLink("video")}>
          Videoberatung
        </a>

        <footer className="footer wrapper">
          <div className="footer__top">
            <div className="footer__meta">
              <p>Zigarrenkombinat Eisenach · Rike und Thomas Geißler</p>
              <p className="footer__note">
                Inhalte zu Tabak, Wein und Spirituosen richten sich ausschließlich an Personen ab 18 Jahren.
              </p>
            </div>
            <nav className="footer__menu" aria-label="Footer-Menü">
              <a href="#shop" onClick={onSectionLink("shop")}>
                Fachgeschäft
              </a>
              <a href="#profile" onClick={onSectionLink("profile")}>
                Genussprofil
              </a>
              <a href="#host" onClick={onSectionLink("host")}>
                Beratung
              </a>
              <a href="#visit" onClick={onSectionLink("visit")}>
                Besuch
              </a>
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
            <a href="#top" onClick={onSectionLink("top")}>
              Startseite
            </a>
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
        Zigarrenkombinat
        <br />
        Inhaber: Thomas Geißler
        <br />
        Georgenstraße 19c
        <br />
        99817 Eisenach
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href="mailto:zigarrenkombinat@web.de">zigarrenkombinat@web.de</a>
      </p>

      <h2>Steuerliche Angaben</h2>
      <p>Zuständiges Gericht: AG Eisenach</p>
      <p>Zuständiges Finanzamt: FA Eisenach</p>
      <p>Steuernummer: 155/223/02209</p>
      <p>USt-IdNr.: DE454572983</p>

      <h2>Hinweis zur Verantwortlichkeit</h2>
      <p>
        Die Seite enthält derzeit keine journalistisch-redaktionellen Inhalte. Falls solche Inhalte später ergänzt
        werden, kann eine zusätzliche Benennung nach § 18 Abs. 2 MStV erforderlich werden.
      </p>
    </LegalPage>
  );
}

function DatenschutzPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Datenschutzerklärung">
      <h2>1. Datenschutz auf einen Blick</h2>
      <h3>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben Ihnen einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
        passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
        identifiziert werden können.
      </p>

      <h3>Datenerfassung auf dieser Website</h3>
      <ul>
        <li>Verantwortlich für die Datenverarbeitung ist der Websitebetreiber. Die Kontaktdaten finden Sie im Impressum.</li>
        <li>Beim Aufruf der Website verarbeitet der Hosting-Anbieter technisch notwendige Daten, damit die Seite ausgeliefert und abgesichert werden kann.</li>
        <li>Die Altersbestätigung wird nur für den aktuellen Besuch abgefragt. Es werden dafür keine Cookies oder dauerhaft gespeicherten Einträge gesetzt.</li>
        <li>Schriften werden lokal ausgeliefert. Die Seite lädt keine Google Fonts oder andere externe Font-CDNs.</li>
      </ul>

      <h3>Ihre Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch sowie
        Datenübertragbarkeit, soweit die gesetzlichen Voraussetzungen vorliegen.
      </p>

      <h2>2. Verantwortlicher</h2>
      <p>
        Verantwortlich für diese Website ist Thomas Geißler, Zigarrenkombinat, Georgenstraße 19c, 99817 Eisenach.
        Kontakt: <a href="mailto:zigarrenkombinat@web.de">zigarrenkombinat@web.de</a>.
      </p>

      <h2>3. Hosting</h2>
      <p>
        Diese Website wird bei <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina, CA 91723, United
        States gehostet. Vercel verarbeitet dabei im Rahmen der Bereitstellung und Absicherung der Website technische
        Daten. Weitere Informationen finden Sie in der
        <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">
          Datenschutzerklärung von Vercel
        </a>
        und im
        <a href="https://vercel.com/legal/dpa" target="_blank" rel="noreferrer">
          Data Processing Addendum
        </a>
        . Vercel weist zudem auf eine Verarbeitung in den USA und eine Zertifizierung nach dem EU-U.S. Data Privacy
        Framework hin.
      </p>

      <h2>4. Kontakt und Newsletter</h2>
      <p>
        Wenn Sie uns per E-Mail kontaktieren oder die Newsletter-Funktion nutzen, werden die von Ihnen angegebenen
        Daten zur Bearbeitung Ihrer Anfrage verarbeitet. Die Eingabe öffnet Ihr E-Mail-Programm; eine Nachricht wird
        erst versendet, wenn Sie sie dort absenden.
      </p>

      <h2>5. Externe Dienste und Links</h2>
      <p>
        Unsere WhatsApp-Verlinkung und der Routen-Link zu Google Maps führen zu externen Anbietern. Beim Öffnen dieser
        Links gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
      </p>

      <h2>6. Beschwerderecht</h2>
      <p>
        Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Für Thüringen ist dies der
        <a href="https://tlfdi.de/" target="_blank" rel="noreferrer">
          Thüringer Landesbeauftragte für den Datenschutz und die Informationsfreiheit (TLfDI)
        </a>
        .
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
