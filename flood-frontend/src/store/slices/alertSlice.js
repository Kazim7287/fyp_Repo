import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAlerts,
  getAlertById,
  createAlert,
  acknowledgeAlertApi,
  resolveAlertApi,
} from "../../api/alertsApi";

/* =========================================================
   HELPER
========================================================= */

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   FETCH ALL ALERTS
========================================================= */

export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAlerts",

  async (_, { rejectWithValue }) => {
    try {
      const data = await getAlerts();

      /*
      Supports common backend responses:

      {
        alerts: [...]
      }

      OR

      {
        data: [...]
      }

      OR

      [...]
      */

      return (
        data?.alerts ||
        data?.data ||
        data ||
        []
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch alerts"
        )
      );
    }
  }
);

/* =========================================================
   FETCH ALERT BY ID
========================================================= */

export const fetchAlertById =
  createAsyncThunk(
    "alerts/fetchAlertById",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Alert ID is required"
          );
        }

        const data =
          await getAlertById(id);

        /*
        Supports:

        {
          alert: {...}
        }

        OR

        {
          data: {...}
        }

        OR

        {...}
        */

        return (
          data?.alert ||
          data?.data ||
          data
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch alert details"
          )
        );
      }
    }
  );

/* =========================================================
   CREATE MANUAL ALERT
========================================================= */

export const createManualAlert =
  createAsyncThunk(
    "alerts/createManualAlert",

    async (
      alertData,
      { rejectWithValue }
    ) => {
      try {
        const data =
          await createAlert(
            alertData
          );

        /*
        Supports:

        {
          alert: {...}
        }

        OR

        {
          data: {...}
        }
        */

        return (
          data?.alert ||
          data?.data ||
          data
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to create alert"
          )
        );
      }
    }
  );

/* =========================================================
   ACKNOWLEDGE ALERT
========================================================= */

export const acknowledgeAlert =
  createAsyncThunk(
    "alerts/acknowledgeAlert",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Alert ID is required"
          );
        }

        const data =
          await acknowledgeAlertApi(
            id
          );

        return (
          data?.alert ||
          data?.data ||
          data ||
          { id }
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to acknowledge alert"
          )
        );
      }
    }
  );

/* =========================================================
   RESOLVE ALERT
========================================================= */

export const resolveAlert =
  createAsyncThunk(
    "alerts/resolveAlert",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Alert ID is required"
          );
        }

        const data =
          await resolveAlertApi(
            id
          );

        return (
          data?.alert ||
          data?.data ||
          data ||
          { id }
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to resolve alert"
          )
        );
      }
    }
  );

/* =========================================================
   INITIAL STATE
========================================================= */

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

/* =========================================================
   SLICE
========================================================= */

const alertSlice = createSlice({
  name: "alerts",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR GENERAL ERROR
    ===================================================== */

    clearAlertsError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR CREATE ERROR
    ===================================================== */

    clearAlertsCreateError: (
      state
    ) => {
      state.createError = null;
    },

    /* =====================================================
       CLEAR UPDATE ERROR
    ===================================================== */

    clearAlertsUpdateError: (
      state
    ) => {
      state.updateError = null;
    },

    /* =====================================================
       CLEAR SELECTED ALERT
    ===================================================== */

    clearSelectedAlert: (state) => {
      state.selectedAlert = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===================================================
         FETCH ALERTS
      =================================================== */

      .addCase(
        fetchAlerts.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAlerts.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;

          /*
          Make sure alerts is always
          an array.
          */

          state.alerts =
            Array.isArray(
              action.payload
            )
              ? action.payload
              : [];
        }
      )

      .addCase(
        fetchAlerts.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch alerts";
        }
      )

      /* ===================================================
         FETCH ALERT BY ID
      =================================================== */

      .addCase(
        fetchAlertById.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        fetchAlertById.fulfilled,
        (
          state,
          action
        ) => {
          state.selectedAlert =
            action.payload;

          /*
          Also update the alert
          inside the main list if
          it already exists.
          */

          if (
            action.payload?.id
          ) {
            const index =
              state.alerts.findIndex(
                (alert) =>
                  alert.id ===
                  action.payload.id
              );

            if (index !== -1) {
              state.alerts[index] =
                {
                  ...state.alerts[
                    index
                  ],
                  ...action.payload,
                };
            }
          }
        }
      )

      .addCase(
        fetchAlertById.rejected,
        (
          state,
          action
        ) => {
          state.error =
            action.payload ||
            "Failed to fetch alert details";
        }
      )

      /* ===================================================
         CREATE MANUAL ALERT
      =================================================== */

      .addCase(
        createManualAlert.pending,
        (state) => {
          state.creating = true;

          state.createError =
            null;
        }
      )

      .addCase(
        createManualAlert.fulfilled,
        (
          state,
          action
        ) => {
          state.creating = false;

          /*
          Add newly created alert
          to the top of the list.
          */

          if (
            action.payload
          ) {
            state.alerts.unshift(
              action.payload
            );
          }
        }
      )

      .addCase(
        createManualAlert.rejected,
        (
          state,
          action
        ) => {
          state.creating = false;

          state.createError =
            action.payload ||
            "Failed to create alert";
        }
      )

      /* ===================================================
         ACKNOWLEDGE ALERT
      =================================================== */

      .addCase(
        acknowledgeAlert.pending,
        (state) => {
          state.updating = true;

          state.updateError =
            null;
        }
      )

      .addCase(
        acknowledgeAlert.fulfilled,
        (
          state,
          action
        ) => {
          state.updating = false;

          const updatedAlert =
            action.payload;

          if (
            updatedAlert?.id
          ) {
            const index =
              state.alerts.findIndex(
                (alert) =>
                  alert.id ===
                  updatedAlert.id
              );

            if (index !== -1) {
              state.alerts[index] =
                {
                  ...state.alerts[
                    index
                  ],
                  ...updatedAlert,
                };
            }

            /*
            Update modal data too.
            */

            if (
              state.selectedAlert
                ?.id ===
              updatedAlert.id
            ) {
              state.selectedAlert =
                {
                  ...state.selectedAlert,
                  ...updatedAlert,
                };
            }
          }
        }
      )

      .addCase(
        acknowledgeAlert.rejected,
        (
          state,
          action
        ) => {
          state.updating = false;

          state.updateError =
            action.payload ||
            "Failed to acknowledge alert";
        }
      )

      /* ===================================================
         RESOLVE ALERT
      =================================================== */

      .addCase(
        resolveAlert.pending,
        (state) => {
          state.updating = true;

          state.updateError =
            null;
        }
      )

      .addCase(
        resolveAlert.fulfilled,
        (
          state,
          action
        ) => {
          state.updating = false;

          const updatedAlert =
            action.payload;

          if (
            updatedAlert?.id
          ) {
            const index =
              state.alerts.findIndex(
                (alert) =>
                  alert.id ===
                  updatedAlert.id
              );

            if (index !== -1) {
              state.alerts[index] =
                {
                  ...state.alerts[
                    index
                  ],
                  ...updatedAlert,
                };
            }

            /*
            Update selected alert.
            */

            if (
              state.selectedAlert
                ?.id ===
              updatedAlert.id
            ) {
              state.selectedAlert =
                {
                  ...state.selectedAlert,
                  ...updatedAlert,
                };
            }
          }
        }
      )

      .addCase(
        resolveAlert.rejected,
        (
          state,
          action
        ) => {
          state.updating = false;

          state.updateError =
            action.payload ||
            "Failed to resolve alert";
        }
      );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearAlertsError,
  clearAlertsCreateError,
  clearAlertsUpdateError,
  clearSelectedAlert,
} = alertSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAlerts = (
  state
) =>
  state.alerts?.alerts || [];

export const selectSelectedAlert = (
  state
) =>
  state.alerts
    ?.selectedAlert || null;

export const selectAlertsLoading = (
  state
) =>
  state.alerts?.loading || false;

export const selectAlertsCreating = (
  state
) =>
  state.alerts?.creating || false;

export const selectAlertsUpdating = (
  state
) =>
  state.alerts?.updating || false;

export const selectAlertsError = (
  state
) =>
  state.alerts?.error || null;

export const selectAlertsCreateError = (
  state
) =>
  state.alerts?.createError ||
  null;

export const selectAlertsUpdateError = (
  state
) =>
  state.alerts?.updateError ||
  null;

/* =========================================================
   REDUCER
========================================================= */

export default alertSlice.reducer;