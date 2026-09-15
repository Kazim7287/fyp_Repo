import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getFAQs,
  getFAQ,
  getFAQStats,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFAQStatus,
  updateFAQFeatured,
} from "../../api/faqApi";

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  faqs: [],
  currentFAQ: null,

  stats: {
    total_faqs: 0,
    published_faqs: 0,
    draft_faqs: 0,
    featured_faqs: 0,
  },

  loading: false,
  statsLoading: false,
  actionLoading: false,

  error: null,
  statsError: null,
};

// =========================================================
// GET ALL FAQs
// =========================================================

export const fetchFAQs = createAsyncThunk(
  "faqs/fetchFAQs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getFAQs(params);

      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch FAQs."
      );
    }
  }
);

// =========================================================
// GET SINGLE FAQ
// =========================================================

export const fetchFAQ = createAsyncThunk(
  "faqs/fetchFAQ",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getFAQ(id);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch FAQ."
      );
    }
  }
);

// =========================================================
// GET FAQ STATS
// =========================================================

export const fetchFAQStats = createAsyncThunk(
  "faqs/fetchFAQStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFAQStats();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch FAQ statistics."
      );
    }
  }
);

// =========================================================
// CREATE FAQ
// =========================================================

export const addFAQ = createAsyncThunk(
  "faqs/addFAQ",
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await createFAQ(faqData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create FAQ."
      );
    }
  }
);

// =========================================================
// UPDATE FAQ
// =========================================================

export const editFAQ = createAsyncThunk(
  "faqs/editFAQ",
  async ({ id, faqData }, { rejectWithValue }) => {
    try {
      const response = await updateFAQ(id, faqData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update FAQ."
      );
    }
  }
);

// =========================================================
// DELETE FAQ
// =========================================================

export const removeFAQ = createAsyncThunk(
  "faqs/removeFAQ",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteFAQ(id);

      return {
        id,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete FAQ."
      );
    }
  }
);

// =========================================================
// UPDATE FAQ STATUS
// =========================================================

export const changeFAQStatus = createAsyncThunk(
  "faqs/changeFAQStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateFAQStatus(id, status);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update FAQ status."
      );
    }
  }
);

// =========================================================
// UPDATE FAQ FEATURED
// =========================================================

export const changeFAQFeatured = createAsyncThunk(
  "faqs/changeFAQFeatured",
  async ({ id, featured }, { rejectWithValue }) => {
    try {
      const response = await updateFAQFeatured(id, featured);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update FAQ featured status."
      );
    }
  }
);

// =========================================================
// SLICE
// =========================================================

const faqSlice = createSlice({
  name: "faqs",

  initialState,

  reducers: {
    clearFAQError: (state) => {
      state.error = null;
    },

    clearFAQStatsError: (state) => {
      state.statsError = null;
    },

    clearCurrentFAQ: (state) => {
      state.currentFAQ = null;
    },
  },

  extraReducers: (builder) => {
    // =====================================================
    // FETCH FAQs
    // =====================================================

    builder
      .addCase(fetchFAQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
      })

      .addCase(fetchFAQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // =====================================================
    // FETCH SINGLE FAQ
    // =====================================================

    builder
      .addCase(fetchFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFAQ = action.payload;
      })

      .addCase(fetchFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // =====================================================
    // FETCH STATS
    // =====================================================

    builder
      .addCase(fetchFAQStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })

      .addCase(fetchFAQStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = {
          total_faqs: Number(action.payload?.total_faqs || 0),
          published_faqs: Number(action.payload?.published_faqs || 0),
          draft_faqs: Number(action.payload?.draft_faqs || 0),
          featured_faqs: Number(action.payload?.featured_faqs || 0),
        };
      })

      .addCase(fetchFAQStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });

    // =====================================================
    // CREATE FAQ
    // =====================================================

    builder
      .addCase(addFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;

        if (action.payload) {
          state.faqs.push(action.payload);
        }
      })

      .addCase(addFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // =====================================================
    // UPDATE FAQ
    // =====================================================

    builder
      .addCase(editFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(editFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedFAQ = action.payload;

        const index = state.faqs.findIndex(
          (faq) => Number(faq.id) === Number(updatedFAQ.id)
        );

        if (index !== -1) {
          state.faqs[index] = updatedFAQ;
        }

        if (
          state.currentFAQ &&
          Number(state.currentFAQ.id) === Number(updatedFAQ.id)
        ) {
          state.currentFAQ = updatedFAQ;
        }
      })

      .addCase(editFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // =====================================================
    // DELETE FAQ
    // =====================================================

    builder
      .addCase(removeFAQ.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeFAQ.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.faqs = state.faqs.filter(
          (faq) => Number(faq.id) !== Number(action.payload.id)
        );

        if (
          state.currentFAQ &&
          Number(state.currentFAQ.id) === Number(action.payload.id)
        ) {
          state.currentFAQ = null;
        }
      })

      .addCase(removeFAQ.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // =====================================================
    // CHANGE STATUS
    // =====================================================

    builder
      .addCase(changeFAQStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(changeFAQStatus.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedFAQ = action.payload;

        const index = state.faqs.findIndex(
          (faq) => Number(faq.id) === Number(updatedFAQ.id)
        );

        if (index !== -1) {
          state.faqs[index] = updatedFAQ;
        }

        if (
          state.currentFAQ &&
          Number(state.currentFAQ.id) === Number(updatedFAQ.id)
        ) {
          state.currentFAQ = updatedFAQ;
        }
      })

      .addCase(changeFAQStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // =====================================================
    // CHANGE FEATURED
    // =====================================================

    builder
      .addCase(changeFAQFeatured.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(changeFAQFeatured.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedFAQ = action.payload;

        const index = state.faqs.findIndex(
          (faq) => Number(faq.id) === Number(updatedFAQ.id)
        );

        if (index !== -1) {
          state.faqs[index] = updatedFAQ;
        }

        if (
          state.currentFAQ &&
          Number(state.currentFAQ.id) === Number(updatedFAQ.id)
        ) {
          state.currentFAQ = updatedFAQ;
        }
      })

      .addCase(changeFAQFeatured.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// SELECTORS
// =========================================================

export const selectFAQs = (state) => state.faqs.faqs;

export const selectCurrentFAQ = (state) => state.faqs.currentFAQ;

export const selectFAQStats = (state) => state.faqs.stats;

export const selectFAQLoading = (state) => state.faqs.loading;

export const selectFAQStatsLoading = (state) =>
  state.faqs.statsLoading;

export const selectFAQActionLoading = (state) =>
  state.faqs.actionLoading;

export const selectFAQError = (state) => state.faqs.error;

export const selectFAQStatsError = (state) =>
  state.faqs.statsError;

// =========================================================
// EXPORT ACTIONS
// =========================================================

export const {
  clearFAQError,
  clearFAQStatsError,
  clearCurrentFAQ,
} = faqSlice.actions;

export default faqSlice.reducer;