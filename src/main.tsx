import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const redirectParam = new URLSearchParams(window.location.search).get("redirect");
if (redirectParam) {
  const decodedPath = decodeURIComponent(redirectParam);
  const newUrl = `${window.location.origin}${decodedPath}`;
  window.history.replaceState(null, "", newUrl);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || "/"}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
