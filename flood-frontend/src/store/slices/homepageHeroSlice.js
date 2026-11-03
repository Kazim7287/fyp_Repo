
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import homepageHeroApi from "../../api/homepageHeroApi";

// ERROR HANDLER
const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// GET HOMEPAGE HERO
export const fetchHomepageHero = createAsyncThunk(
  "homepageHero/fetchHomepageHero",
  async (_, { rejectWithValue }) => {
    try {
      return await homepageHeroApi.getHomepageHero();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch homepage hero")
      );
    }
  }
);

// SAVE HOMEPAGE HERO
export const saveHomepageHero = createAsyncThunk(
  "homepageHero/saveHomepageHero",
  async (heroData, { rejectWithValue }) => {
    try {
      return await homepageHeroApi.saveHomepageHero(heroData);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to save homepage hero")
      );
    }
  }
);

// PUBLISH HOMEPAGE HERO
export const publishHomepageHero = createAsyncThunk(
  "homepageHero/publishHomepageHero",
  async (_, { rejectWithValue }) => {
    try {
      return await homepageHeroApi.publishHomepageHero();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to publish homepage hero")
      );
    }
  }
);

// INITIAL STATE
const initialState = {
  hero: null,

  loading: false,
  saving: false,
  publishing: false,

  error: null,
};

// HOMEPAGE HERO SLICE
const homepageHeroSlice = createSlice({
  name: "homepageHero",
  initialState,

  reducers: {
    clearHomepageHeroError: (state) => {
      state.error = null;
    },

    resetHomepageHeroState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // FETCH HOMEPAGE HERO
      .addCase(fetchHomepageHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomepageHero.fulfilled, (state, action) => {
        state.loading = false;
        state.hero = action.payload?.hero || null;
      })
      .addCase(fetchHomepageHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SAVE HOMEPAGE HERO
      .addCase(saveHomepageHero.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveHomepageHero.fulfilled, (state, action) => {
        state.saving = false;
        state.hero = action.payload?.hero || state.hero;
      })
      .addCase(saveHomepageHero.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // PUBLISH HOMEPAGE HERO
      .addCase(publishHomepageHero.pending, (state) => {
        state.publishing = true;
        state.error = null;
      })
      .addCase(publishHomepageHero.fulfilled, (state, action) => {
        state.publishing = false;
        state.hero = action.payload?.hero || state.hero;
      })
      .addCase(publishHomepageHero.rejected, (state, action) => {
        state.publishing = false;
        state.error = action.payload;
      });
  },
});

// ACTIONS
export const {
  clearHomepageHeroError,
  resetHomepageHeroState,
} = homepageHeroSlice.actions;

// SELECTORS
export const selectHomepageHero = (state) => state.homepageHero.hero;
export const selectHomepageHeroLoading = (state) =>
  state.homepageHero.loading;
export const selectHomepageHeroSaving = (state) =>
  state.homepageHero.saving;
export const selectHomepageHeroPublishing = (state) =>
  state.homepageHero.publishing;
export const selectHomepageHeroError = (state) =>
  state.homepageHero.error;

export default homepageHeroSlice.reducer;
