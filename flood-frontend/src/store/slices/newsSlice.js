
import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getNewsApi,
  getNewsApiById,
  getNewsStatsApi,
  createNewsApi,
  updateNewsApi,
  deleteNewsApi,
  updateNewsStatusApi,
  updateNewsFeaturedApi,
} from "../../api/newsApi";

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  news: [],
  selectedNews: null,

  stats: {
    total_news: 0,
    published_news: 0,
    draft_news: 0,
    featured_news: 0,
  },

  loading: false,
  statsLoading: false,
  mutationLoading: false,

  error: null,
  statsError: null,
  mutationError: null,

  successMessage: null,
};

// =========================================================
// FETCH ALL NEWS
// =========================================================

export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (params = {}, thunkAPI) => {
    try {
      return await getNewsApi(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch news."
      );
    }
  }
);

// =========================================================
// FETCH SINGLE NEWS
// =========================================================

export const fetchNewsById = createAsyncThunk(
  "news/fetchNewsById",
  async (id, thunkAPI) => {
    try {
      return await getNewsApiById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch news item."
      );
    }
  }
);

// =========================================================
// FETCH NEWS STATISTICS
// =========================================================

export const fetchNewsStats = createAsyncThunk(
  "news/fetchNewsStats",
  async (_, thunkAPI) => {
    try {
      return await getNewsStatsApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch news statistics."
      );
    }
  }
);

// =========================================================
// CREATE NEWS
// =========================================================

export const createNews = createAsyncThunk(
  "news/createNews",
  async (newsData, thunkAPI) => {
    try {
      return await createNewsApi(newsData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create news."
      );
    }
  }
);

// =========================================================
// UPDATE NEWS
// =========================================================

export const updateNews = createAsyncThunk(
  "news/updateNews",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateNewsApi(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update news."
      );
    }
  }
);

// =========================================================
// DELETE NEWS
// =========================================================

export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (id, thunkAPI) => {
    try {
      await deleteNewsApi(id);

      return {
        id,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete news."
      );
    }
  }
);

// =========================================================
// UPDATE NEWS STATUS
// =========================================================

export const updateNewsStatus = createAsyncThunk(
  "news/updateNewsStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await updateNewsStatusApi(
        id,
        status
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update news status."
      );
    }
  }
);

// =========================================================
// UPDATE NEWS FEATURED
// =========================================================

export const updateNewsFeatured =
  createAsyncThunk(
    "news/updateNewsFeatured",
    async ({ id, featured }, thunkAPI) => {
      try {
        return await updateNewsFeaturedApi(
          id,
          featured
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update featured status."
        );
      }
    }
  );

// =========================================================
// HELPER — REPLACE ITEM
// =========================================================

const replaceNewsItem = (news, updatedItem) => {
  if (!updatedItem?.id) {
    return news;
  }

  return news.map((item) =>
    String(item.id) === String(updatedItem.id)
      ? updatedItem
      : item
  );
};

// =========================================================
// SLICE
// =========================================================

const newsSlice = createSlice({
  name: "news",

  initialState,

  reducers: {
    clearNewsError: (state) => {
      state.error = null;
    },

    clearNewsStatsError: (state) => {
      state.statsError = null;
    },

    clearNewsMutationError: (state) => {
      state.mutationError = null;
    },

    clearNewsSuccessMessage: (state) => {
      state.successMessage = null;
    },

    clearSelectedNews: (state) => {
      state.selectedNews = null;
    },

    resetNewsState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // =====================================================
    // FETCH ALL NEWS
    // =====================================================

    builder
      .addCase(
        fetchNews.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchNews.fulfilled,
        (state, action) => {
          state.loading = false;

          const payload = action.payload;

          if (Array.isArray(payload)) {
            state.news = payload;
          } else if (
            payload &&
            Array.isArray(payload.news)
          ) {
            state.news = payload.news;
          } else {
            state.news = [];
          }
        }
      )

      .addCase(
        fetchNews.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch news.";
        }
      );

    // =====================================================
    // FETCH SINGLE NEWS
    // =====================================================

    builder
      .addCase(
        fetchNewsById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchNewsById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedNews =
            action.payload;
        }
      )

      .addCase(
        fetchNewsById.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch news item.";
        }
      );

    // =====================================================
    // FETCH STATISTICS
    // =====================================================

    builder
      .addCase(
        fetchNewsStats.pending,
        (state) => {
          state.statsLoading = true;
          state.statsError = null;
        }
      )

      .addCase(
        fetchNewsStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;

          state.stats = {
            ...state.stats,
            ...(action.payload || {}),
          };
        }
      )

      .addCase(
        fetchNewsStats.rejected,
        (state, action) => {
          state.statsLoading = false;
          state.statsError =
            action.payload ||
            "Failed to fetch news statistics.";
        }
      );

    // =====================================================
    // CREATE NEWS
    // =====================================================

    builder
      .addCase(
        createNews.pending,
        (state) => {
          state.mutationLoading = true;
          state.mutationError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        createNews.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          if (action.payload) {
            state.news.unshift(
              action.payload
            );
          }

          state.successMessage =
            "News created successfully.";
        }
      )

      .addCase(
        createNews.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.mutationError =
            action.payload ||
            "Failed to create news.";
        }
      );

    // =====================================================
    // UPDATE NEWS
    // =====================================================

    builder
      .addCase(
        updateNews.pending,
        (state) => {
          state.mutationLoading = true;
          state.mutationError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        updateNews.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          state.news = replaceNewsItem(
            state.news,
            action.payload
          );

          if (
            state.selectedNews?.id ===
            action.payload?.id
          ) {
            state.selectedNews =
              action.payload;
          }

          state.successMessage =
            "News updated successfully.";
        }
      )

      .addCase(
        updateNews.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.mutationError =
            action.payload ||
            "Failed to update news.";
        }
      );

    // =====================================================
    // DELETE NEWS
    // =====================================================

    builder
      .addCase(
        deleteNews.pending,
        (state) => {
          state.mutationLoading = true;
          state.mutationError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        deleteNews.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          state.news =
            state.news.filter(
              (item) =>
                String(item.id) !==
                String(action.payload.id)
            );

          if (
            state.selectedNews &&
            String(state.selectedNews.id) ===
              String(action.payload.id)
          ) {
            state.selectedNews = null;
          }

          state.successMessage =
            "News deleted successfully.";
        }
      )

      .addCase(
        deleteNews.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.mutationError =
            action.payload ||
            "Failed to delete news.";
        }
      );

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    builder
      .addCase(
        updateNewsStatus.pending,
        (state) => {
          state.mutationLoading = true;
          state.mutationError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        updateNewsStatus.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          state.news = replaceNewsItem(
            state.news,
            action.payload
          );

          if (
            state.selectedNews?.id ===
            action.payload?.id
          ) {
            state.selectedNews =
              action.payload;
          }

          state.successMessage =
            "News status updated successfully.";
        }
      )

      .addCase(
        updateNewsStatus.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.mutationError =
            action.payload ||
            "Failed to update news status.";
        }
      );

    // =====================================================
    // UPDATE FEATURED
    // =====================================================

    builder
      .addCase(
        updateNewsFeatured.pending,
        (state) => {
          state.mutationLoading = true;
          state.mutationError = null;
          state.successMessage = null;
        }
      )

      .addCase(
        updateNewsFeatured.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          state.news = replaceNewsItem(
            state.news,
            action.payload
          );

          if (
            state.selectedNews?.id ===
            action.payload?.id
          ) {
            state.selectedNews =
              action.payload;
          }

          state.successMessage =
            "Featured status updated successfully.";
        }
      )

      .addCase(
        updateNewsFeatured.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.mutationError =
            action.payload ||
            "Failed to update featured status.";
        }
      );
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearNewsError,
  clearNewsStatsError,
  clearNewsMutationError,
  clearNewsSuccessMessage,
  clearSelectedNews,
  resetNewsState,
} = newsSlice.actions;

// =========================================================
// SELECTORS
// =========================================================

export const selectNews = (state) =>
  state.news?.news || [];

export const selectSelectedNews = (state) =>
  state.news?.selectedNews || null;

export const selectNewsStats = (state) =>
  state.news?.stats || {
    total_news: 0,
    published_news: 0,
    draft_news: 0,
    featured_news: 0,
  };

export const selectNewsLoading = (state) =>
  state.news?.loading || false;

export const selectNewsStatsLoading = (
  state
) => state.news?.statsLoading || false;

export const selectNewsMutationLoading = (
  state
) => state.news?.mutationLoading || false;

export const selectNewsError = (state) =>
  state.news?.error || null;

export const selectNewsStatsError = (
  state
) => state.news?.statsError || null;

export const selectNewsMutationError = (
  state
) => state.news?.mutationError || null;

export const selectNewsSuccessMessage = (
  state
) => state.news?.successMessage || null;

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default newsSlice.reducer;