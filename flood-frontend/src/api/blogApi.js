import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================
//
// Development:
// VITE_API_URL=http://localhost:5000/api
//
// Production:
// VITE_API_URL=/api
//
// If VITE_API_URL is not defined, use /api.
// This is important for production because Nginx proxies
// /api requests to the Node.js backend.
//

const API_URL =
  import.meta.env.VITE_API_URL || "/api";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const blogApi = axios.create({
  baseURL: API_URL,

  // Required because your authentication uses cookies/JWT.
  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});


// =========================================================
// GET BLOGS
// =========================================================

export const getBlogsApi = async ({
  search = "",
  status = "all",
  category = "all",
  page = 1,
  limit = 8,
} = {}) => {
  const params = {
    page,
    limit,
  };

  // -------------------------------------------------------
  // SEARCH
  // -------------------------------------------------------

  if (search?.trim()) {
    params.search = search.trim();
  }

  // -------------------------------------------------------
  // STATUS FILTER
  // -------------------------------------------------------

  if (status && status !== "all") {
    params.status = status;
  }

  // -------------------------------------------------------
  // CATEGORY FILTER
  // -------------------------------------------------------

  if (category && category !== "all") {
    params.category = category;
  }

  const response = await blogApi.get("/blogs", {
    params,
  });

  return response.data;
};


// =========================================================
// GET SINGLE BLOG
// =========================================================

export const getBlogApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const response = await blogApi.get(
    `/blogs/${id}`
  );

  return response.data;
};


// =========================================================
// GET BLOG STATISTICS
// =========================================================

export const getBlogStatsApi = async () => {
  const response = await blogApi.get(
    "/blogs/stats"
  );

  return response.data;
};


// =========================================================
// CREATE BLOG
// =========================================================

export const createBlogApi = async (blogData = {}) => {
  const formData = new FormData();

  // -------------------------------------------------------
  // TEXT FIELDS
  // -------------------------------------------------------

  formData.append(
    "title",
    blogData.title?.trim() || ""
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
    blogData.excerpt?.trim() || ""
  );

  formData.append(
    "content",
    blogData.content || ""
  );

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------

  if (blogData.image instanceof File) {
    formData.append(
      "image",
      blogData.image
    );
  }

  // -------------------------------------------------------
  // REQUEST
  // -------------------------------------------------------
  //
  // Do NOT manually set:
  // Content-Type: multipart/form-data
  //
  // The browser automatically adds the required boundary.
  //

  const response = await blogApi.post(
    "/blogs",
    formData
  );

  return response.data;
};


// =========================================================
// UPDATE BLOG
// =========================================================

export const updateBlogApi = async (
  id,
  blogData = {}
) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const formData = new FormData();

  // -------------------------------------------------------
  // TEXT FIELDS
  // -------------------------------------------------------

  formData.append(
    "title",
    blogData.title?.trim() || ""
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
    blogData.excerpt?.trim() || ""
  );

  formData.append(
    "content",
    blogData.content || ""
  );

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------
  //
  // Only send an image when the user selected a NEW image.
  //
  // If no image is provided, the backend should keep the
  // existing image.
  //

  if (blogData.image instanceof File) {
    formData.append(
      "image",
      blogData.image
    );
  }

  const response = await blogApi.put(
    `/blogs/${id}`,
    formData
  );

  return response.data;
};


// =========================================================
// DELETE BLOG
// =========================================================

export const deleteBlogApi = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const response = await blogApi.delete(
    `/blogs/${id}`
  );

  return response.data;
};


// =========================================================
// TOGGLE BLOG PUBLISH STATUS
// =========================================================

export const toggleBlogPublishApi = async (
  id
) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const response = await blogApi.patch(
    `/blogs/${id}/toggle-publish`
  );

  return response.data;
};


// =========================================================
// INCREMENT BLOG VIEWS
// =========================================================

export const incrementBlogViewsApi = async (
  id
) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const response = await blogApi.patch(
    `/blogs/${id}/views`
  );

  return response.data;
};


// =========================================================
// IMAGE URL HELPER
// =========================================================
//
// Database examples:
//
// /uploads/blog/example.jpg
//
// uploads/blog/example.jpg
//
// https://example.com/uploads/blog/example.jpg
//
// For relative paths, use the current domain.
// This makes images work both locally and in production.
//

export const getBlogImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // Already an absolute URL
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Make sure the path starts with /
  return imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;
};


// =========================================================
// NORMALIZE BLOG IMAGE
// =========================================================
//
// Optional helper if backend sometimes returns:
//
// image_url
// imageUrl
// image
//

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


// =========================================================
// EXPORT AXIOS INSTANCE
// =========================================================

export default blogApi;