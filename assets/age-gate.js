(() => {
  const STORAGE_KEY = "thomas_geissler_age_verified_until";
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  function getExpiry() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function isVerified() {
    return getExpiry() > Date.now();
  }

  function hasPreviewBypass() {
    const params = new URLSearchParams(window.location.search);
    return params.get("preview") === "1";
  }

  function storeVerification() {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + THIRTY_DAYS_MS));
  }

  function lockPage(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function showError(target, text) {
    if (!target) return;
    target.textContent = text;
  }

  function initGate(gate) {
    const yesButton = gate.querySelector("[data-age='yes']");
    const noButton = gate.querySelector("[data-age='no']");
    const errorNode = gate.querySelector("[data-age='error']");

    if (hasPreviewBypass()) {
      gate.dataset.state = "hidden";
      lockPage(false);
      return;
    }

    if (isVerified()) {
      gate.dataset.state = "hidden";
      lockPage(false);
      return;
    }

    lockPage(true);
    gate.dataset.state = "visible";

    yesButton?.addEventListener("click", () => {
      storeVerification();
      gate.dataset.state = "hidden";
      lockPage(false);
      showError(errorNode, "");
    });

    noButton?.addEventListener("click", () => {
      showError(errorNode, "Zugriff nicht erlaubt. Diese Seite ist nur für volljährige Besucher.");
    });
  }

  document.querySelectorAll(".js-age-gate").forEach(initGate);
})();
