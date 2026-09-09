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

  loading: false,

  creating: false,

  updating: false,

  deleting: false,

  toggling: false,

  statsLoading: false,

  error: null,
};


// =========================================================
// HELPER
// =========================================================

const getErrorMessage = (
  error,
  fallback
) => {

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

  async (
    filters = {},
    { rejectWithValue }
  ) => {

    try {

      const response =
        await getBlogsApi(
          filters
        );

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

export const fetchBlogById =
  createAsyncThunk(
    "blog/fetchBlogById",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await getBlogApi(id);

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

export const fetchBlogStats =
  createAsyncThunk(
    "blog/fetchBlogStats",

    async (
      _,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await getBlogStatsApi();

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

export const createBlog =
  createAsyncThunk(
    "blog/createBlog",

    async (
      blogData,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await createBlogApi(
            blogData
          );

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

export const updateBlog =
  createAsyncThunk(
    "blog/updateBlog",

    async (
      { id, data },
      { rejectWithValue }
    ) => {

      try {

        const response =
          await updateBlogApi(
            id,
            data
          );

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

export const deleteBlog =
  createAsyncThunk(
    "blog/deleteBlog",

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

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

    async (
      id,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await toggleBlogPublishApi(
            id
          );

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

const blogSlice =
  createSlice({

    name: "blog",

    initialState,

    reducers: {

      clearBlogError: (state) => {
        state.error = null;
      },

      clearSelectedBlog: (state) => {
        state.selectedBlog = null;
      },

      resetBlogState: () => {
        return initialState;
      },

    },

    extraReducers: (builder) => {

      // ===================================================
      // FETCH BLOGS
      // ===================================================

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
              action.payload;

            state.blogs =
              payload?.data?.blogs ||
              payload?.blogs ||
              [];

            state.pagination =
              payload?.pagination ||
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


      // ===================================================
      // FETCH SINGLE BLOG
      // ===================================================

      builder

        .addCase(
          fetchBlogById.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchBlogById.fulfilled,
          (state, action) => {

            state.loading = false;

            state.selectedBlog =
              action.payload?.data ||
              action.payload?.blog ||
              null;
          }
        )

        .addCase(
          fetchBlogById.rejected,
          (state, action) => {

            state.loading = false;

            state.error =
              action.payload ||
              "Failed to load blog.";
          }
        );


      // ===================================================
      // FETCH STATS
      // ===================================================

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

            const stats =
              action.payload?.data ||
              action.payload?.stats ||
              {};

            state.stats = {
              total:
                Number(
                  stats.total ??
                  stats.total_posts ??
                  0
                ),

              published:
                Number(
                  stats.published ??
                  stats.published_posts ??
                  0
                ),

              drafts:
                Number(
                  stats.drafts ??
                  stats.draft_posts ??
                  0
                ),

              featured:
                Number(
                  stats.featured ??
                  stats.featured_posts ??
                  0
                ),

              totalViews:
                Number(
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


      // ===================================================
      // CREATE
      // ===================================================

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


      // ===================================================
      // UPDATE
      // ===================================================

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


      // ===================================================
      // DELETE
      // ===================================================

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

            state.blogs =
              state.blogs.filter(
                (blog) =>
                  blog.id !==
                  action.payload.id
              );
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


      // ===================================================
      // TOGGLE PUBLISH
      // ===================================================

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
          (state) => {
            state.toggling = false;
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

export const selectBlogs = (state) =>
  state.blogs.blogs;

export const selectBlogStats = (state) =>
  state.blogs.stats;

export const selectBlogPagination = (state) =>
  state.blogs.pagination;

export const selectBlogLoading = (state) =>
  state.blogs.loading;

export const selectBlogCreating = (state) =>
  state.blogs.creating;

export const selectBlogUpdating = (state) =>
  state.blogs.updating;

export const selectBlogDeleting = (state) =>
  state.blogs.deleting;

export const selectBlogToggling = (state) =>
  state.blogs.toggling;

export const selectBlogError = (state) =>
  state.blogs.error;

export const selectSelectedBlog = (state) =>
  state.blogs.selectedBlog;

// =========================================================
// EXPORT REDUCER
// =========================================================

export default blogSlice.reducer;