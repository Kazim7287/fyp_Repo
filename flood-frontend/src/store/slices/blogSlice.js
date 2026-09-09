import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import blogApi from "../../api/blogApi";

/*
|--------------------------------------------------------------------------
| Initial State
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
  selectedBlogLoading: false,
  statsLoading: false,

  creating: false,
  updating: false,
  deleting: false,
  toggling: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getApiError = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/*
|--------------------------------------------------------------------------
| Fetch Blogs
|--------------------------------------------------------------------------
*/

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async (
    {
      search = "",
      status = "all",
      category = "all",
      page = 1,
      limit = 8,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await blogApi.get("/blogs", {
        params: {
          search: search || undefined,
          status:
            status && status !== "all"
              ? status
              : undefined,
          category:
            category && category !== "all"
              ? category
              : undefined,
          page,
          limit,
        },
      });

      console.log(
        "BLOGS API RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "Fetch blogs failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to load blogs."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Fetch Single Blog
|--------------------------------------------------------------------------
*/

export const fetchBlogById = createAsyncThunk(
  "blog/fetchBlogById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogApi.get(
        `/blogs/${id}`
      );

      return response.data;
    } catch (error) {
      console.error(
        "Fetch blog failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to load blog."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Fetch Statistics
|--------------------------------------------------------------------------
*/

export const fetchBlogStats = createAsyncThunk(
  "blog/fetchBlogStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await blogApi.get(
        "/blogs/stats"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Fetch blog stats failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to load blog statistics."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Create Blog
|--------------------------------------------------------------------------
*/

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append(
        "title",
        blogData.title || ""
      );

      formData.append(
        "category",
        blogData.category || ""
      );

      formData.append(
        "status",
        blogData.status || "Draft"
      );

      formData.append(
        "featured",
        String(Boolean(blogData.featured))
      );

      formData.append(
        "excerpt",
        blogData.excerpt || ""
      );

      formData.append(
        "content",
        blogData.content || ""
      );

      if (blogData.image) {
        formData.append(
          "image",
          blogData.image
        );
      }

      const response = await blogApi.post(
        "/blogs",
        formData
      );

      console.log(
        "CREATE BLOG RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "Create blog failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to create blog."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update Blog
|--------------------------------------------------------------------------
*/

export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async (
    { id, data: blogData },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append(
        "title",
        blogData.title || ""
      );

      formData.append(
        "category",
        blogData.category || ""
      );

      formData.append(
        "status",
        blogData.status || "Draft"
      );

      formData.append(
        "featured",
        String(Boolean(blogData.featured))
      );

      formData.append(
        "excerpt",
        blogData.excerpt || ""
      );

      formData.append(
        "content",
        blogData.content || ""
      );

      if (blogData.image) {
        formData.append(
          "image",
          blogData.image
        );
      }

      const response = await blogApi.put(
        `/blogs/${id}`,
        formData
      );

      console.log(
        "UPDATE BLOG RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "Update blog failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to update blog."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete Blog
|--------------------------------------------------------------------------
*/

export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      const response =
        await blogApi.delete(
          `/blogs/${id}`
        );

      return {
        ...response.data,
        deletedId: id,
      };
    } catch (error) {
      console.error(
        "Delete blog failed:",
        error
      );

      return rejectWithValue(
        getApiError(
          error,
          "Failed to delete blog."
        )
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Toggle Publish
|--------------------------------------------------------------------------
*/

export const toggleBlogPublish =
  createAsyncThunk(
    "blog/toggleBlogPublish",
    async (id, { rejectWithValue }) => {
      try {
        const response =
          await blogApi.patch(
            `/blogs/${id}/toggle-publish`
          );

        return response.data;
      } catch (error) {
        console.error(
          "Toggle blog failed:",
          error
        );

        return rejectWithValue(
          getApiError(
            error,
            "Failed to update blog status."
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const blogSlice = createSlice({
  name: "blog",

  initialState,

  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    },

    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | Fetch Blogs
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

          const payload =
            action.payload || {};

          /*
           * Backend response:
           *
           * {
           *   success: true,
           *   data: [...],
           *   pagination: {...}
           * }
           */

          state.blogs = Array.isArray(
            payload.data
          )
            ? payload.data
            : [];

          state.pagination = {
            page:
              Number(
                payload.pagination?.page
              ) || 1,

            limit:
              Number(
                payload.pagination?.limit
              ) || 8,

            total:
              Number(
                payload.pagination?.total
              ) || 0,

            totalPages:
              Number(
                payload.pagination?.totalPages
              ) || 0,
          };
        }
      )

      .addCase(
        fetchBlogs.rejected,
        (state, action) => {
          state.loading = false;

          state.blogs = [];

          state.error =
            action.payload ||
            "Failed to load blogs.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Fetch Single Blog
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        fetchBlogById.pending,
        (state) => {
          state.selectedBlogLoading =
            true;
          state.error = null;
        }
      )

      .addCase(
        fetchBlogById.fulfilled,
        (state, action) => {
          state.selectedBlogLoading =
            false;

          const payload =
            action.payload || {};

          state.selectedBlog =
            payload.data ||
            payload.blog ||
            payload;
        }
      )

      .addCase(
        fetchBlogById.rejected,
        (state, action) => {
          state.selectedBlogLoading =
            false;

          state.error =
            action.payload ||
            "Failed to load blog.";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

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

          state.stats =
            payload.data ||
            payload.stats ||
            payload;
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
    | Create
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
        (state, action) => {
          state.creating = false;

          const payload =
            action.payload || {};

          const newBlog =
            payload.data ||
            payload.blog;

          if (newBlog) {
            state.blogs.unshift(
              newBlog
            );

            state.pagination.total += 1;
          }
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
    | Update
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

          const payload =
            action.payload || {};

          const updatedBlog =
            payload.data ||
            payload.blog;

          if (!updatedBlog) {
            return;
          }

          const index =
            state.blogs.findIndex(
              (blog) =>
                String(blog.id) ===
                String(updatedBlog.id)
            );

          if (index !== -1) {
            state.blogs[index] =
              updatedBlog;
          }

          if (
            state.selectedBlog &&
            String(
              state.selectedBlog.id
            ) ===
              String(updatedBlog.id)
          ) {
            state.selectedBlog =
              updatedBlog;
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
    | Delete
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
            action.payload?.deletedId;

          state.blogs =
            state.blogs.filter(
              (blog) =>
                String(blog.id) !==
                String(deletedId)
            );

          state.pagination.total =
            Math.max(
              0,
              Number(
                state.pagination.total
              ) - 1
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

    /*
    |--------------------------------------------------------------------------
    | Toggle Publish
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

          const payload =
            action.payload || {};

          const updatedBlog =
            payload.data ||
            payload.blog;

          if (!updatedBlog) {
            return;
          }

          const index =
            state.blogs.findIndex(
              (blog) =>
                String(blog.id) ===
                String(updatedBlog.id)
            );

          if (index !== -1) {
            state.blogs[index] =
              updatedBlog;
          }
        }
      )

      .addCase(
        toggleBlogPublish.rejected,
        (state, action) => {
          state.toggling = false;

          state.error =
            action.payload ||
            "Failed to update blog status.";
        }
      );
  },
});

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  clearBlogError,
  clearSelectedBlog,
} = blogSlice.actions;

/*
|--------------------------------------------------------------------------
| Selectors
|--------------------------------------------------------------------------
*/

export const selectBlogs = (state) =>
  state.blogs.blogs;

export const selectBlogStats = (state) =>
  state.blogs.stats;

export const selectBlogPagination = (
  state
) => state.blogs.pagination;

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

export const selectSelectedBlog = (
  state
) => state.blogs.selectedBlog;

export const selectSelectedBlogLoading = (
  state
) => state.blogs.selectedBlogLoading;

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default blogSlice.reducer;