import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "./common.css";
import "../style.css";

const GH_PAGES_RESTORE_KEY = "zigarrenkombinat:redirect-path";
const restoredPath = sessionStorage.getItem(GH_PAGES_RESTORE_KEY);

if (restoredPath) {
  sessionStorage.removeItem(GH_PAGES_RESTORE_KEY);
  window.history.replaceState(null, "", restoredPath);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
