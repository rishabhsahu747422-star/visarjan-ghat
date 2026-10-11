import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Hindi font bundled, no runtime CDN (works offline, and on a projector with no network).
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
