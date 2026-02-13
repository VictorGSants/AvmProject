import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Importante!
import RouterApp from "./routes/routes.jsx";
import ContratoProvider from "./context/ContratoContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContratoProvider>
      <RouterApp />
    </ContratoProvider>
  </React.StrictMode>
);
