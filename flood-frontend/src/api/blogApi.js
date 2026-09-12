import axios from "axios";

/*
|--------------------------------------------------------------------------
| Blog API
|--------------------------------------------------------------------------
|
| Frontend requests:
|
|   /api/blogs
|
| Production Nginx:
|
|   /api/* -> http://127.0.0.1:5000/api/*
|
| IMPORTANT:
|
| Do NOT use:
|
|   http://localhost:5000/api
|
| here.
|
|--------------------------------------------------------------------------
*/

const blogApi = axios.create({
  baseURL: "/api",

  withCredentials: true,

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | Do NOT set Content-Type manually.
  |
  | Blog create/update and content-image upload use FormData.
  |
  | Axios/browser automatically creates:
  |
  | multipart/form-data; boundary=...
  |
  |--------------------------------------------------------------------------
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
      console.error(
        "Blog API Network Error:",
        error.message
      );
    } else {
      console.error(
        "Blog API Error:",
        error.message
      );
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
 * Convert API error into a consistent message.
 */
const getApiErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/*
|--------------------------------------------------------------------------
| Extract Blogs
|--------------------------------------------------------------------------
|
| Supported API response formats:
|
| {
|   success: true,
|   data: [...]
| }
|
| {
|   success: true,
|   blogs: [...]
| }
|
| {
|   success: true,
|   data: {
|     blogs: [...]
|   }
| }
|
|--------------------------------------------------------------------------
*/

export const extractBlogs = (responseData) => {
  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.blogs)) {
    return responseData.blogs;
  }

  if (
    Array.isArray(
      responseData?.data?.blogs
    )
  ) {
    return responseData.data.blogs;
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| Extract Pagination
|--------------------------------------------------------------------------
*/

export const extractPagination = (
  responseData
) => {
  const pagination =
    responseData?.pagination ||
    responseData?.data?.pagination ||
    {};

  return {
    page: Number(pagination.page) || 1,

    limit:
      Number(pagination.limit) || 8,

    total:
      Number(pagination.total) || 0,

    totalPages:
      Number(pagination.totalPages) || 0,
  };
};

/*
|--------------------------------------------------------------------------
| Extract Single Blog
|--------------------------------------------------------------------------
*/

export const extractBlog = (
  responseData
) => {
  if (!responseData) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | data: {...}
  |--------------------------------------------------------------------------
  */

  if (
    responseData?.data &&
    !Array.isArray(responseData.data) &&
    typeof responseData.data === "object"
  ) {
    /*
    |--------------------------------------------------------------------------
    | data: { blog: {...} }
    |--------------------------------------------------------------------------
    */

    if (
      responseData.data.blog &&
      typeof responseData.data.blog === "object"
    ) {
      return responseData.data.blog;
    }

    /*
    |--------------------------------------------------------------------------
    | data: {...}
    |--------------------------------------------------------------------------
    */

    return responseData.data;
  }

  /*
  |--------------------------------------------------------------------------
  | blog: {...}
  |--------------------------------------------------------------------------
  */

  if (
    responseData?.blog &&
    typeof responseData.blog === "object"
  ) {
    return responseData.blog;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Normalize Boolean
|--------------------------------------------------------------------------
*/

const normalizeBoolean = (value) => {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
};

/*
|--------------------------------------------------------------------------
| Build Blog FormData
|--------------------------------------------------------------------------
|
| Used by:
|
| POST /api/blogs
| PUT  /api/blogs/:id
|
| Featured image remains a SINGLE image.
|
|--------------------------------------------------------------------------
*/

const buildBlogFormData = (
  blogData = {}
) => {
  const formData = new FormData();

  /*
  |--------------------------------------------------------------------------
  | Title
  |--------------------------------------------------------------------------
  */

  formData.append(
    "title",
    typeof blogData.title === "string"
      ? blogData.title.trim()
      : ""
  );

  /*
  |--------------------------------------------------------------------------
  | Category
  |--------------------------------------------------------------------------
  */

  formData.append(
    "category",
    typeof blogData.category === "string"
      ? blogData.category.trim()
      : ""
  );

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  formData.append(
    "status",
    blogData.status || "Draft"
  );

  /*
  |--------------------------------------------------------------------------
  | Featured
  |--------------------------------------------------------------------------
  */

  formData.append(
    "featured",
    String(
      normalizeBoolean(
        blogData.featured
      )
    )
  );

  /*
  |--------------------------------------------------------------------------
  | Excerpt
  |--------------------------------------------------------------------------
  */

  formData.append(
    "excerpt",
    typeof blogData.excerpt === "string"
      ? blogData.excerpt.trim()
      : ""
  );

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Multiple article images are stored inside this HTML.
  |
  | Example:
  |
  | <p>Text</p>
  | <p><img src="/uploads/blogs/content-123.jpg"></p>
  | <p>More text</p>
  | <p><img src="/uploads/blogs/content-456.png"></p>
  |
  |--------------------------------------------------------------------------
  */

  formData.append(
    "content",
    typeof blogData.content === "string"
      ? blogData.content
      : ""
  );

  /*
  |--------------------------------------------------------------------------
  | Featured Image
  |--------------------------------------------------------------------------
  |
  | Only one featured image.
  |
  |--------------------------------------------------------------------------
  */

  if (blogData.image instanceof File) {
    formData.append(
      "image",
      blogData.image
    );
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
      params.search =
        search.trim();
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

    const response =
      await blogApi.get(
        "/blogs",
        {
          params,
        }
      );

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

export const getBlogApi = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Blog ID is required."
    );
  }

  try {
    const response =
      await blogApi.get(
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

export const getBlogStatsApi =
  async () => {
    try {
      const response =
        await blogApi.get(
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
| FormData:
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

export const createBlogApi = async (
  blogData = {}
) => {
  try {
    const formData =
      buildBlogFormData(
        blogData
      );

    const response =
      await blogApi.post(
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
| UPLOAD BLOG CONTENT IMAGE
|--------------------------------------------------------------------------
|
| POST /api/blogs/upload-image
|
| This endpoint is specifically for images inserted
| inside the ReactQuill article.
|
| Field:
|
|   contentImage
|
| The server returns an image URL.
|
| Example:
|
| /uploads/blogs/content-1788972868487-123456.jpg
|
|--------------------------------------------------------------------------
*/

export const uploadBlogContentImageApi =
  async (file) => {
    if (!(file instanceof File)) {
      throw new Error(
        "A valid image file is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Client-side file validation
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      throw new Error(
        "Only JPEG, PNG, WEBP, and GIF images are allowed."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5 MB maximum
    |--------------------------------------------------------------------------
    */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      throw new Error(
        "Image must be 5 MB or smaller."
      );
    }

    try {
      const formData =
        new FormData();

      formData.append(
        "contentImage",
        file
      );

      const response =
        await blogApi.post(
          "/blogs/upload-image",
          formData
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to upload blog content image."
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
| If no featured image is provided:
| existing image remains unchanged.
|
|--------------------------------------------------------------------------
*/

export const updateBlogApi =
  async (
    id,
    blogData = {}
  ) => {
    if (!id) {
      throw new Error(
        "Blog ID is required."
      );
    }

    try {
      const formData =
        buildBlogFormData(
          blogData
        );

      const response =
        await blogApi.put(
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

export const deleteBlogApi =
  async (id) => {
    if (!id) {
      throw new Error(
        "Blog ID is required."
      );
    }

    try {
      const response =
        await blogApi.delete(
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

export const toggleBlogPublishApi =
  async (id) => {
    if (!id) {
      throw new Error(
        "Blog ID is required."
      );
    }

    try {
      const response =
        await blogApi.patch(
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

export const incrementBlogViewsApi =
  async (id) => {
    if (!id) {
      throw new Error(
        "Blog ID is required."
      );
    }

    try {
      const response =
        await blogApi.patch(
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
| /uploads/blogs/image.jpg
|
| uploads/blogs/image.jpg
|
| http://...
|
| https://...
|
|--------------------------------------------------------------------------
*/

export const getBlogImageUrl = (
  imageUrl
) => {
  if (
    !imageUrl ||
    typeof imageUrl !== "string"
  ) {
    return null;
  }

  const trimmedUrl =
    imageUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Absolute URLs
  |--------------------------------------------------------------------------
  */

  if (
    trimmedUrl.startsWith(
      "http://"
    ) ||
    trimmedUrl.startsWith(
      "https://"
    ) ||
    trimmedUrl.startsWith(
      "data:"
    ) ||
    trimmedUrl.startsWith(
      "blob:"
    )
  ) {
    return trimmedUrl;
  }

  /*
  |--------------------------------------------------------------------------
  | Relative URL
  |--------------------------------------------------------------------------
  */

  if (
    trimmedUrl.startsWith("/")
  ) {
    return trimmedUrl;
  }

  return `/${trimmedUrl}`;
};

/*
|--------------------------------------------------------------------------
| GET IMAGE FROM BLOG OBJECT
|--------------------------------------------------------------------------
*/

export const getBlogImage = (
  blog
) => {
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
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default blogApi;