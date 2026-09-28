
import axios from "axios";

// ============================================================
// GET STORED RIVER LEVEL DATA
// ============================================================

export const getRiverLevelData = async ({
  locationId = 868,
  start = "-7d",
  stop = "now()",
  limit = 5000,
} = {}) => {
  const response = await axios.get(
    "/api/sensors/river-level",
    {
      params: {
        locationId,
        start,
        stop,
        limit,
      },
    }
  );

  return response.data;
};
