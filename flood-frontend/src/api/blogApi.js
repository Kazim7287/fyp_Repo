import axios from "axios";

/*
|--------------------------------------------------------------------------
| Blog API
|--------------------------------------------------------------------------
| Frontend requests:
|
|   /api/blogs
|
| Nginx in production forwards:
|
|   /api/* -> http://127.0.0.1:5000/api/*
|
| Therefore DO NOT use:
|
|   http://localhost:5000/api
|
| in production.
|--------------------------------------------------------------------------
*/

const blogApi = axios.create({
  baseURL: "/api",
  withCredentials: true,

  /*
  IMPORTANT:
  Do NOT set Content-Type to application/json here.

  Blog create/update uses FormData for image upload.
  Axios/browser will automatically set:
      multipart/form-data; boundary=...
  */

  headers: {
    Accept: "application/json",
  },

  timeout: 20000,
});

/*
|--------------------------------------------------------------------------
| Axios Response Interceptor
|--------------------------------------------------------------------------
*/

blogApi.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response) {
      console.error("Blog API Error:", {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Blog API Network Error:", error.message);
    } else {
      console.error("Blog API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Convert API response into a consistent error message.
 */
const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/**
 * Convert different possible API response shapes into blog array.
 *
 * Supported:
 *
 * {
 *   success: true,
 *   data: [...]
 * }
 *
 * {
 *   success: true,
 *   blogs: [...]
 * }
 *
 * {
 *   success: true,
 *   data: {
 *      blogs: [...]
 *   }
 * }
 */
export const extractBlogs = (responseData) => {
  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.blogs)) {
    return responseData.blogs;
  }

  if (Array.isArray(responseData?.data?.blogs)) {
    return responseData.data.blogs;
  }

  return [];
};

/**
 * Extract pagination safely.
 */
export const extractPagination = (responseData) => {
  const pagination =
    responseData?.pagination ||
    responseData?.data?.pagination ||
    {};

  return {
    page: Number(pagination.page) || 1,
    limit: Number(pagination.limit) || 8,
    total: Number(pagination.total) || 0,
    totalPages: Number(pagination.totalPages) || 0,
  };
};

/**
 * Extract one blog from different response shapes.
 */
export const extractBlog = (responseData) => {
  if (!responseData) {
    return null;
  }

  if (
    responseData?.data &&
    !Array.isArray(responseData.data) &&
    typeof responseData.data === "object"
  ) {
    return responseData.data;
  }

  if (
    responseData?.blog &&
    typeof responseData.blog === "object"
  ) {
    return responseData.blog;
  }

  return null;
};

/**
 * Normalize boolean values.
 */
const normalizeBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
};

/**
 * Build FormData for create/update.
 */
const buildBlogFormData = (blogData = {}) => {
  const formData = new FormData();

  formData.append(
    "title",
    typeof blogData.title === "string"
      ? blogData.title.trim()
      : ""
  );

  formData.append(
    "category",
    typeof blogData.category === "string"
      ? blogData.category.trim()
      : ""
  );

  formData.append(
    "status",
    blogData.status || "Draft"
  );

  formData.append(
    "featured",
    String(normalizeBoolean(blogData.featured))
  );

  formData.append(
    "excerpt",
    typeof blogData.excerpt === "string"
      ? blogData.excerpt.trim()
      : ""
  );

  formData.append(
    "content",
    typeof blogData.content === "string"
      ? blogData.content
      : ""
  );

  /*
  |--------------------------------------------------------------------------
  | Image
  |--------------------------------------------------------------------------
  */

  if (blogData.image instanceof File) {
    formData.append("image", blogData.image);
  }

  return formData;
};

/*
|--------------------------------------------------------------------------
| GET BLOGS
|--------------------------------------------------------------------------
|
| GET /api/blogs
|
| Example:
|
| /api/blogs?page=1&limit=8
| /api/blogs?page=1&limit=8&status=Published
| /api/blogs?page=1&limit=8&category=Technology
| /api/blogs?page=1&limit=8&search=flood
|
|--------------------------------------------------------------------------
*/

export const getBlogsApi = async ({
  search = "",
  status = "all",
  category = "all",
  page = 1,
  limit = 8,
} = {}) => {
  try {
    const params = {
      page: Number(page) || 1,
      limit: Number(limit) || 8,
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      params.search = search.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (
      status &&
      status !== "all"
    ) {
      params.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    if (
      category &&
      category !== "all"
    ) {
      params.category = category;
    }

    const response = await blogApi.get("/blogs", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to fetch blogs."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BLOG
|--------------------------------------------------------------------------
|
| GET /api/blogs/:id
|
|--------------------------------------------------------------------------
*/

export const getBlogApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  try {
    const response = await blogApi.get(
      `/blogs/${id}`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to fetch blog."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET BLOG STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/blogs/stats
|
|--------------------------------------------------------------------------
*/

export const getBlogStatsApi = async () => {
  try {
    const response = await blogApi.get(
      "/blogs/stats"
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to fetch blog statistics."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| CREATE BLOG
|--------------------------------------------------------------------------
|
| POST /api/blogs
|
| Content-Type:
| multipart/form-data
|
| Fields:
|
| title
| category
| status
| featured
| excerpt
| content
| image
|
|--------------------------------------------------------------------------
*/

export const createBlogApi = async (blogData = {}) => {
  try {
    const formData = buildBlogFormData(blogData);

    const response = await blogApi.post(
      "/blogs",
      formData
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to create blog."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BLOG
|--------------------------------------------------------------------------
|
| PUT /api/blogs/:id
|
| If image is not provided:
|     Existing image remains unchanged.
|
| If image is provided:
|     New image is uploaded.
|
|--------------------------------------------------------------------------
*/

export const updateBlogApi = async (
  id,
  blogData = {}
) => {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  try {
    const formData = buildBlogFormData(blogData);

    const response = await blogApi.put(
      `/blogs/${id}`,
      formData
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to update blog."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BLOG
|--------------------------------------------------------------------------
|
| DELETE /api/blogs/:id
|
|--------------------------------------------------------------------------
*/

export const deleteBlogApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  try {
    const response = await blogApi.delete(
      `/blogs/${id}`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to delete blog."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE PUBLISH STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/blogs/:id/toggle-publish
|
|--------------------------------------------------------------------------
*/

export const toggleBlogPublishApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  try {
    const response = await blogApi.patch(
      `/blogs/${id}/toggle-publish`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to change blog publish status."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| INCREMENT BLOG VIEWS
|--------------------------------------------------------------------------
|
| PATCH /api/blogs/:id/views
|
|--------------------------------------------------------------------------
*/

export const incrementBlogViewsApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  try {
    const response = await blogApi.patch(
      `/blogs/${id}/views`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to update blog views."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| IMAGE URL HELPERS
|--------------------------------------------------------------------------
|
| Backend may return:
|
| /uploads/blog/image.jpg
|
| uploads/blog/image.jpg
|
| http://...
|
| https://...
|
|--------------------------------------------------------------------------
*/

export const getBlogImageUrl = (imageUrl) => {
  if (
    !imageUrl ||
    typeof imageUrl !== "string"
  ) {
    return null;
  }

  const trimmedUrl = imageUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Absolute URLs
  |--------------------------------------------------------------------------
  */

  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("data:")
  ) {
    return trimmedUrl;
  }

  /*
  |--------------------------------------------------------------------------
  | Relative URL
  |--------------------------------------------------------------------------
  */

  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  return `/${trimmedUrl}`;
};

/*
|--------------------------------------------------------------------------
| GET IMAGE FROM BLOG OBJECT
|--------------------------------------------------------------------------
*/

export const getBlogImage = (blog) => {
  if (!blog) {
    return null;
  }

  return getBlogImageUrl(
    blog.image_url ||
      blog.imageUrl ||
      blog.image ||
      null
  );
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default blogApi;