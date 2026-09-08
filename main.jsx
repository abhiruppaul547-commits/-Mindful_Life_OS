import React from "react";
import { createRoot } from "react-dom/client";
import BaselineUI from "./BaselineUI.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BaselineUI />
  </React.StrictMode>,
);
