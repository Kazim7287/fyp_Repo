
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import componentReducer from "./slices/componentSlice";
import nodeReducer from "./slices/nodeSlice";
import alertReducer from "./slices/alertSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    components: componentReducer,
    nodes: nodeReducer,
    alerts: alertReducer,
  },
});
