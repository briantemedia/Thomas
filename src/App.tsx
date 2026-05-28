import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
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
const TRACKER_STORAGE_KEY = "zigarrenkombinat_call_tracker_v1";
const TRACKER_RESULTS = ["positiv", "negativ", "nicht-erreicht"] as const;

type TrackerResult = (typeof TRACKER_RESULTS)[number];

type TrackerContact = {
  id: string;
  name: string;
  result: TrackerResult;
  notes: string;
  contactedAt: string;
};

type TrackerSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  contacts: TrackerContact[];
};

type TrackerData = {
  version: 1;
  sessions: TrackerSession[];
};

function defaultTrackerData(): TrackerData {
  return { version: 1, sessions: [] };
}

function loadTrackerData(): TrackerData {
  try {
    const raw = localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!raw) return defaultTrackerData();
    const parsed = JSON.parse(raw) as TrackerData;
    if (!parsed || !Array.isArray(parsed.sessions)) return defaultTrackerData();
    return parsed;
  } catch {
    return defaultTrackerData();
  }
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getSessionDurationSeconds(session: TrackerSession, nowMs: number): number {
  const started = toDate(session.startedAt);
  if (!started) return 0;
  if (session.endedAt) return Math.max(0, session.durationSeconds);
  return Math.max(0, Math.floor((nowMs - started.getTime()) / 1000));
}

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diffToMonday = (day + 6) % 7;
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  return weekStart;
}

function inCurrentDay(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function inCurrentMonth(date: Date, now: Date): boolean {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function inCurrentWeek(date: Date, now: Date): boolean {
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

type TrackerSummary = {
  sessions: number;
  contacts: number;
  durationSeconds: number;
};

function summarizeSessions(
  sessions: TrackerSession[],
  nowMs: number,
  filterFn: (started: Date) => boolean
): TrackerSummary {
  return sessions.reduce<TrackerSummary>(
    (acc, session) => {
      const started = toDate(session.startedAt);
      if (!started || !filterFn(started)) return acc;
      acc.sessions += 1;
      acc.contacts += session.contacts.length;
      acc.durationSeconds += getSessionDurationSeconds(session, nowMs);
      return acc;
    },
    { sessions: 0, contacts: 0, durationSeconds: 0 }
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function HomePage() {
  usePageTitle("ZIGARRENKOMBINAT | Eisenach");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [trackerData, setTrackerData] = useState<TrackerData>(() => loadTrackerData());
  const [trackerName, setTrackerName] = useState("");
  const [trackerResult, setTrackerResult] = useState<TrackerResult>("positiv");
  const [trackerNotes, setTrackerNotes] = useState("");
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const activeTrackerSession = useMemo(
    () => trackerData.sessions.find((session) => !session.endedAt) ?? null,
    [trackerData.sessions]
  );

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
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(trackerData));
  }, [trackerData]);

  useEffect(() => {
    if (!activeTrackerSession) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeTrackerSession]);

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

  const startTrackerSession = () => {
    if (activeTrackerSession) return;
    const startedAt = new Date().toISOString();
    setNowMs(Date.now());
    setTrackerData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          id: `session-${Date.now()}`,
          startedAt,
          endedAt: null,
          durationSeconds: 0,
          contacts: []
        }
      ]
    }));
    setTrackerOpen(true);
  };

  const stopTrackerSession = () => {
    if (!activeTrackerSession) return;
    const now = new Date();
    const endedAt = now.toISOString();
    const nowMsLocal = now.getTime();
    setTrackerData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session) => {
        if (session.id !== activeTrackerSession.id) return session;
        return {
          ...session,
          endedAt,
          durationSeconds: getSessionDurationSeconds(session, nowMsLocal)
        };
      })
    }));
  };

  const addTrackerContact = () => {
    if (!activeTrackerSession) return;
    const cleanName = trackerName.trim();
    if (!cleanName) return;
    const contact: TrackerContact = {
      id: `contact-${Date.now()}`,
      name: cleanName,
      result: trackerResult,
      notes: trackerNotes.trim(),
      contactedAt: new Date().toISOString()
    };
    setTrackerData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session) => {
        if (session.id !== activeTrackerSession.id) return session;
        return { ...session, contacts: [contact, ...session.contacts] };
      })
    }));
    setTrackerName("");
    setTrackerResult("positiv");
    setTrackerNotes("");
    setTrackerOpen(true);
  };

  const nowDate = new Date(nowMs);
  const daySummary = summarizeSessions(trackerData.sessions, nowMs, (d) => inCurrentDay(d, nowDate));
  const weekSummary = summarizeSessions(trackerData.sessions, nowMs, (d) => inCurrentWeek(d, nowDate));
  const monthSummary = summarizeSessions(trackerData.sessions, nowMs, (d) => inCurrentMonth(d, nowDate));
  const activeDurationSeconds = activeTrackerSession ? getSessionDurationSeconds(activeTrackerSession, nowMs) : 0;

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
          <p className="gate__note">Ihre Auswahl wird für 30 Tage gespeichert.</p>
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

        <aside className={`tracker-panel${trackerOpen ? " is-open" : ""}`} aria-label="Session-Tracker">
          <button
            className="tracker-panel__toggle"
            type="button"
            onClick={() => setTrackerOpen((open) => !open)}
            aria-expanded={trackerOpen}
            aria-controls="tracker-body"
          >
            Tracker
          </button>
          <div className="tracker-panel__body" id="tracker-body">
            <div className="tracker-panel__session">
              <p>Aktive Session</p>
              <strong>{activeTrackerSession ? formatDuration(activeDurationSeconds) : "Keine laufende Session"}</strong>
              <div className="tracker-panel__buttons">
                <button type="button" onClick={startTrackerSession} disabled={Boolean(activeTrackerSession)}>
                  Start
                </button>
                <button type="button" onClick={stopTrackerSession} disabled={!activeTrackerSession}>
                  Stop
                </button>
              </div>
            </div>

            <div className="tracker-panel__form">
              <label>
                Kontakt
                <input
                  type="text"
                  value={trackerName}
                  onChange={(event) => setTrackerName(event.target.value)}
                  placeholder="Name oder Firma"
                  disabled={!activeTrackerSession}
                />
              </label>
              <label>
                Ergebnis
                <select
                  value={trackerResult}
                  onChange={(event) => setTrackerResult(event.target.value as TrackerResult)}
                  disabled={!activeTrackerSession}
                >
                  {TRACKER_RESULTS.map((result) => (
                    <option key={result} value={result}>
                      {result}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notiz
                <input
                  type="text"
                  value={trackerNotes}
                  onChange={(event) => setTrackerNotes(event.target.value)}
                  placeholder="optional"
                  disabled={!activeTrackerSession}
                />
              </label>
              <button type="button" onClick={addTrackerContact} disabled={!activeTrackerSession || !trackerName.trim()}>
                Kontakt speichern
              </button>
            </div>

            <div className="tracker-panel__stats">
              <h3>Auswertung</h3>
              <ul>
                <li>
                  <span>Heute</span>
                  <strong>{daySummary.contacts} Kontakte</strong>
                  <small>{formatDuration(daySummary.durationSeconds)}</small>
                </li>
                <li>
                  <span>Diese Woche</span>
                  <strong>{weekSummary.contacts} Kontakte</strong>
                  <small>{formatDuration(weekSummary.durationSeconds)}</small>
                </li>
                <li>
                  <span>Diesen Monat</span>
                  <strong>{monthSummary.contacts} Kontakte</strong>
                  <small>{formatDuration(monthSummary.durationSeconds)}</small>
                </li>
              </ul>
            </div>
          </div>
        </aside>

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
        Anfrage- und Newsletter-Links öffnen Ihr E-Mail-Programm. Eine Nachricht wird erst verschickt, wenn Sie sie
        dort absenden. In diesem Entwurf ist kein externer Newsletter-Dienst angebunden.
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
