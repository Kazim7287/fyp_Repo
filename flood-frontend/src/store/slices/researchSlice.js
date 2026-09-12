import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getResearch,
  getResearchById,
  getResearchStats,
  createResearch,
  uploadResearchPdf,
  updateResearch,
  deleteResearch,
  toggleResearchStatus,
} from "../../api/researchApi";

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  research: [],
  currentResearch: null,

  stats: {
    total: 0,
    published: 0,
    drafts: 0,
    ai: 0,
  },

  loading: false,
  statsLoading: false,
  submitting: false,
  deleting: false,
  pdfUploading: false,

  error: null,
  statsError: null,
};

// =========================================================
// FETCH ALL RESEARCH
// =========================================================

export const fetchResearch = createAsyncThunk(
  "research/fetchResearch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getResearch(params);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch research."
      );
    }
  }
);

// =========================================================
// FETCH SINGLE RESEARCH
// =========================================================

export const fetchResearchById = createAsyncThunk(
  "research/fetchResearchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getResearchById(id);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch research."
      );
    }
  }
);

// =========================================================
// FETCH RESEARCH STATS
// =========================================================

export const fetchResearchStats = createAsyncThunk(
  "research/fetchResearchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getResearchStats();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch research statistics."
      );
    }
  }
);

// =========================================================
// CREATE RESEARCH
// =========================================================

export const addResearch = createAsyncThunk(
  "research/addResearch",
  async (researchData, { rejectWithValue }) => {
    try {
      const response = await createResearch(researchData);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create research."
      );
    }
  }
);

// =========================================================
// UPLOAD PDF
// =========================================================

export const addResearchPdf = createAsyncThunk(
  "research/addResearchPdf",
  async (
    { researchId, pdfFile },
    { rejectWithValue }
  ) => {
    try {
      const response = await uploadResearchPdf(
        researchId,
        pdfFile
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload research PDF."
      );
    }
  }
);

// =========================================================
// UPDATE RESEARCH
// =========================================================

export const editResearch = createAsyncThunk(
  "research/editResearch",
  async (
    { id, researchData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateResearch(
        id,
        researchData
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update research."
      );
    }
  }
);

// =========================================================
// DELETE RESEARCH
// =========================================================

export const removeResearch = createAsyncThunk(
  "research/removeResearch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteResearch(id);

      return {
        id,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete research."
      );
    }
  }
);

// =========================================================
// TOGGLE STATUS
// =========================================================

export const changeResearchStatus = createAsyncThunk(
  "research/changeResearchStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response =
        await toggleResearchStatus(id);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to change research status."
      );
    }
  }
);

// =========================================================
// SLICE
// =========================================================

const researchSlice = createSlice({
  name: "research",

  initialState,

  reducers: {
    clearResearchError: (state) => {
      state.error = null;
    },

    clearResearchStatsError: (state) => {
      state.statsError = null;
    },

    clearCurrentResearch: (state) => {
      state.currentResearch = null;
    },

    resetResearchState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // =====================================================
    // FETCH RESEARCH
    // =====================================================

    builder
      .addCase(fetchResearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchResearch.fulfilled,
        (state, action) => {
          state.loading = false;

          state.research =
            action.payload?.data || [];
        }
      )

      .addCase(
        fetchResearch.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch research.";
        }
      );

    // =====================================================
    // FETCH SINGLE RESEARCH
    // =====================================================

    builder
      .addCase(
        fetchResearchById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchResearchById.fulfilled,
        (state, action) => {
          state.loading = false;

          state.currentResearch =
            action.payload?.data || null;
        }
      )

      .addCase(
        fetchResearchById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch research.";
        }
      );

    // =====================================================
    // FETCH STATS
    // =====================================================

    builder
      .addCase(
        fetchResearchStats.pending,
        (state) => {
          state.statsLoading = true;
          state.statsError = null;
        }
      )

      .addCase(
        fetchResearchStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;

          const data =
            action.payload?.data || {};

         state.stats = {
  total:
    Number(data.total_research ?? 0),

  published:
    Number(data.published_research ?? 0),

  drafts:
    Number(data.draft_research ?? 0),

  ai:
    Number(data.ai_research ?? 0),
};
        }
      )

      .addCase(
        fetchResearchStats.rejected,
        (state, action) => {
          state.statsLoading = false;

          state.statsError =
            action.payload ||
            "Failed to fetch research statistics.";
        }
      );

    // =====================================================
    // CREATE RESEARCH
    // =====================================================

    builder
      .addCase(
        addResearch.pending,
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )

      .addCase(
        addResearch.fulfilled,
        (state, action) => {
          state.submitting = false;

          const newResearch =
            action.payload?.data;

          if (newResearch) {
            state.research.unshift(
              newResearch
            );
          }
        }
      )

      .addCase(
        addResearch.rejected,
        (state, action) => {
          state.submitting = false;

          state.error =
            action.payload ||
            "Failed to create research.";
        }
      );

    // =====================================================
    // UPLOAD PDF
    // =====================================================

    builder
      .addCase(
        addResearchPdf.pending,
        (state) => {
          state.pdfUploading = true;
          state.error = null;
        }
      )

      .addCase(
        addResearchPdf.fulfilled,
        (state, action) => {
          state.pdfUploading = false;

          const updatedResearch =
            action.payload?.data;

          if (!updatedResearch) {
            return;
          }

          const index =
            state.research.findIndex(
              (item) =>
                Number(item.id) ===
                Number(updatedResearch.id)
            );

          if (index !== -1) {
            state.research[index] =
              updatedResearch;
          }

          if (
            state.currentResearch &&
            Number(
              state.currentResearch.id
            ) === Number(updatedResearch.id)
          ) {
            state.currentResearch =
              updatedResearch;
          }
        }
      )

      .addCase(
        addResearchPdf.rejected,
        (state, action) => {
          state.pdfUploading = false;

          state.error =
            action.payload ||
            "Failed to upload research PDF.";
        }
      );

    // =====================================================
    // UPDATE RESEARCH
    // =====================================================

    builder
      .addCase(
        editResearch.pending,
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )

      .addCase(
        editResearch.fulfilled,
        (state, action) => {
          state.submitting = false;

          const updatedResearch =
            action.payload?.data;

          if (!updatedResearch) {
            return;
          }

          const index =
            state.research.findIndex(
              (item) =>
                Number(item.id) ===
                Number(updatedResearch.id)
            );

          if (index !== -1) {
            state.research[index] =
              updatedResearch;
          }

          if (
            state.currentResearch &&
            Number(
              state.currentResearch.id
            ) === Number(updatedResearch.id)
          ) {
            state.currentResearch =
              updatedResearch;
          }
        }
      )

      .addCase(
        editResearch.rejected,
        (state, action) => {
          state.submitting = false;

          state.error =
            action.payload ||
            "Failed to update research.";
        }
      );

    // =====================================================
    // DELETE RESEARCH
    // =====================================================

    builder
      .addCase(
        removeResearch.pending,
        (state) => {
          state.deleting = true;
          state.error = null;
        }
      )

      .addCase(
        removeResearch.fulfilled,
        (state, action) => {
          state.deleting = false;

          const deletedId =
            action.payload.id;

          state.research =
            state.research.filter(
              (item) =>
                Number(item.id) !==
                Number(deletedId)
            );

          if (
            state.currentResearch &&
            Number(
              state.currentResearch.id
            ) === Number(deletedId)
          ) {
            state.currentResearch = null;
          }
        }
      )

      .addCase(
        removeResearch.rejected,
        (state, action) => {
          state.deleting = false;

          state.error =
            action.payload ||
            "Failed to delete research.";
        }
      );

    // =====================================================
    // TOGGLE STATUS
    // =====================================================

    builder
      .addCase(
        changeResearchStatus.pending,
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )

      .addCase(
        changeResearchStatus.fulfilled,
        (state, action) => {
          state.submitting = false;

          const updatedResearch =
            action.payload?.data;

          if (!updatedResearch) {
            return;
          }

          const index =
            state.research.findIndex(
              (item) =>
                Number(item.id) ===
                Number(updatedResearch.id)
            );

          if (index !== -1) {
            state.research[index] =
              updatedResearch;
          }

          if (
            state.currentResearch &&
            Number(
              state.currentResearch.id
            ) === Number(updatedResearch.id)
          ) {
            state.currentResearch =
              updatedResearch;
          }
        }
      )

      .addCase(
        changeResearchStatus.rejected,
        (state, action) => {
          state.submitting = false;

          state.error =
            action.payload ||
            "Failed to change research status.";
        }
      );
  },
});

// =========================================================
// SELECTORS
// =========================================================

export const selectResearch =
  (state) =>
    state.research?.research || [];

export const selectCurrentResearch =
  (state) =>
    state.research?.currentResearch || null;

export const selectResearchStats =
  (state) =>
    state.research?.stats || {
      total: 0,
      published: 0,
      drafts: 0,
      ai: 0,
    };

export const selectResearchLoading =
  (state) =>
    state.research?.loading || false;

export const selectResearchStatsLoading =
  (state) =>
    state.research?.statsLoading || false;

export const selectResearchSubmitting =
  (state) =>
    state.research?.submitting || false;

export const selectResearchPdfUploading =
  (state) =>
    state.research?.pdfUploading || false;

export const selectResearchDeleting =
  (state) =>
    state.research?.deleting || false;

export const selectResearchError =
  (state) =>
    state.research?.error || null;

export const selectResearchStatsError =
  (state) =>
    state.research?.statsError || null;

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearResearchError,
  clearResearchStatsError,
  clearCurrentResearch,
  resetResearchState,
} = researchSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default researchSlice.reducer;