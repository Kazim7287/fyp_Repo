import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import componentReducer from "./slices/componentSlice";
import nodeReducer from "./slices/nodeSlice";
import alertReducer from "./slices/alertSlice";
import blogReducer from "./slices/blogSlice";
import researchReducer from "./slices/researchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    components: componentReducer,
    nodes: nodeReducer,
    alerts: alertReducer,
    blogs: blogReducer,
    research: researchReducer,
  },
});