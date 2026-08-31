
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| FETCH COMPONENTS
|--------------------------------------------------------------------------
*/

export const fetchComponents = createAsyncThunk(
  "components/fetchComponents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/components`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch components"
        );
      }

      return data.components || [];
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to connect to server"
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADD COMPONENT
|--------------------------------------------------------------------------
*/

export const addComponent = createAsyncThunk(
  "components/addComponent",
  async (componentData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/components`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(componentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to add component"
        );
      }

      return data.component;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to connect to server"
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| EDIT COMPONENT
|--------------------------------------------------------------------------
*/

export const editComponent = createAsyncThunk(
  "components/editComponent",
  async (
    { id, componentData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/components/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(componentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to update component"
        );
      }

      return data.component;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to connect to server"
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| REMOVE COMPONENT
|--------------------------------------------------------------------------
*/

export const removeComponent = createAsyncThunk(
  "components/removeComponent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/components/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to delete component"
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to connect to server"
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
  components: [],
  loading: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

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

      /*
      |----------------------------------------------------------------------
      | FETCH
      |----------------------------------------------------------------------
      */

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
          state.components = action.payload;
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

      /*
      |----------------------------------------------------------------------
      | ADD
      |----------------------------------------------------------------------
      */

      .addCase(
        addComponent.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        addComponent.fulfilled,
        (state, action) => {
          state.loading = false;

          if (action.payload) {
            state.components.unshift(
              action.payload
            );
          }
        }
      )

      .addCase(
        addComponent.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to add component";
        }
      )

      /*
      |----------------------------------------------------------------------
      | EDIT
      |----------------------------------------------------------------------
      */

      .addCase(
        editComponent.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        editComponent.fulfilled,
        (state, action) => {
          state.loading = false;

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
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to update component";
        }
      )

      /*
      |----------------------------------------------------------------------
      | DELETE
      |----------------------------------------------------------------------
      */

      .addCase(
        removeComponent.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        removeComponent.fulfilled,
        (state, action) => {
          state.loading = false;

          state.components =
            state.components.filter(
              (component) =>
                component.id !== action.payload
            );
        }
      )

      .addCase(
        removeComponent.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to delete component";
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
  clearComponentError,
} = componentSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectComponents = (state) =>
  state.components?.components || [];

export const selectComponentsLoading = (state) =>
  state.components?.loading || false;

/*
|--------------------------------------------------------------------------
| THIS WAS MISSING
|--------------------------------------------------------------------------
*/

export const selectComponentsError = (state) =>
  state.components?.error || null;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default componentSlice.reducer;
