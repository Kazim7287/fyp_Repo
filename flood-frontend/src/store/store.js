import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import componentReducer from "./slices/componentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    components: componentReducer,
  },
});