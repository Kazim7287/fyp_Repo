import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const blogApi = axios.create({
  baseURL: API_URL,

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

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (status && status !== "all") {
    params.status = status;
  }

  if (category && category !== "all") {
    params.category = category;
  }

  const response = await blogApi.get(
    "/blogs",
    {
      params,
    }
  );

  return response.data;
};


// =========================================================
// GET SINGLE BLOG
// =========================================================

export const getBlogApi = async (id) => {
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

export const createBlogApi = async (blogData) => {

  const formData =
    new FormData();

  formData.append(
    "title",
    blogData.title
  );

  formData.append(
    "category",
    blogData.category
  );

  formData.append(
    "status",
    blogData.status
  );

  formData.append(
    "featured",
    String(
      Boolean(blogData.featured)
    )
  );

  formData.append(
    "excerpt",
    blogData.excerpt
  );

  formData.append(
    "content",
    blogData.content
  );

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------

  if (blogData.image) {
    formData.append(
      "image",
      blogData.image
    );
  }

  const response =
    await blogApi.post(
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

  const formData =
    new FormData();

  formData.append(
    "title",
    blogData.title
  );

  formData.append(
    "category",
    blogData.category
  );

  formData.append(
    "status",
    blogData.status
  );

  formData.append(
    "featured",
    String(
      Boolean(blogData.featured)
    )
  );

  formData.append(
    "excerpt",
    blogData.excerpt
  );

  formData.append(
    "content",
    blogData.content
  );

  // -------------------------------------------------------
  // Only send image if user selected a new one
  // -------------------------------------------------------

  if (blogData.image) {
    formData.append(
      "image",
      blogData.image
    );
  }

  const response =
    await blogApi.put(
      `/blogs/${id}`,
      formData
    );

  return response.data;
};


// =========================================================
// DELETE BLOG
// =========================================================

export const deleteBlogApi = async (
  id
) => {

  const response =
    await blogApi.delete(
      `/blogs/${id}`
    );

  return response.data;
};


// =========================================================
// TOGGLE PUBLISH
// =========================================================

export const toggleBlogPublishApi =
  async (id) => {

    const response =
      await blogApi.patch(
        `/blogs/${id}/toggle-publish`
      );

    return response.data;
  };


// =========================================================
// INCREMENT VIEWS
// =========================================================

export const incrementBlogViewsApi =
  async (id) => {

    const response =
      await blogApi.patch(
        `/blogs/${id}/views`
      );

    return response.data;
  };


// =========================================================
// EXPORT AXIOS INSTANCE
// =========================================================

export default blogApi;