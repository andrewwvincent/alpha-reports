import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./Home";
import HudsonBendSingleSport from "./reports/HudsonBendSingleSport";
import ForSaleReport from "./reports/ForSaleReport";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hudson-bend-single-sport" element={<HudsonBendSingleSport />} />
        <Route path="/for-sale-schools" element={<ForSaleReport />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
