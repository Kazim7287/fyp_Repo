
import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getRiverLevelData,
} from "../../api/riverLevelApi";

// ============================================================
// FETCH RIVER LEVEL DATA
// ============================================================

export const fetchRiverLevelData =
  createAsyncThunk(
    "riverLevel/fetchRiverLevelData",
    async (
      {
        locationId = 868,
        start = "-7d",
        stop = "now()",
        limit = 5000,
      } = {},
      { rejectWithValue }
    ) => {
      try {
        const response =
          await getRiverLevelData({
            locationId,
            start,
            stop,
            limit,
          });

        return response;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch river level data."
        );
      }
    }
  );

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  readings: [],

  locationId: null,
  locationName: "",
  sensorId: null,
  sensorType: "",

  count: 0,

  loading: false,
  error: null,

  lastUpdated: null,
};

// ============================================================
// SLICE
// ============================================================

const riverLevelSlice = createSlice({
  name: "riverLevel",

  initialState,

  reducers: {
    clearRiverLevelData: (state) => {
      state.readings = [];
      state.count = 0;
      state.error = null;
      state.lastUpdated = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ------------------------------------------------------
      // REQUEST STARTED
      // ------------------------------------------------------

      .addCase(
        fetchRiverLevelData.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ------------------------------------------------------
      // REQUEST SUCCESSFUL
      // ------------------------------------------------------

      .addCase(
        fetchRiverLevelData.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const data =
            action.payload?.data;

          state.readings =
            data?.readings || [];

          state.count =
            data?.count || 0;

          if (
            state.readings.length > 0
          ) {
            const first =
              state.readings[0];

            state.locationId =
              first.locationId ?? null;

            state.locationName =
              first.locationName || "";

            state.sensorId =
              first.sensorId ?? null;

            state.sensorType =
              first.sensorType || "";
          }

          state.lastUpdated =
            new Date().toISOString();
        }
      )

      // ------------------------------------------------------
      // REQUEST FAILED
      // ------------------------------------------------------

      .addCase(
        fetchRiverLevelData.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch river level data.";
        }
      );
  },
});

// ============================================================
// EXPORT ACTIONS
// ============================================================

export const {
  clearRiverLevelData,
} = riverLevelSlice.actions;

// ============================================================
// EXPORT REDUCER
// ============================================================

export default riverLevelSlice.reducer;
