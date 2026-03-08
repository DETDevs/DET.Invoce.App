import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/Global.css";
import App from "./App.tsx";

Sentry.init({
  dsn: "https://11229ccad072ef32f6546a328536f2f0@o4511010031075328.ingest.us.sentry.io/4511010031992832",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance monitoring — capture 100% of transactions in production
  tracesSampleRate: 1.0,
  // Session Replay — 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environment tag
  environment: import.meta.env.MODE,
  // Only send errors from your domains
  allowUrls: [
    /https?:\/\/(.*\.)?vercel\.app/,
    /https?:\/\/(.*\.)?dmomentos\.org/,
  ],
  // Ignore common noise
  ignoreErrors: ["ResizeObserver loop", "Non-Error promise rejection captured"],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
