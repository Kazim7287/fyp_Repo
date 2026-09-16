import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getEmergencyInformation,
  getEmergencyInformationById,
  createEmergencyInformation,
  updateEmergencyInformation,
  deleteEmergencyInformation,
} from "../../api/emergencyApi";

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  emergencyInformation: [],
  currentEmergency: null,

  loading: false,
  fetchByIdLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,
  fetchByIdError: null,
  createError: null,
  updateError: null,
  deleteError: null,

  successMessage: null,
};

// =========================================================
// FETCH ALL EMERGENCY INFORMATION
// =========================================================

export const fetchEmergencyInformation = createAsyncThunk(
  "emergency/fetchEmergencyInformation",

  async (params = {}, { rejectWithValue }) => {
    try {
      const response =
        await getEmergencyInformation(params);

      if (!response?.success) {
        return rejectWithValue(
          response?.message ||
            "Failed to fetch emergency information."
        );
      }

      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch emergency information."
      );
    }
  }
);

// =========================================================
// FETCH EMERGENCY INFORMATION BY ID
// =========================================================

export const fetchEmergencyInformationById =
  createAsyncThunk(
    "emergency/fetchEmergencyInformationById",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await getEmergencyInformationById(id);

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              "Failed to fetch emergency information."
          );
        }

        return response.data || null;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch emergency information."
        );
      }
    }
  );

// =========================================================
// CREATE EMERGENCY INFORMATION
// =========================================================

export const addEmergencyInformation =
  createAsyncThunk(
    "emergency/addEmergencyInformation",

    async (data, { rejectWithValue }) => {
      try {
        const response =
          await createEmergencyInformation(data);

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              "Failed to create emergency information."
          );
        }

        return {
          data: response.data,
          message:
            response.message ||
            "Emergency information created successfully.",
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to create emergency information."
        );
      }
    }
  );

// =========================================================
// UPDATE EMERGENCY INFORMATION
// =========================================================

export const editEmergencyInformation =
  createAsyncThunk(
    "emergency/editEmergencyInformation",

    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response =
          await updateEmergencyInformation(id, data);

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              "Failed to update emergency information."
          );
        }

        return {
          data: response.data,
          message:
            response.message ||
            "Emergency information updated successfully.",
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to update emergency information."
        );
      }
    }
  );

// =========================================================
// DELETE EMERGENCY INFORMATION
// =========================================================

export const removeEmergencyInformation =
  createAsyncThunk(
    "emergency/removeEmergencyInformation",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await deleteEmergencyInformation(id);

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              "Failed to delete emergency information."
          );
        }

        return {
          id,
          message:
            response.message ||
            "Emergency information deleted successfully.",
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete emergency information."
        );
      }
    }
  );

// =========================================================
// EMERGENCY SLICE
// =========================================================

const emergencySlice = createSlice({
  name: "emergency",

  initialState,

  reducers: {
    // -----------------------------------------------------
    // CLEAR GENERAL ERROR
    // -----------------------------------------------------

    clearEmergencyError: (state) => {
      state.error = null;
    },

    // -----------------------------------------------------
    // CLEAR FETCH BY ID ERROR
    // -----------------------------------------------------

    clearFetchByIdError: (state) => {
      state.fetchByIdError = null;
    },

    // -----------------------------------------------------
    // CLEAR CREATE ERROR
    // -----------------------------------------------------

    clearCreateError: (state) => {
      state.createError = null;
    },

    // -----------------------------------------------------
    // CLEAR UPDATE ERROR
    // -----------------------------------------------------

    clearUpdateError: (state) => {
      state.updateError = null;
    },

    // -----------------------------------------------------
    // CLEAR DELETE ERROR
    // -----------------------------------------------------

    clearDeleteError: (state) => {
      state.deleteError = null;
    },

    // -----------------------------------------------------
    // CLEAR SUCCESS MESSAGE
    // -----------------------------------------------------

    clearEmergencySuccessMessage: (state) => {
      state.successMessage = null;
    },

    // -----------------------------------------------------
    // CLEAR CURRENT EMERGENCY
    // -----------------------------------------------------

    clearCurrentEmergency: (state) => {
      state.currentEmergency = null;
    },

    // -----------------------------------------------------
    // RESET EMERGENCY STATE
    // -----------------------------------------------------

    resetEmergencyState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // =====================================================
    // FETCH ALL
    // =====================================================

    builder

      .addCase(
        fetchEmergencyInformation.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchEmergencyInformation.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.emergencyInformation =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        }
      )

      .addCase(
        fetchEmergencyInformation.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch emergency information.";

          state.emergencyInformation = [];
        }
      );

    // =====================================================
    // FETCH BY ID
    // =====================================================

    builder

      .addCase(
        fetchEmergencyInformationById.pending,
        (state) => {
          state.fetchByIdLoading = true;
          state.fetchByIdError = null;
        }
      )

      .addCase(
        fetchEmergencyInformationById.fulfilled,
        (state, action) => {
          state.fetchByIdLoading = false;
          state.fetchByIdError = null;

          state.currentEmergency =
            action.payload || null;
        }
      )

      .addCase(
        fetchEmergencyInformationById.rejected,
        (state, action) => {
          state.fetchByIdLoading = false;

          state.fetchByIdError =
            action.payload ||
            "Failed to fetch emergency information.";

          state.currentEmergency = null;
        }
      );

    // =====================================================
    // CREATE
    // =====================================================

    builder

      .addCase(
        addEmergencyInformation.pending,
        (state) => {
          state.createLoading = true;
          state.createError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        addEmergencyInformation.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.createError = null;

          const createdEmergency =
            action.payload?.data;

          if (createdEmergency) {
            state.emergencyInformation.unshift(
              createdEmergency
            );
          }

          state.successMessage =
            action.payload?.message ||
            "Emergency information created successfully.";
        }
      )

      .addCase(
        addEmergencyInformation.rejected,
        (state, action) => {
          state.createLoading = false;

          state.createError =
            action.payload ||
            "Failed to create emergency information.";
        }
      );

    // =====================================================
    // UPDATE
    // =====================================================

    builder

      .addCase(
        editEmergencyInformation.pending,
        (state) => {
          state.updateLoading = true;
          state.updateError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        editEmergencyInformation.fulfilled,
        (state, action) => {
          state.updateLoading = false;
          state.updateError = null;

          const updatedEmergency =
            action.payload?.data;

          if (updatedEmergency) {
            const index =
              state.emergencyInformation.findIndex(
                (item) =>
                  item.id === updatedEmergency.id
              );

            if (index !== -1) {
              state.emergencyInformation[index] =
                updatedEmergency;
            } else {
              state.emergencyInformation.unshift(
                updatedEmergency
              );
            }

            if (
              state.currentEmergency?.id ===
              updatedEmergency.id
            ) {
              state.currentEmergency =
                updatedEmergency;
            }
          }

          state.successMessage =
            action.payload?.message ||
            "Emergency information updated successfully.";
        }
      )

      .addCase(
        editEmergencyInformation.rejected,
        (state, action) => {
          state.updateLoading = false;

          state.updateError =
            action.payload ||
            "Failed to update emergency information.";
        }
      );

    // =====================================================
    // DELETE
    // =====================================================

    builder

      .addCase(
        removeEmergencyInformation.pending,
        (state) => {
          state.deleteLoading = true;
          state.deleteError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        removeEmergencyInformation.fulfilled,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError = null;

          const deletedId =
            action.payload?.id;

          state.emergencyInformation =
            state.emergencyInformation.filter(
              (item) =>
                item.id !== deletedId
            );

          if (
            state.currentEmergency?.id ===
            deletedId
          ) {
            state.currentEmergency = null;
          }

          state.successMessage =
            action.payload?.message ||
            "Emergency information deleted successfully.";
        }
      )

      .addCase(
        removeEmergencyInformation.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.deleteError =
            action.payload ||
            "Failed to delete emergency information.";
        }
      );
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearEmergencyError,
  clearFetchByIdError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearEmergencySuccessMessage,
  clearCurrentEmergency,
  resetEmergencyState,
} = emergencySlice.actions;

// =========================================================
// SELECTORS
// =========================================================

export const selectEmergencyInformation = (state) =>
  state.emergency?.emergencyInformation || [];

export const selectCurrentEmergency = (state) =>
  state.emergency?.currentEmergency || null;

export const selectEmergencyLoading = (state) =>
  state.emergency?.loading || false;

export const selectFetchByIdLoading = (state) =>
  state.emergency?.fetchByIdLoading || false;

export const selectCreateEmergencyLoading = (state) =>
  state.emergency?.createLoading || false;

export const selectUpdateEmergencyLoading = (state) =>
  state.emergency?.updateLoading || false;

export const selectDeleteEmergencyLoading = (state) =>
  state.emergency?.deleteLoading || false;

export const selectEmergencyError = (state) =>
  state.emergency?.error || null;

export const selectFetchByIdError = (state) =>
  state.emergency?.fetchByIdError || null;

export const selectCreateEmergencyError = (state) =>
  state.emergency?.createError || null;

export const selectUpdateEmergencyError = (state) =>
  state.emergency?.updateError || null;

export const selectDeleteEmergencyError = (state) =>
  state.emergency?.deleteError || null;

export const selectEmergencySuccessMessage = (state) =>
  state.emergency?.successMessage || null;

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default emergencySlice.reducer;