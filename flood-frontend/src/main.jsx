import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store/store";
import AuthInitializer from "./components/auth/AuthInitializer";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);