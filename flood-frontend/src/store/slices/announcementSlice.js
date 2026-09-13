import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAnnouncementsApi,
  getAnnouncementApi,
  getAnnouncementStatsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
  updateAnnouncementStatusApi,
  extractAnnouncements,
  extractAnnouncement,
  extractAnnouncementStats,
} from "../../api/announcementApi";

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  announcements: [],

  selectedAnnouncement: null,

  stats: {
    total_announcements: 0,
    published_announcements: 0,
    draft_announcements: 0,
    archived_announcements: 0,
    high_priority_announcements: 0,
    critical_announcements: 0,
  },

  loading: false,
  statsLoading: false,
  detailsLoading: false,
  mutationLoading: false,

  error: null,
  statsError: null,
  detailsError: null,
};

/*
|--------------------------------------------------------------------------
| FETCH ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response =
        await getAnnouncementsApi(filters);

      return extractAnnouncements(response);
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch announcements."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| FETCH SINGLE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const fetchAnnouncementById = createAsyncThunk(
  "announcements/fetchAnnouncementById",
  async (id, { rejectWithValue }) => {
    try {
      const response =
        await getAnnouncementApi(id);

      return extractAnnouncement(response);
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch announcement."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| FETCH ANNOUNCEMENT STATISTICS
|--------------------------------------------------------------------------
*/

export const fetchAnnouncementStats = createAsyncThunk(
  "announcements/fetchAnnouncementStats",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getAnnouncementStatsApi();

      return extractAnnouncementStats(
        response
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch announcement statistics."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (
    announcementData,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await createAnnouncementApi(
          announcementData
        );

      return extractAnnouncement(
        response
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to create announcement."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async (
    { id, announcementData },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await updateAnnouncementApi(
          id,
          announcementData
        );

      return extractAnnouncement(
        response
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to update announcement."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAnnouncementApi(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to delete announcement."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE ANNOUNCEMENT STATUS
|--------------------------------------------------------------------------
*/

export const updateAnnouncementStatus = createAsyncThunk(
  "announcements/updateAnnouncementStatus",
  async (
    { id, status },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await updateAnnouncementStatusApi(
          id,
          status
        );

      return extractAnnouncement(
        response
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to update announcement status."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const announcementSlice = createSlice({
  name: "announcements",

  initialState,

  reducers: {
    clearAnnouncementError: (state) => {
      state.error = null;
    },

    clearAnnouncementStatsError: (state) => {
      state.statsError = null;
    },

    clearAnnouncementDetailsError: (
      state
    ) => {
      state.detailsError = null;
    },

    clearSelectedAnnouncement: (
      state
    ) => {
      state.selectedAnnouncement = null;
    },

    setSelectedAnnouncement: (
      state,
      action
    ) => {
      state.selectedAnnouncement =
        action.payload;
    },

    resetAnnouncementState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | FETCH ALL
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        fetchAnnouncements.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAnnouncements.fulfilled,
        (state, action) => {
          state.loading = false;
          state.announcements =
            action.payload || [];
        }
      )

      .addCase(
        fetchAnnouncements.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch announcements.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH SINGLE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        fetchAnnouncementById.pending,
        (state) => {
          state.detailsLoading = true;
          state.detailsError = null;
        }
      )

      .addCase(
        fetchAnnouncementById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;
          state.selectedAnnouncement =
            action.payload;
        }
      )

      .addCase(
        fetchAnnouncementById.rejected,
        (state, action) => {
          state.detailsLoading = false;
          state.detailsError =
            action.payload ||
            "Failed to fetch announcement.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH STATS
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        fetchAnnouncementStats.pending,
        (state) => {
          state.statsLoading = true;
          state.statsError = null;
        }
      )

      .addCase(
        fetchAnnouncementStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;

          state.stats = {
            ...state.stats,
            ...(action.payload || {}),
          };
        }
      )

      .addCase(
        fetchAnnouncementStats.rejected,
        (state, action) => {
          state.statsLoading = false;
          state.statsError =
            action.payload ||
            "Failed to fetch announcement statistics.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        createAnnouncement.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        createAnnouncement.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          if (action.payload) {
            state.announcements.unshift(
              action.payload
            );
          }
        }
      )

      .addCase(
        createAnnouncement.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to create announcement.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        updateAnnouncement.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateAnnouncement.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          const updated =
            action.payload;

          if (!updated) {
            return;
          }

          const index =
            state.announcements.findIndex(
              (announcement) =>
                String(
                  announcement.id
                ) ===
                String(updated.id)
            );

          if (index !== -1) {
            state.announcements[index] =
              updated;
          }

          if (
            state.selectedAnnouncement &&
            String(
              state.selectedAnnouncement.id
            ) === String(updated.id)
          ) {
            state.selectedAnnouncement =
              updated;
          }
        }
      )

      .addCase(
        updateAnnouncement.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to update announcement.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        deleteAnnouncement.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteAnnouncement.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          state.announcements =
            state.announcements.filter(
              (announcement) =>
                String(
                  announcement.id
                ) !==
                String(action.payload)
            );

          if (
            state.selectedAnnouncement &&
            String(
              state.selectedAnnouncement.id
            ) ===
              String(action.payload)
          ) {
            state.selectedAnnouncement =
              null;
          }
        }
      )

      .addCase(
        deleteAnnouncement.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to delete announcement.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        updateAnnouncementStatus.pending,
        (state) => {
          state.mutationLoading = true;
          state.error = null;
        }
      )

      .addCase(
        updateAnnouncementStatus.fulfilled,
        (state, action) => {
          state.mutationLoading = false;

          const updated =
            action.payload;

          if (!updated) {
            return;
          }

          const index =
            state.announcements.findIndex(
              (announcement) =>
                String(
                  announcement.id
                ) ===
                String(updated.id)
            );

          if (index !== -1) {
            state.announcements[index] =
              updated;
          }

          if (
            state.selectedAnnouncement &&
            String(
              state.selectedAnnouncement.id
            ) === String(updated.id)
          ) {
            state.selectedAnnouncement =
              updated;
          }
        }
      )

      .addCase(
        updateAnnouncementStatus.rejected,
        (state, action) => {
          state.mutationLoading = false;
          state.error =
            action.payload ||
            "Failed to update announcement status.";
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
  clearAnnouncementError,
  clearAnnouncementStatsError,
  clearAnnouncementDetailsError,
  clearSelectedAnnouncement,
  setSelectedAnnouncement,
  resetAnnouncementState,
} = announcementSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectAnnouncements = (
  state
) =>
  state.announcements?.announcements ||
  [];

export const selectSelectedAnnouncement = (
  state
) =>
  state.announcements
    ?.selectedAnnouncement || null;

export const selectAnnouncementStats = (
  state
) =>
  state.announcements?.stats || {
    total_announcements: 0,
    published_announcements: 0,
    draft_announcements: 0,
    archived_announcements: 0,
    high_priority_announcements: 0,
    critical_announcements: 0,
  };

export const selectAnnouncementLoading = (
  state
) =>
  state.announcements?.loading ||
  false;

export const selectAnnouncementStatsLoading = (
  state
) =>
  state.announcements
    ?.statsLoading || false;

export const selectAnnouncementDetailsLoading = (
  state
) =>
  state.announcements
    ?.detailsLoading || false;

export const selectAnnouncementMutationLoading = (
  state
) =>
  state.announcements
    ?.mutationLoading || false;

export const selectAnnouncementError = (
  state
) =>
  state.announcements?.error ||
  null;

export const selectAnnouncementStatsError = (
  state
) =>
  state.announcements?.statsError ||
  null;

export const selectAnnouncementDetailsError = (
  state
) =>
  state.announcements
    ?.detailsError || null;

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default announcementSlice.reducer;