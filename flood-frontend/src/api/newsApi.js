
import axios from "axios";

// =========================================================
// AXIOS INSTANCE
// =========================================================

const newsApi = axios.create({
  baseURL: "/api",
  withCredentials: true,

  headers: {
    Accept: "application/json",
  },

  timeout: 20000,
});

// =========================================================
// RESPONSE EXTRACTOR
// =========================================================

const extractData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

// =========================================================
// NORMALIZE NEWS ITEM
// =========================================================

const normalizeNews = (item) => {
  if (!item) {
    return null;
  }

  return {
    ...item,

    // Backend snake_case → frontend camelCase
    publishedAt:
      item.published_at ??
      item.publishedAt ??
      null,

    createdAt:
      item.created_at ??
      item.createdAt ??
      null,

    updatedAt:
      item.updated_at ??
      item.updatedAt ??
      null,

    authorId:
      item.author_id ??
      item.authorId ??
      null,

    // Keep both possible backend/frontend author names
    authorName:
      item.author_name ??
      item.authorName ??
      null,

    // Ensure featured is always boolean
    featured:
      item.featured === true ||
      item.featured === "true" ||
      item.featured === 1 ||
      item.featured === "1",
  };
};

// =========================================================
// GET ALL NEWS
// =========================================================
//
// GET /api/news
//
// Supported filters:
// {
//   status,
//   category,
//   search
// }
//
// =========================================================

export const getNewsApi = async (params = {}) => {
  const response = await newsApi.get("/news", {
    params,
  });

  const data = extractData(response);

  // Backend normally returns an array
  if (Array.isArray(data)) {
    return data.map(normalizeNews);
  }

  // Support paginated/object responses as well
  if (data && Array.isArray(data.news)) {
    return {
      ...data,
      news: data.news.map(normalizeNews),
    };
  }

  return data;
};

// =========================================================
// GET SINGLE NEWS
// =========================================================
//
// GET /api/news/:id
//
// =========================================================

export const getNewsApiById = async (id) => {
  if (!id) {
    throw new Error("News ID is required.");
  }

  const response = await newsApi.get(
    `/news/${id}`
  );

  return normalizeNews(
    extractData(response)
  );
};

// =========================================================
// GET NEWS STATISTICS
// =========================================================
//
// GET /api/news/stats
//
// Admin only
//
// =========================================================

export const getNewsStatsApi = async () => {
  const response = await newsApi.get(
    "/news/stats"
  );

  return extractData(response);
};

// =========================================================
// CREATE NEWS
// =========================================================
//
// POST /api/news
//
// Payload:
// {
//   title,
//   category,
//   description,
//   published_at,
//   status,
//   featured
// }
//
// =========================================================

export const createNewsApi = async (newsData) => {
  const response = await newsApi.post(
    "/news",
    newsData
  );

  return normalizeNews(
    extractData(response)
  );
};

// =========================================================
// UPDATE NEWS
// =========================================================
//
// PUT /api/news/:id
//
// =========================================================

export const updateNewsApi = async (
  id,
  newsData
) => {
  if (!id) {
    throw new Error("News ID is required.");
  }

  const response = await newsApi.put(
    `/news/${id}`,
    newsData
  );

  return normalizeNews(
    extractData(response)
  );
};

// =========================================================
// DELETE NEWS
// =========================================================
//
// DELETE /api/news/:id
//
// =========================================================

export const deleteNewsApi = async (id) => {
  if (!id) {
    throw new Error("News ID is required.");
  }

  const response = await newsApi.delete(
    `/news/${id}`
  );

  return extractData(response);
};

// =========================================================
// UPDATE NEWS STATUS
// =========================================================
//
// PATCH /api/news/:id/status
//
// Payload:
// {
//   status: "Draft" | "Published"
// }
//
// =========================================================

export const updateNewsStatusApi = async (
  id,
  status
) => {
  if (!id) {
    throw new Error("News ID is required.");
  }

  if (!["Draft", "Published"].includes(status)) {
    throw new Error(
      "Status must be Draft or Published."
    );
  }

  const response = await newsApi.patch(
    `/news/${id}/status`,
    {
      status,
    }
  );

  return normalizeNews(
    extractData(response)
  );
};

// =========================================================
// UPDATE NEWS FEATURED
// =========================================================
//
// PATCH /api/news/:id/featured
//
// Payload:
// {
//   featured: true | false
// }
//
// =========================================================

export const updateNewsFeaturedApi = async (
  id,
  featured
) => {
  if (!id) {
    throw new Error("News ID is required.");
  }

  const response = await newsApi.patch(
    `/news/${id}/featured`,
    {
      featured: Boolean(featured),
    }
  );

  return normalizeNews(
    extractData(response)
  );
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default newsApi;
