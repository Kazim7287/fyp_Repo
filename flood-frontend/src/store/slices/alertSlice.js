import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAlertsApi,
  getAlertByIdApi,
  createAlertApi,
  acknowledgeAlertApi,
  resolveAlertApi,
} from "../../api/alertsApi";

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
|
| Your backend may return:
|
| {
|   success: true,
|   data: [...]
| }
|
| or:
|
| {
|   success: true,
|   alerts: [...]
| }
|
| This helper keeps the frontend tolerant of either format.
|--------------------------------------------------------------------------
*/

const extractData = (response) => {
  if (!response) {
    return null;
  }

  if (
    response.data !== undefined
  ) {
    return response.data;
  }

  if (
    response.alerts !== undefined
  ) {
    return response.alerts;
  }

  return response;
};

/*
|--------------------------------------------------------------------------
| GET ALERTS
|--------------------------------------------------------------------------
*/

export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAlerts",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await getAlertsApi(params);

      const data =
        extractData(response);

      return Array.isArray(data)
        ? data
        : data?.alerts || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch alerts."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ALERT
|--------------------------------------------------------------------------
*/

export const fetchAlertById =
  createAsyncThunk(
    "alerts/fetchAlertById",

    async (id, thunkAPI) => {
      try {
        const response =
          await getAlertByIdApi(id);

        return extractData(response);
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch alert."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| CREATE MANUAL ALERT
|--------------------------------------------------------------------------
*/

export const createManualAlert =
  createAsyncThunk(
    "alerts/createManualAlert",

    async (alertData, thunkAPI) => {
      try {
        const response =
          await createAlertApi(
            alertData
          );

        return extractData(response);
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to create alert."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| ACKNOWLEDGE ALERT
|--------------------------------------------------------------------------
*/

export const acknowledgeAlert =
  createAsyncThunk(
    "alerts/acknowledgeAlert",

    async (id, thunkAPI) => {
      try {
        const response =
          await acknowledgeAlertApi(
            id
          );

        return extractData(response);
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to acknowledge alert."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| RESOLVE ALERT
|--------------------------------------------------------------------------
*/

export const resolveAlert =
  createAsyncThunk(
    "alerts/resolveAlert",

    async (id, thunkAPI) => {
      try {
        const response =
          await resolveAlertApi(id);

        return extractData(response);
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to resolve alert."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  alerts: [],

  selectedAlert: null,

  loading: false,

  creating: false,

  updating: false,

  error: null,

  createError: null,

  updateError: null,
};

/*
|--------------------------------------------------------------------------
| ALERT SLICE
|--------------------------------------------------------------------------
*/

const alertSlice = createSlice({
  name: "alerts",

  initialState,

  reducers: {
    clearAlertError: (state) => {
      state.error = null;
    },

    clearCreateAlertError: (state) => {
      state.createError = null;
    },

    clearUpdateAlertError: (state) => {
      state.updateError = null;
    },

    setSelectedAlert: (
      state,
      action
    ) => {
      state.selectedAlert =
        action.payload;
    },

    clearSelectedAlert: (state) => {
      state.selectedAlert = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | FETCH ALERTS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        fetchAlerts.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAlerts.fulfilled,
        (state, action) => {
          state.loading = false;

          state.alerts =
            action.payload || [];
        }
      )

      .addCase(
        fetchAlerts.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch alerts.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH SINGLE ALERT
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        fetchAlertById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAlertById.fulfilled,
        (state, action) => {
          state.loading = false;

          state.selectedAlert =
            action.payload;
        }
      )

      .addCase(
        fetchAlertById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch alert.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | CREATE MANUAL ALERT
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        createManualAlert.pending,
        (state) => {
          state.creating = true;

          state.createError = null;
        }
      )

      .addCase(
        createManualAlert.fulfilled,
        (state, action) => {
          state.creating = false;

          const createdAlert =
            action.payload;

          if (createdAlert) {
            state.alerts.unshift(
              createdAlert
            );
          }
        }
      )

      .addCase(
        createManualAlert.rejected,
        (state, action) => {
          state.creating = false;

          state.createError =
            action.payload ||
            "Failed to create alert.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | ACKNOWLEDGE ALERT
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        acknowledgeAlert.pending,
        (state) => {
          state.updating = true;

          state.updateError = null;
        }
      )

      .addCase(
        acknowledgeAlert.fulfilled,
        (state, action) => {
          state.updating = false;

          const updatedAlert =
            action.payload;

          if (!updatedAlert) {
            return;
          }

          const index =
            state.alerts.findIndex(
              (alert) =>
                String(alert.id) ===
                String(
                  updatedAlert.id
                )
            );

          if (index !== -1) {
            state.alerts[index] =
              updatedAlert;
          }

          if (
            state.selectedAlert &&
            String(
              state.selectedAlert.id
            ) ===
              String(updatedAlert.id)
          ) {
            state.selectedAlert =
              updatedAlert;
          }
        }
      )

      .addCase(
        acknowledgeAlert.rejected,
        (state, action) => {
          state.updating = false;

          state.updateError =
            action.payload ||
            "Failed to acknowledge alert.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | RESOLVE ALERT
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        resolveAlert.pending,
        (state) => {
          state.updating = true;

          state.updateError = null;
        }
      )

      .addCase(
        resolveAlert.fulfilled,
        (state, action) => {
          state.updating = false;

          const updatedAlert =
            action.payload;

          if (!updatedAlert) {
            return;
          }

          const index =
            state.alerts.findIndex(
              (alert) =>
                String(alert.id) ===
                String(
                  updatedAlert.id
                )
            );

          if (index !== -1) {
            state.alerts[index] =
              updatedAlert;
          }

          if (
            state.selectedAlert &&
            String(
              state.selectedAlert.id
            ) ===
              String(updatedAlert.id)
          ) {
            state.selectedAlert =
              updatedAlert;
          }
        }
      )

      .addCase(
        resolveAlert.rejected,
        (state, action) => {
          state.updating = false;

          state.updateError =
            action.payload ||
            "Failed to resolve alert.";
        }
      );
  },
});

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  clearAlertError,
  clearCreateAlertError,
  clearUpdateAlertError,
  setSelectedAlert,
  clearSelectedAlert,
} = alertSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectAlerts =
  (state) =>
    state.alerts?.alerts || [];

export const selectSelectedAlert =
  (state) =>
    state.alerts?.selectedAlert || null;

export const selectAlertsLoading =
  (state) =>
    state.alerts?.loading || false;

export const selectAlertsCreating =
  (state) =>
    state.alerts?.creating || false;

export const selectAlertsUpdating =
  (state) =>
    state.alerts?.updating || false;

export const selectAlertsError =
  (state) =>
    state.alerts?.error || null;

export const selectAlertsCreateError =
  (state) =>
    state.alerts?.createError || null;

export const selectAlertsUpdateError =
  (state) =>
    state.alerts?.updateError || null;

/*
|--------------------------------------------------------------------------
| EXPORT REDUCER
|--------------------------------------------------------------------------
*/

export default alertSlice.reducer;