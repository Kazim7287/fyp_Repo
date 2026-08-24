import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },

    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setAuthLoading,
} = authSlice.actions;

export default authSlice.reducer;