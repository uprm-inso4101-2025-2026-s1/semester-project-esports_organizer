import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/Global.css";

import App from "./App.jsx";
import AuthPage from "./pages/authPages/AuthPage.jsx";
import AccountRecovery from "./pages/authPages/AccountRecovery.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página principal (por ahora es solo el App con botones para testear paginas) */}
        <Route path="/" element={<App />} />

        {/* Login y Signup (reutiliza AuthPage con prop “mode”) */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />

        {/* Recuperación de cuenta */}
        <Route path="/recover" element={<AccountRecovery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
