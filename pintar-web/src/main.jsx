import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SocketProvider } from "../context/socket";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SocketProvider>
);
