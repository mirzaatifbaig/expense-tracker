import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./lib/theme-provider.jsx";
import { registerServiceWorker } from "./lib/service-worker.js";
await registerServiceWorker();
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
