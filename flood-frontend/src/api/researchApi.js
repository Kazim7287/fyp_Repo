import axios from "axios";

// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL =
  "/api";

// =========================================================
// AXIOS INSTANCE
// =========================================================

const researchApiClient = axios.create({
  baseURL: `${API_BASE_URL}/research`,
  withCredentials: true,
});

// =========================================================
// GET ALL RESEARCH
// =========================================================

export const getResearch = async (params = {}) => {
  const response = await researchApiClient.get("/", {
    params,
  });

  return response.data;
};

// =========================================================
// GET SINGLE RESEARCH
// =========================================================

export const getResearchById = async (id) => {
  const response = await researchApiClient.get(`/${id}`);

  return response.data;
};

// =========================================================
// GET RESEARCH STATISTICS
// =========================================================

export const getResearchStats = async () => {
  const response = await researchApiClient.get("/stats");

  return response.data;
};

// =========================================================
// CREATE RESEARCH
// =========================================================

export const createResearch = async (researchData) => {
  const formData = new FormData();

  formData.append("title", researchData.title);
  formData.append("authors", researchData.authors);
  formData.append("category", researchData.category);
  formData.append("abstract", researchData.abstract);
  formData.append(
    "publicationDate",
    researchData.publicationDate
  );
  formData.append(
    "status",
    researchData.status || "Draft"
  );

  if (researchData.image) {
    formData.append("image", researchData.image);
  }

  const response = await researchApiClient.post(
    "/",
    formData
  );

  return response.data;
};

// =========================================================
// UPLOAD RESEARCH PDF
// =========================================================

export const uploadResearchPdf = async (
  researchId,
  pdfFile
) => {
  const formData = new FormData();

  formData.append("pdf", pdfFile);

  const response = await researchApiClient.post(
    `/${researchId}/pdf`,
    formData
  );

  return response.data;
};

// =========================================================
// UPDATE RESEARCH
// =========================================================

export const updateResearch = async (
  id,
  researchData
) => {
  const formData = new FormData();

  formData.append("title", researchData.title);
  formData.append("authors", researchData.authors);
  formData.append("category", researchData.category);
  formData.append("abstract", researchData.abstract);
  formData.append(
    "publicationDate",
    researchData.publicationDate
  );
  formData.append(
    "status",
    researchData.status || "Draft"
  );

  if (researchData.image) {
    formData.append("image", researchData.image);
  }

  const response = await researchApiClient.put(
    `/${id}`,
    formData
  );

  return response.data;
};

// =========================================================
// DELETE RESEARCH
// =========================================================

export const deleteResearch = async (id) => {
  const response = await researchApiClient.delete(
    `/${id}`
  );

  return response.data;
};

// =========================================================
// TOGGLE RESEARCH STATUS
// =========================================================

export const toggleResearchStatus = async (id) => {
  const response = await researchApiClient.patch(
    `/${id}/toggle-status`
  );

  return response.data;
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {
  getResearch,
  getResearchById,
  getResearchStats,
  createResearch,
  uploadResearchPdf,
  updateResearch,
  deleteResearch,
  toggleResearchStatus,
};