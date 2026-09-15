import api from "./axios";

// =========================================================
// FAQ API
// =========================================================

// Get all FAQs
export const getFAQs = async (params = {}) => {
  const response = await api.get("/faqs", {
    params,
  });

  return response.data;
};

// Get single FAQ
export const getFAQ = async (id) => {
  const response = await api.get(`/faqs/${id}`);

  return response.data;
};

// Get FAQ statistics
export const getFAQStats = async () => {
  const response = await api.get("/faqs/stats");

  return response.data;
};

// Create FAQ
export const createFAQ = async (faqData) => {
  const response = await api.post("/faqs", faqData);

  return response.data;
};

// Update FAQ
export const updateFAQ = async (id, faqData) => {
  const response = await api.put(`/faqs/${id}`, faqData);

  return response.data;
};

// Delete FAQ
export const deleteFAQ = async (id) => {
  const response = await api.delete(`/faqs/${id}`);

  return response.data;
};

// Update FAQ status
export const updateFAQStatus = async (id, status) => {
  const response = await api.patch(`/faqs/${id}/status`, {
    status,
  });

  return response.data;
};

// Update FAQ featured status
export const updateFAQFeatured = async (id, featured) => {
  const response = await api.patch(`/faqs/${id}/featured`, {
    featured,
  });

  return response.data;
};