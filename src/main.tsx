import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./Home";
import HudsonBendSingleSport from "./reports/HudsonBendSingleSport";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hudson-bend-single-sport" element={<HudsonBendSingleSport />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
