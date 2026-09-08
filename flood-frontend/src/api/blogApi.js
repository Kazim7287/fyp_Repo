import axios from "axios";

// =========================================================
// AXIOS API INSTANCE
// =========================================================

const blogApi = axios.create({
  baseURL: "/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
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

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (status && status !== "all") {
    params.status = status;
  }

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
  const response = await blogApi.get(`/blogs/${id}`);

  return response.data;
};


// =========================================================
// GET BLOG STATISTICS
// =========================================================

export const getBlogStatsApi = async () => {
  const response = await blogApi.get("/blogs/stats");

  return response.data;
};


// =========================================================
// CREATE BLOG
// =========================================================

export const createBlogApi = async (blogData) => {
  const formData = new FormData();

  formData.append("title", blogData.title || "");
  formData.append("category", blogData.category || "");
  formData.append("status", blogData.status || "Draft");
  formData.append(
    "featured",
    String(Boolean(blogData.featured))
  );
  formData.append("excerpt", blogData.excerpt || "");
  formData.append("content", blogData.content || "");

  if (blogData.image instanceof File) {
    formData.append("image", blogData.image);
  }

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
  blogData
) => {
  const formData = new FormData();

  formData.append("title", blogData.title || "");
  formData.append("category", blogData.category || "");
  formData.append("status", blogData.status || "Draft");
  formData.append(
    "featured",
    String(Boolean(blogData.featured))
  );
  formData.append("excerpt", blogData.excerpt || "");
  formData.append("content", blogData.content || "");

  // Only upload a new image if one was selected.
  if (blogData.image instanceof File) {
    formData.append("image", blogData.image);
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
  const response = await blogApi.delete(
    `/blogs/${id}`
  );

  return response.data;
};


// =========================================================
// TOGGLE PUBLISH STATUS
// =========================================================

export const toggleBlogPublishApi = async (id) => {
  const response = await blogApi.patch(
    `/blogs/${id}/toggle-publish`
  );

  return response.data;
};


// =========================================================
// INCREMENT BLOG VIEWS
// =========================================================

export const incrementBlogViewsApi = async (id) => {
  const response = await blogApi.patch(
    `/blogs/${id}/views`
  );

  return response.data;
};


// =========================================================
// BLOG IMAGE URL
// =========================================================

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

  // Relative image path
  return imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;
};


// =========================================================
// BLOG IMAGE NORMALIZER
// =========================================================

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