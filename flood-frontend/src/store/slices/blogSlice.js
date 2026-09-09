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
  extractBlogs,
  extractPagination,
} from "../../api/blogApi";

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ERROR HELPER
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.error) {
    return error.error;
  }

  return fallback;
};

/*
|--------------------------------------------------------------------------
| FETCH BLOGS
|--------------------------------------------------------------------------
|
| GET /api/blogs
|
| filters:
| {
|   search,
|   status,
|   category,
|   page,
|   limit
| }
|
|--------------------------------------------------------------------------
*/

export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",

  async (
    filters = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getBlogsApi(
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

/*
|--------------------------------------------------------------------------
| FETCH SINGLE BLOG
|--------------------------------------------------------------------------
|
| GET /api/blogs/:id
|
|--------------------------------------------------------------------------
*/

export const fetchBlogById =
  createAsyncThunk(
    "blogs/fetchBlogById",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          throw new Error(
            "Blog ID is required."
          );
        }

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

/*
|--------------------------------------------------------------------------
| FETCH BLOG STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/blogs/stats
|
|--------------------------------------------------------------------------
*/

export const fetchBlogStats =
  createAsyncThunk(
    "blogs/fetchBlogStats",

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

/*
|--------------------------------------------------------------------------
| CREATE BLOG
|--------------------------------------------------------------------------
|
| POST /api/blogs
|
|--------------------------------------------------------------------------
*/

export const createBlog =
  createAsyncThunk(
    "blogs/createBlog",

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

/*
|--------------------------------------------------------------------------
| UPDATE BLOG
|--------------------------------------------------------------------------
|
| PUT /api/blogs/:id
|
|--------------------------------------------------------------------------
*/

export const updateBlog =
  createAsyncThunk(
    "blogs/updateBlog",

    async (
      { id, data },
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          throw new Error(
            "Blog ID is required."
          );
        }

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

/*
|--------------------------------------------------------------------------
| DELETE BLOG
|--------------------------------------------------------------------------
|
| DELETE /api/blogs/:id
|
|--------------------------------------------------------------------------
*/

export const deleteBlog =
  createAsyncThunk(
    "blogs/deleteBlog",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          throw new Error(
            "Blog ID is required."
          );
        }

        const response =
          await deleteBlogApi(id);

        return {
          id,
          response,
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

/*
|--------------------------------------------------------------------------
| TOGGLE BLOG PUBLISH STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/blogs/:id/toggle-publish
|
|--------------------------------------------------------------------------
*/

export const toggleBlogPublish =
  createAsyncThunk(
    "blogs/toggleBlogPublish",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          throw new Error(
            "Blog ID is required."
          );
        }

        const response =
          await toggleBlogPublishApi(
            id
          );

        return {
          id,
          response,
        };
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

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const blogSlice = createSlice({
  name: "blogs",

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | CLEAR ERROR
    |--------------------------------------------------------------------------
    */

    clearBlogError: (state) => {
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR SELECTED BLOG
    |--------------------------------------------------------------------------
    */

    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },

    /*
    |--------------------------------------------------------------------------
    | RESET STATE
    |--------------------------------------------------------------------------
    */

    resetBlogState: () => {
      return initialState;
    },

    /*
    |--------------------------------------------------------------------------
    | RESET PAGINATION
    |--------------------------------------------------------------------------
    */

    resetBlogPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 0,
      };
    },
  },

  /*
  |--------------------------------------------------------------------------
  | ASYNC ACTIONS
  |--------------------------------------------------------------------------
  */

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | FETCH BLOGS
    |--------------------------------------------------------------------------
    */

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

          /*
          |--------------------------------------------------------------------------
          | Extract blogs using the helper from blogApi.js
          |--------------------------------------------------------------------------
          */

          const blogs =
            extractBlogs(
              action.payload
            );

          /*
          |--------------------------------------------------------------------------
          | Extract pagination
          |--------------------------------------------------------------------------
          */

          const pagination =
            extractPagination(
              action.payload
            );

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT
          |--------------------------------------------------------------------------
          */

          state.blogs =
            Array.isArray(blogs)
              ? blogs
              : [];

          state.pagination = {
            page:
              pagination.page || 1,

            limit:
              pagination.limit || 8,

            total:
              pagination.total || 0,

            totalPages:
              pagination.totalPages || 0,
          };
        }
      )

      .addCase(
        fetchBlogs.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to load blogs.";

          /*
          * Do not destroy existing blogs
          * if a refresh request fails.
          */
        }
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH SINGLE BLOG
    |--------------------------------------------------------------------------
    */

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

          const response =
            action.payload;

          /*
          * API may return:
          *
          * {
          *   data: {...}
          * }
          *
          * or
          *
          * {
          *   blog: {...}
          * }
          */

          let blog = null;

          if (
            response?.data &&
            !Array.isArray(
              response.data
            ) &&
            typeof response.data ===
              "object"
          ) {
            /*
            * Handle:
            * data: { blog: {...} }
            */

            if (
              response.data.blog &&
              typeof response.data.blog ===
                "object"
            ) {
              blog =
                response.data.blog;
            }

            /*
            * Handle:
            * data: {...}
            */

            else {
              blog =
                response.data;
            }
          }

          /*
          * Handle:
          * blog: {...}
          */

          else if (
            response?.blog &&
            typeof response.blog ===
              "object"
          ) {
            blog =
              response.blog;
          }

          /*
          * Handle direct object
          */

          else if (
            response &&
            typeof response ===
              "object"
          ) {
            blog = response;
          }

          state.selectedBlog =
            blog;
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

    /*
    |--------------------------------------------------------------------------
    | FETCH BLOG STATS
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        fetchBlogStats.pending,
        (state) => {
          state.statsLoading = true;

          /*
          * Don't clear normal errors here.
          */
        }
      )

      .addCase(
        fetchBlogStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;

          const response =
            action.payload;

          /*
          * Support:
          *
          * {
          *   data: {...}
          * }
          *
          * {
          *   stats: {...}
          * }
          *
          * {
          *   data: {
          *     stats: {...}
          *   }
          * }
          */

          let stats = {};

          if (
            response?.data &&
            typeof response.data ===
              "object"
          ) {
            if (
              response.data.stats &&
              typeof response.data.stats ===
                "object"
            ) {
              stats =
                response.data.stats;
            } else {
              stats =
                response.data;
            }
          } else if (
            response?.stats &&
            typeof response.stats ===
              "object"
          ) {
            stats =
              response.stats;
          } else if (
            response &&
            typeof response ===
              "object"
          ) {
            stats = response;
          }

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

    /*
    |--------------------------------------------------------------------------
    | CREATE BLOG
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | UPDATE BLOG
    |--------------------------------------------------------------------------
    */

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
        (state, action) => {
          state.updating = false;

          /*
          * Try to update the blog
          * immediately in Redux if the
          * API returns the updated blog.
          */

          const response =
            action.payload;

          let updatedBlog = null;

          if (
            response?.data &&
            typeof response.data ===
              "object"
          ) {
            updatedBlog =
              response.data.blog ||
              response.data;
          } else if (
            response?.blog &&
            typeof response.blog ===
              "object"
          ) {
            updatedBlog =
              response.blog;
          }

          if (updatedBlog?.id) {
            state.blogs =
              state.blogs.map(
                (blog) =>
                  blog.id ===
                  updatedBlog.id
                    ? {
                        ...blog,
                        ...updatedBlog,
                      }
                    : blog
              );

            if (
              state.selectedBlog?.id ===
              updatedBlog.id
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
        updateBlog.rejected,
        (state, action) => {
          state.updating = false;

          state.error =
            action.payload ||
            "Failed to update blog.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | DELETE BLOG
    |--------------------------------------------------------------------------
    */

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

          /*
          * Remove deleted blog from
          * current Redux list.
          */

          if (deletedId) {
            state.blogs =
              state.blogs.filter(
                (blog) =>
                  blog.id !==
                  deletedId
              );
          }

          /*
          * Clear selected blog if
          * it was deleted.
          */

          if (
            state.selectedBlog?.id ===
            deletedId
          ) {
            state.selectedBlog =
              null;
          }

          /*
          * Update total locally.
          */

          if (
            state.pagination.total >
            0
          ) {
            state.pagination.total -=
              1;
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

    /*
    |--------------------------------------------------------------------------
    | TOGGLE PUBLISH
    |--------------------------------------------------------------------------
    */

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

          const id =
            action.payload?.id;

          const response =
            action.payload?.response;

          /*
          * If backend returns the
          * updated blog, use it.
          */

          let updatedBlog = null;

          if (
            response?.data &&
            typeof response.data ===
              "object"
          ) {
            updatedBlog =
              response.data.blog ||
              response.data;
          } else if (
            response?.blog &&
            typeof response.blog ===
              "object"
          ) {
            updatedBlog =
              response.blog;
          }

          /*
          * If backend does not return
          * the entire blog, toggle the
          * current status locally.
          */

          state.blogs =
            state.blogs.map(
              (blog) => {
                if (
                  blog.id !== id
                ) {
                  return blog;
                }

                if (
                  updatedBlog
                ) {
                  return {
                    ...blog,
                    ...updatedBlog,
                  };
                }

                return {
                  ...blog,
                  status:
                    blog.status ===
                    "Published"
                      ? "Draft"
                      : "Published",
                };
              }
            );

          /*
          * Also update selected blog.
          */

          if (
            state.selectedBlog?.id ===
            id
          ) {
            if (
              updatedBlog
            ) {
              state.selectedBlog = {
                ...state.selectedBlog,
                ...updatedBlog,
              };
            } else {
              state.selectedBlog = {
                ...state.selectedBlog,
                status:
                  state.selectedBlog
                    .status ===
                  "Published"
                    ? "Draft"
                    : "Published",
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

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  clearBlogError,
  clearSelectedBlog,
  resetBlogState,
  resetBlogPagination,
} = blogSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectBlogs = (state) =>
  state.blogs.blogs;

export const selectBlogStats = (state) =>
  state.blogs.stats;

export const selectBlogPagination = (
  state
) => state.blogs.pagination;

export const selectBlogLoading = (
  state
) => state.blogs.loading;

export const selectBlogCreating = (
  state
) => state.blogs.creating;

export const selectBlogUpdating = (
  state
) => state.blogs.updating;

export const selectBlogDeleting = (
  state
) => state.blogs.deleting;

export const selectBlogToggling = (
  state
) => state.blogs.toggling;

export const selectBlogStatsLoading = (
  state
) => state.blogs.statsLoading;

export const selectBlogError = (state) =>
  state.blogs.error;

export const selectSelectedBlog = (
  state
) => state.blogs.selectedBlog;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default blogSlice.reducer;