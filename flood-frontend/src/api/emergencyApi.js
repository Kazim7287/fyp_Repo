import axios from "axios";


// =========================================================
// AXIOS CONFIGURATION
// =========================================================
//
// Production:
//     /api
//
// Development:
//     /api
//
// Nginx forwards:
//
//     /api/*
//          ↓
//     Node/Express backend
//
// Using a relative URL also prevents the frontend from
// trying to call localhost after deployment.
// =========================================================

const API_BASE_URL = "/api/emergency-information";


// =========================================================
// GET EMERGENCY INFORMATION
// =========================================================
//
// Returns emergency information.
//
// Optional filters:
//
// {
//   node_id: 2,
//   status: "WATCH",
//   active_emergency: true
// }
//
// =========================================================

export const getEmergencyInformation = async (
  params = {}
) => {

  const response = await axios.get(
    API_BASE_URL,
    {
      params,
      withCredentials: true,
    }
  );

  return response.data;
};


// =========================================================
// GET EMERGENCY INFORMATION BY ID
// =========================================================
//
// Example:
//
// getEmergencyInformationById(1)
//
// =========================================================

export const getEmergencyInformationById = async (
  id
) => {

  const response = await axios.get(
    `${API_BASE_URL}/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};


// =========================================================
// CREATE EMERGENCY INFORMATION
// =========================================================
//
// Admin only.
//
// Example:
//
// createEmergencyInformation({
//   nodeId: 2,
//   status: "WATCH",
//   affectedArea: "...",
//   activeEmergency: false,
//   message: "...",
//   evacuationRequired: false,
//   safeLocations: [...]
// })
//
// =========================================================

export const createEmergencyInformation = async (
  data
) => {

  const response = await axios.post(
    API_BASE_URL,
    data,
    {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};


// =========================================================
// UPDATE EMERGENCY INFORMATION
// =========================================================
//
// Admin only.
//
// Supports partial updates.
//
// =========================================================

export const updateEmergencyInformation = async (
  id,
  data
) => {

  const response = await axios.put(
    `${API_BASE_URL}/${id}`,
    data,
    {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};


// =========================================================
// DELETE EMERGENCY INFORMATION
// =========================================================
//
// Admin only.
//
// =========================================================

export const deleteEmergencyInformation = async (
  id
) => {

  const response = await axios.delete(
    `${API_BASE_URL}/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};


// =========================================================
// EXPORT
// =========================================================

export default {
  getEmergencyInformation,
  getEmergencyInformationById,
  createEmergencyInformation,
  updateEmergencyInformation,
  deleteEmergencyInformation,
};