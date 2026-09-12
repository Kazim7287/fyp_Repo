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
  uploadBlogContentImageApi,
  extractBlogs,
  extractPagination,
} from "../../api/blogApi";

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  /*
  |--------------------------------------------------------------------------
  | Blogs
  |--------------------------------------------------------------------------
  */

  blogs: [],

  /*
  |--------------------------------------------------------------------------
  | Selected Blog
  |--------------------------------------------------------------------------
  */

  selectedBlog: null,

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  stats: {
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    totalViews: 0,
  },

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  },

  /*
  |--------------------------------------------------------------------------
  | Loading States
  |--------------------------------------------------------------------------
  */

  loading: false,

  creating: false,

  updating: false,

  deleting: false,

  toggling: false,

  statsLoading: false,

  /*
  |--------------------------------------------------------------------------
  | Content Image Upload
  |--------------------------------------------------------------------------
  |
  | Used by ReactQuill.
  |
  |--------------------------------------------------------------------------
  */

  contentImageUploading: false,

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | String error
  |--------------------------------------------------------------------------
  */

  if (typeof error === "string") {
    return error;
  }

  /*
  |--------------------------------------------------------------------------
  | Error.message
  |--------------------------------------------------------------------------
  */

  if (error?.message) {
    return error.message;
  }

  /*
  |--------------------------------------------------------------------------
  | Axios response
  |--------------------------------------------------------------------------
  */

  if (
    error?.response?.data?.message
  ) {
    return error.response.data.message;
  }

  if (
    error?.response?.data?.error
  ) {
    return error.response.data.error;
  }

  /*
  |--------------------------------------------------------------------------
  | Redux error
  |--------------------------------------------------------------------------
  */

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
|--------------------------------------------------------------------------
*/

export const fetchBlogs =
  createAsyncThunk(
    "blogs/fetchBlogs",

    async (
      filters = {},
      {
        rejectWithValue,
      }
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
      {
        rejectWithValue,
      }
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
      {
        rejectWithValue,
      }
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
      {
        rejectWithValue,
      }
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
| UPLOAD BLOG CONTENT IMAGE
|--------------------------------------------------------------------------
|
| POST /api/blogs/upload-image
|
| Used by ReactQuill.
|
|--------------------------------------------------------------------------
*/

export const uploadBlogContentImage =
  createAsyncThunk(
    "blogs/uploadBlogContentImage",

    async (
      file,
      {
        rejectWithValue,
      }
    ) => {
      try {
        if (!(file instanceof File)) {
          throw new Error(
            "A valid image file is required."
          );
        }

        const response =
          await uploadBlogContentImageApi(
            file
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to upload blog content image."
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
      {
        rejectWithValue,
      }
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
      {
        rejectWithValue,
      }
    ) => {
      try {
        if (!id) {
          throw new Error(
            "Blog ID is required."
          );
        }

        const response =
          await deleteBlogApi(
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
      {
        rejectWithValue,
      }
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

const blogSlice =
  createSlice({
    name: "blogs",

    initialState,

    reducers: {
      /*
      |--------------------------------------------------------------------------
      | CLEAR ERROR
      |--------------------------------------------------------------------------
      */

      clearBlogError: (
        state
      ) => {
        state.error = null;
      },

      /*
      |--------------------------------------------------------------------------
      | CLEAR SELECTED BLOG
      |--------------------------------------------------------------------------
      */

      clearSelectedBlog: (
        state
      ) => {
        state.selectedBlog =
          null;
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

      resetBlogPagination: (
        state
      ) => {
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

    extraReducers: (
      builder
    ) => {
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
          (
            state,
            action
          ) => {
            state.loading =
              false;

            const blogs =
              extractBlogs(
                action.payload
              );

            const pagination =
              extractPagination(
                action.payload
              );

            state.blogs =
              Array.isArray(
                blogs
              )
                ? blogs
                : [];

            state.pagination =
              {
                page:
                  pagination.page ||
                  1,

                limit:
                  pagination.limit ||
                  8,

                total:
                  pagination.total ||
                  0,

                totalPages:
                  pagination.totalPages ||
                  0,
              };
          }
        )

        .addCase(
          fetchBlogs.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to load blogs.";

            /*
            * Existing blogs are intentionally preserved.
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
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchBlogById.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            const response =
              action.payload;

            let blog =
              null;

            /*
            |--------------------------------------------------------------------------
            | data: { blog: {...} }
            |--------------------------------------------------------------------------
            */

            if (
              response?.data &&
              !Array.isArray(
                response.data
              ) &&
              typeof response.data ===
                "object"
            ) {
              if (
                response.data.blog &&
                typeof response.data.blog ===
                  "object"
              ) {
                blog =
                  response.data.blog;
              } else {
                /*
                |--------------------------------------------------------------------------
                | data: {...}
                |--------------------------------------------------------------------------
                */

                blog =
                  response.data;
              }
            }

            /*
            |--------------------------------------------------------------------------
            | blog: {...}
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | Direct object
            |--------------------------------------------------------------------------
            */

            else if (
              response &&
              typeof response ===
                "object"
            ) {
              blog =
                response;
            }

            state.selectedBlog =
              blog;
          }
        )

        .addCase(
          fetchBlogById.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to load blog.";
          }
        );

      /*
      |--------------------------------------------------------------------------
      | FETCH BLOG STATISTICS
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          fetchBlogStats.pending,
          (state) => {
            state.statsLoading =
              true;
          }
        )

        .addCase(
          fetchBlogStats.fulfilled,
          (
            state,
            action
          ) => {
            state.statsLoading =
              false;

            const response =
              action.payload;

            let stats =
              {};

            /*
            |--------------------------------------------------------------------------
            | data: { stats: {...} }
            |--------------------------------------------------------------------------
            */

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
                /*
                |--------------------------------------------------------------------------
                | data: {...}
                |--------------------------------------------------------------------------
                */

                stats =
                  response.data;
              }
            }

            /*
            |--------------------------------------------------------------------------
            | stats: {...}
            |--------------------------------------------------------------------------
            */

            else if (
              response?.stats &&
              typeof response.stats ===
                "object"
            ) {
              stats =
                response.stats;
            }

            /*
            |--------------------------------------------------------------------------
            | Direct object
            |--------------------------------------------------------------------------
            */

            else if (
              response &&
              typeof response ===
                "object"
            ) {
              stats =
                response;
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
          (
            state,
            action
          ) => {
            state.statsLoading =
              false;

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
            state.creating =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          createBlog.fulfilled,
          (
            state
          ) => {
            state.creating =
              false;
          }
        )

        .addCase(
          createBlog.rejected,
          (
            state,
            action
          ) => {
            state.creating =
              false;

            state.error =
              action.payload ||
              "Failed to create blog.";
          }
        );

      /*
      |--------------------------------------------------------------------------
      | UPLOAD BLOG CONTENT IMAGE
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          uploadBlogContentImage.pending,
          (state) => {
            state.contentImageUploading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          uploadBlogContentImage.fulfilled,
          (
            state
          ) => {
            state.contentImageUploading =
              false;
          }
        )

        .addCase(
          uploadBlogContentImage.rejected,
          (
            state,
            action
          ) => {
            state.contentImageUploading =
              false;

            state.error =
              action.payload ||
              "Failed to upload blog content image.";
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
            state.updating =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          updateBlog.fulfilled,
          (
            state,
            action
          ) => {
            state.updating =
              false;

            const response =
              action.payload;

            let updatedBlog =
              null;

            /*
            |--------------------------------------------------------------------------
            | data: { blog: {...} }
            |--------------------------------------------------------------------------
            */

            if (
              response?.data &&
              typeof response.data ===
                "object"
            ) {
              updatedBlog =
                response.data.blog ||
                response.data;
            }

            /*
            |--------------------------------------------------------------------------
            | blog: {...}
            |--------------------------------------------------------------------------
            */

            else if (
              response?.blog &&
              typeof response.blog ===
                "object"
            ) {
              updatedBlog =
                response.blog;
            }

            /*
            |--------------------------------------------------------------------------
            | Update Redux list
            |--------------------------------------------------------------------------
            */

            if (
              updatedBlog?.id
            ) {
              state.blogs =
                state.blogs.map(
                  (
                    blog
                  ) =>
                    blog.id ===
                    updatedBlog.id
                      ? {
                          ...blog,
                          ...updatedBlog,
                        }
                      : blog
                );

              /*
              |--------------------------------------------------------------------------
              | Update selected blog
              |--------------------------------------------------------------------------
              */

              if (
                state
                  .selectedBlog
                  ?.id ===
                updatedBlog.id
              ) {
                state.selectedBlog =
                  {
                    ...state.selectedBlog,
                    ...updatedBlog,
                  };
              }
            }
          }
        )

        .addCase(
          updateBlog.rejected,
          (
            state,
            action
          ) => {
            state.updating =
              false;

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
            state.deleting =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          deleteBlog.fulfilled,
          (
            state,
            action
          ) => {
            state.deleting =
              false;

            const deletedId =
              action.payload?.id;

            /*
            |--------------------------------------------------------------------------
            | Remove from Redux list
            |--------------------------------------------------------------------------
            */

            if (
              deletedId
            ) {
              state.blogs =
                state.blogs.filter(
                  (
                    blog
                  ) =>
                    blog.id !==
                    deletedId
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Clear selected blog
            |--------------------------------------------------------------------------
            */

            if (
              state.selectedBlog
                ?.id ===
              deletedId
            ) {
              state.selectedBlog =
                null;
            }

            /*
            |--------------------------------------------------------------------------
            | Update total
            |--------------------------------------------------------------------------
            */

            if (
              state.pagination
                .total >
              0
            ) {
              state.pagination.total -=
                1;
            }
          }
        )

        .addCase(
          deleteBlog.rejected,
          (
            state,
            action
          ) => {
            state.deleting =
              false;

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
            state.toggling =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          toggleBlogPublish.fulfilled,
          (
            state,
            action
          ) => {
            state.toggling =
              false;

            const id =
              action.payload?.id;

            const response =
              action.payload
                ?.response;

            let updatedBlog =
              null;

            /*
            |--------------------------------------------------------------------------
            | data: { blog: {...} }
            |--------------------------------------------------------------------------
            */

            if (
              response?.data &&
              typeof response.data ===
                "object"
            ) {
              updatedBlog =
                response.data.blog ||
                response.data;
            }

            /*
            |--------------------------------------------------------------------------
            | blog: {...}
            |--------------------------------------------------------------------------
            */

            else if (
              response?.blog &&
              typeof response.blog ===
                "object"
            ) {
              updatedBlog =
                response.blog;
            }

            /*
            |--------------------------------------------------------------------------
            | Update blogs
            |--------------------------------------------------------------------------
            */

            state.blogs =
              state.blogs.map(
                (
                  blog
                ) => {
                  if (
                    blog.id !==
                    id
                  ) {
                    return blog;
                  }

                  /*
                  |--------------------------------------------------------------------------
                  | Backend returned complete blog
                  |--------------------------------------------------------------------------
                  */

                  if (
                    updatedBlog
                  ) {
                    return {
                      ...blog,
                      ...updatedBlog,
                    };
                  }

                  /*
                  |--------------------------------------------------------------------------
                  | Backend returned no complete blog
                  |--------------------------------------------------------------------------
                  */

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
            |--------------------------------------------------------------------------
            | Update selected blog
            |--------------------------------------------------------------------------
            */

            if (
              state.selectedBlog
                ?.id ===
              id
            ) {
              if (
                updatedBlog
              ) {
                state.selectedBlog =
                  {
                    ...state.selectedBlog,
                    ...updatedBlog,
                  };
              } else {
                state.selectedBlog =
                  {
                    ...state.selectedBlog,

                    status:
                      state
                        .selectedBlog
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
          (
            state,
            action
          ) => {
            state.toggling =
              false;

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
} =
  blogSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectBlogs = (
  state
) => state.blogs.blogs;

export const selectBlogStats = (
  state
) => state.blogs.stats;

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

/*
|--------------------------------------------------------------------------
| CONTENT IMAGE UPLOADING SELECTOR
|--------------------------------------------------------------------------
*/

export const selectBlogContentImageUploading =
  (
    state
  ) =>
    state.blogs
      .contentImageUploading;

export const selectBlogError = (
  state
) => state.blogs.error;

export const selectSelectedBlog = (
  state
) => state.blogs.selectedBlog;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default blogSlice.reducer;