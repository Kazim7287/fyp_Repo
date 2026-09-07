import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getBlogsApi,
  getBlogApi,
  getBlogStatsApi,
  createBlogApi,
  updateBlogApi,
  deleteBlogApi,
  toggleBlogPublishApi,
} from "../../api/blogApi";

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  blogs: [],

  selectedBlog: null,

  stats: {
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    totalViews: 0,
  },

  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  },

  // Loading states
  loading: false,
  selectedBlogLoading: false,
  statsLoading: false,

  creating: false,
  updating: false,
  deleting: false,
  toggling: false,

  error: null,
};

// =========================================================
// HELPER
// =========================================================

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

// =========================================================
// GET BLOGS
// =========================================================

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",

  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getBlogsApi(filters);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to load blogs."
        )
      );
    }
  }
);

// =========================================================
// GET SINGLE BLOG
// =========================================================

export const fetchBlogById = createAsyncThunk(
  "blog/fetchBlogById",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Blog ID is required."
        );
      }

      const response = await getBlogApi(id);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to load blog."
        )
      );
    }
  }
);

// =========================================================
// GET BLOG STATS
// =========================================================

export const fetchBlogStats = createAsyncThunk(
  "blog/fetchBlogStats",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getBlogStatsApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to load blog statistics."
        )
      );
    }
  }
);

// =========================================================
// CREATE BLOG
// =========================================================

export const createBlog = createAsyncThunk(
  "blog/createBlog",

  async (blogData, { rejectWithValue }) => {
    try {
      if (!blogData) {
        return rejectWithValue(
          "Blog data is required."
        );
      }

      const response =
        await createBlogApi(blogData);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create blog."
        )
      );
    }
  }
);

// =========================================================
// UPDATE BLOG
// =========================================================

export const updateBlog = createAsyncThunk(
  "blog/updateBlog",

  async (
    { id, data },
    { rejectWithValue }
  ) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Blog ID is required."
        );
      }

      if (!data) {
        return rejectWithValue(
          "Blog data is required."
        );
      }

      const response =
        await updateBlogApi(id, data);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update blog."
        )
      );
    }
  }
);

// =========================================================
// DELETE BLOG
// =========================================================

export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Blog ID is required."
        );
      }

      const response =
        await deleteBlogApi(id);

      return {
        id,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete blog."
        )
      );
    }
  }
);

// =========================================================
// TOGGLE PUBLISH
// =========================================================

export const toggleBlogPublish =
  createAsyncThunk(
    "blog/toggleBlogPublish",

    async (id, { rejectWithValue }) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Blog ID is required."
          );
        }

        const response =
          await toggleBlogPublishApi(id);

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to update publication status."
          )
        );
      }
    }
  );

// =========================================================
// SLICE
// =========================================================

const blogSlice = createSlice({
  name: "blog",

  initialState,

  reducers: {
    // -------------------------------------------------------
    // CLEAR ERROR
    // -------------------------------------------------------

    clearBlogError: (state) => {
      state.error = null;
    },

    // -------------------------------------------------------
    // CLEAR SELECTED BLOG
    // -------------------------------------------------------

    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
      state.selectedBlogLoading = false;
    },

    // -------------------------------------------------------
    // RESET BLOG STATE
    // -------------------------------------------------------

    resetBlogState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // =======================================================
    // FETCH BLOGS
    // =======================================================

    builder
      .addCase(
        fetchBlogs.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchBlogs.fulfilled,
        (state, action) => {
          state.loading = false;

          const payload =
            action.payload || {};

          /*
           * Supports:
           *
           * {
           *   success: true,
           *   data: {
           *     blogs: [...]
           *   },
           *   pagination: {...}
           * }
           *
           * and:
           *
           * {
           *   blogs: [...]
           * }
           */

          state.blogs =
            payload?.data?.blogs ||
            payload?.blogs ||
            [];

          state.pagination =
            payload?.pagination ||
            payload?.data?.pagination ||
            state.pagination;
        }
      )

      .addCase(
        fetchBlogs.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to load blogs.";
        }
      );

    // =======================================================
    // FETCH SINGLE BLOG
    // =======================================================

    builder
      .addCase(
        fetchBlogById.pending,
        (state) => {
          state.selectedBlogLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchBlogById.fulfilled,
        (state, action) => {
          state.selectedBlogLoading = false;

          const payload =
            action.payload || {};

          state.selectedBlog =
            payload?.data?.blog ||
            payload?.data ||
            payload?.blog ||
            null;
        }
      )

      .addCase(
        fetchBlogById.rejected,
        (state, action) => {
          state.selectedBlogLoading = false;

          state.error =
            action.payload ||
            "Failed to load blog.";
        }
      );

    // =======================================================
    // FETCH BLOG STATS
    // =======================================================

    builder
      .addCase(
        fetchBlogStats.pending,
        (state) => {
          state.statsLoading = true;
        }
      )

      .addCase(
        fetchBlogStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;

          const payload =
            action.payload || {};

          const stats =
            payload?.data?.stats ||
            payload?.data ||
            payload?.stats ||
            {};

          state.stats = {
            total: Number(
              stats.total ??
              stats.total_posts ??
              0
            ),

            published: Number(
              stats.published ??
              stats.published_posts ??
              0
            ),

            drafts: Number(
              stats.drafts ??
              stats.draft_posts ??
              0
            ),

            featured: Number(
              stats.featured ??
              stats.featured_posts ??
              0
            ),

            totalViews: Number(
              stats.totalViews ??
              stats.total_views ??
              0
            ),
          };
        }
      )

      .addCase(
        fetchBlogStats.rejected,
        (state, action) => {
          state.statsLoading = false;

          state.error =
            action.payload ||
            "Failed to load blog statistics.";
        }
      );

    // =======================================================
    // CREATE BLOG
    // =======================================================

    builder
      .addCase(
        createBlog.pending,
        (state) => {
          state.creating = true;
          state.error = null;
        }
      )

      .addCase(
        createBlog.fulfilled,
        (state) => {
          state.creating = false;
        }
      )

      .addCase(
        createBlog.rejected,
        (state, action) => {
          state.creating = false;

          state.error =
            action.payload ||
            "Failed to create blog.";
        }
      );

    // =======================================================
    // UPDATE BLOG
    // =======================================================

    builder
      .addCase(
        updateBlog.pending,
        (state) => {
          state.updating = true;
          state.error = null;
        }
      )

      .addCase(
        updateBlog.fulfilled,
        (state) => {
          state.updating = false;
        }
      )

      .addCase(
        updateBlog.rejected,
        (state, action) => {
          state.updating = false;

          state.error =
            action.payload ||
            "Failed to update blog.";
        }
      );

    // =======================================================
    // DELETE BLOG
    // =======================================================

    builder
      .addCase(
        deleteBlog.pending,
        (state) => {
          state.deleting = true;
          state.error = null;
        }
      )

      .addCase(
        deleteBlog.fulfilled,
        (state, action) => {
          state.deleting = false;

          const deletedId =
            action.payload?.id;

          state.blogs =
            state.blogs.filter(
              (blog) =>
                String(blog.id) !==
                String(deletedId)
            );

          /*
           * If the deleted blog is currently
           * selected, clear it.
           */

          if (
            state.selectedBlog &&
            String(state.selectedBlog.id) ===
              String(deletedId)
          ) {
            state.selectedBlog = null;
          }

          /*
           * Keep total count correct locally.
           */

          if (state.pagination.total > 0) {
            state.pagination.total -= 1;
          }
        }
      )

      .addCase(
        deleteBlog.rejected,
        (state, action) => {
          state.deleting = false;

          state.error =
            action.payload ||
            "Failed to delete blog.";
        }
      );

    // =======================================================
    // TOGGLE PUBLISH
    // =======================================================

    builder
      .addCase(
        toggleBlogPublish.pending,
        (state) => {
          state.toggling = true;
          state.error = null;
        }
      )

      .addCase(
        toggleBlogPublish.fulfilled,
        (state, action) => {
          state.toggling = false;

          /*
           * If the backend returns the updated blog,
           * update it immediately in Redux.
           */

          const updatedBlog =
            action.payload?.data?.blog ||
            action.payload?.data ||
            action.payload?.blog ||
            null;

          if (updatedBlog?.id) {
            const index =
              state.blogs.findIndex(
                (blog) =>
                  String(blog.id) ===
                  String(updatedBlog.id)
              );

            if (index !== -1) {
              state.blogs[index] = {
                ...state.blogs[index],
                ...updatedBlog,
              };
            }

            if (
              state.selectedBlog &&
              String(state.selectedBlog.id) ===
                String(updatedBlog.id)
            ) {
              state.selectedBlog = {
                ...state.selectedBlog,
                ...updatedBlog,
              };
            }
          }
        }
      )

      .addCase(
        toggleBlogPublish.rejected,
        (state, action) => {
          state.toggling = false;

          state.error =
            action.payload ||
            "Failed to update publication status.";
        }
      );
  },
});

// =========================================================
// EXPORT ACTIONS
// =========================================================

export const {
  clearBlogError,
  clearSelectedBlog,
  resetBlogState,
} = blogSlice.actions;

// =========================================================
// EXPORT SELECTORS
// =========================================================
//
// IMPORTANT:
//
// store.js:
//
// reducer: {
//   blogs: blogReducer
// }
//
// Therefore:
//
// state.blogs
//
// is the correct Redux state path.
//
// =========================================================

export const selectBlogs = (state) =>
  state.blogs.blogs;

export const selectSelectedBlog = (state) =>
  state.blogs.selectedBlog;

export const selectBlogStats = (state) =>
  state.blogs.stats;

export const selectBlogPagination = (state) =>
  state.blogs.pagination;

export const selectBlogLoading = (state) =>
  state.blogs.loading;

export const selectSelectedBlogLoading = (state) =>
  state.blogs.selectedBlogLoading;

export const selectBlogCreating = (state) =>
  state.blogs.creating;

export const selectBlogUpdating = (state) =>
  state.blogs.updating;

export const selectBlogDeleting = (state) =>
  state.blogs.deleting;

export const selectBlogToggling = (state) =>
  state.blogs.toggling;

export const selectBlogStatsLoading = (state) =>
  state.blogs.statsLoading;

export const selectBlogError = (state) =>
  state.blogs.error;

// =========================================================
// EXPORT REDUCER
// =========================================================

export default blogSlice.reducer;