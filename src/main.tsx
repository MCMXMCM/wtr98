import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// In development, unregister any existing service workers to prevent caching issues
// This ensures old service workers don't interfere with Vite's HMR
if ("serviceWorker" in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log("Service Worker unregistered for development");
    });
  });
}

// Register service worker for PWA functionality (production only)
// In development, service workers can interfere with Vite's HMR
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        
        // Check for updates immediately and then periodically
        registration.update();
        
        // Check for updates every hour
        setInterval(() => {
          registration.update().catch((err) => {
            console.warn("Service Worker update check failed:", err);
          });
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
