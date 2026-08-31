
import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
} from "../../api/componentsApi";

// =========================================================
// GET ALL COMPONENTS
// =========================================================

export const fetchComponents = createAsyncThunk(
  "components/fetchComponents",

  async (_, { rejectWithValue }) => {
    try {
      const result = await getComponents();

      if (!result.success) {
        return rejectWithValue(
          result.message ||
            "Failed to fetch components"
        );
      }

      return result.components || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch components"
      );
    }
  }
);

// =========================================================
// CREATE COMPONENT
// =========================================================

export const addComponent = createAsyncThunk(
  "components/addComponent",

  async (componentData, { rejectWithValue }) => {
    try {
      const result = await createComponent(
        componentData
      );

      if (!result.success) {
        return rejectWithValue(
          result.message ||
            "Failed to create component"
        );
      }

      return result.component;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create component"
      );
    }
  }
);

// =========================================================
// UPDATE COMPONENT
// =========================================================

export const editComponent = createAsyncThunk(
  "components/editComponent",

  async (
    { id, componentData },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateComponent(
        id,
        componentData
      );

      if (!result.success) {
        return rejectWithValue(
          result.message ||
            "Failed to update component"
        );
      }

      return result.component;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update component"
      );
    }
  }
);

// =========================================================
// DELETE COMPONENT
// =========================================================

export const removeComponent = createAsyncThunk(
  "components/removeComponent",

  async (id, { rejectWithValue }) => {
    try {
      const result = await deleteComponent(id);

      if (!result.success) {
        return rejectWithValue(
          result.message ||
            "Failed to delete component"
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete component"
      );
    }
  }
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  components: [],
  loading: false,
  actionLoading: false,
  error: null,
};

// =========================================================
// SLICE
// =========================================================

const componentSlice = createSlice({
  name: "components",

  initialState,

  reducers: {
    clearComponentError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===================================================
      // FETCH COMPONENTS
      // ===================================================

      .addCase(
        fetchComponents.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchComponents.fulfilled,
        (state, action) => {
          state.loading = false;
          state.components =
            action.payload || [];
        }
      )

      .addCase(
        fetchComponents.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch components";
        }
      )

      // ===================================================
      // ADD COMPONENT
      // ===================================================

      .addCase(
        addComponent.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        addComponent.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          state.components.unshift(
            action.payload
          );
        }
      )

      .addCase(
        addComponent.rejected,
        (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            "Failed to create component";
        }
      )

      // ===================================================
      // UPDATE COMPONENT
      // ===================================================

      .addCase(
        editComponent.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        editComponent.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          const updatedComponent =
            action.payload;

          const index =
            state.components.findIndex(
              (component) =>
                component.id ===
                updatedComponent.id
            );

          if (index !== -1) {
            state.components[index] =
              updatedComponent;
          }
        }
      )

      .addCase(
        editComponent.rejected,
        (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            "Failed to update component";
        }
      )

      // ===================================================
      // DELETE COMPONENT
      // ===================================================

      .addCase(
        removeComponent.pending,
        (state) => {
          state.actionLoading = true;
          state.error = null;
        }
      )

      .addCase(
        removeComponent.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          state.components =
            state.components.filter(
              (component) =>
                component.id !==
                action.payload
            );
        }
      )

      .addCase(
        removeComponent.rejected,
        (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            "Failed to delete component";
        }
      );
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearComponentError,
} = componentSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default componentSlice.reducer;
