import axios from "axios";

/*
|--------------------------------------------------------------------------
| Announcement API
|--------------------------------------------------------------------------
|
| Frontend requests:
|
|   /api/announcements
|
| Production Nginx:
|
|   /api/* -> http://127.0.0.1:5000/api/*
|
| Authentication:
|
|   JWT is stored in the HTTP-only accessToken cookie.
|
| IMPORTANT:
|
|   withCredentials: true
|   is required so the browser sends the authentication cookie.
|
|--------------------------------------------------------------------------
*/

const announcementApi = axios.create({
  baseURL: "/api",

  withCredentials: true,

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

announcementApi.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response) {
      console.error("Announcement API Error:", {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error(
        "Announcement API Network Error:",
        error.message
      );
    } else {
      console.error(
        "Announcement API Error:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| API ERROR HELPER
|--------------------------------------------------------------------------
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
| GET ALL ANNOUNCEMENTS
|--------------------------------------------------------------------------
|
| GET /api/announcements
|
| Supported filters:
|
|   search
|   status
|   category
|   priority
|
|--------------------------------------------------------------------------
*/

export const getAnnouncementsApi = async ({
  search = "",
  status = "all",
  category = "all",
  priority = "all",
} = {}) => {
  try {
    const params = {};

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

    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    if (
      priority &&
      priority !== "all"
    ) {
      params.priority = priority;
    }

    const response = await announcementApi.get(
      "/announcements",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to fetch announcements."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ANNOUNCEMENT
|--------------------------------------------------------------------------
|
| GET /api/announcements/:id
|
|--------------------------------------------------------------------------
*/

export const getAnnouncementApi = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Announcement ID is required."
    );
  }

  try {
    const response =
      await announcementApi.get(
        `/announcements/${id}`
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to fetch announcement."
      )
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET ANNOUNCEMENT STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/announcements/stats
|
| ADMIN ONLY
|
|--------------------------------------------------------------------------
*/

export const getAnnouncementStatsApi =
  async () => {
    try {
      const response =
        await announcementApi.get(
          "/announcements/stats"
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to fetch announcement statistics."
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| CREATE ANNOUNCEMENT
|--------------------------------------------------------------------------
|
| POST /api/announcements
|
| JSON body:
|
|   title
|   category
|   priority
|   status
|   published_at
|   expires_at
|   content
|
| ADMIN ONLY
|
|--------------------------------------------------------------------------
*/

export const createAnnouncementApi =
  async (announcementData = {}) => {
    try {
      const payload = {
        title:
          typeof announcementData.title ===
          "string"
            ? announcementData.title.trim()
            : "",

        category:
          typeof announcementData.category ===
          "string"
            ? announcementData.category.trim()
            : "",

        priority:
          announcementData.priority ||
          "Medium",

        status:
          announcementData.status ||
          "Draft",

        publishedAt:
          announcementData.publishedAt ||
          null,

        expiresAt:
          announcementData.expiresAt ||
          null,

        content:
          typeof announcementData.content ===
          "string"
            ? announcementData.content.trim()
            : "",
      };

      const response =
        await announcementApi.post(
          "/announcements",
          payload
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to create announcement."
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE ANNOUNCEMENT
|--------------------------------------------------------------------------
|
| PUT /api/announcements/:id
|
| ADMIN ONLY
|
|--------------------------------------------------------------------------
*/

export const updateAnnouncementApi =
  async (
    id,
    announcementData = {}
  ) => {
    if (!id) {
      throw new Error(
        "Announcement ID is required."
      );
    }

    try {
      const payload = {
        title:
          typeof announcementData.title ===
          "string"
            ? announcementData.title.trim()
            : "",

        category:
          typeof announcementData.category ===
          "string"
            ? announcementData.category.trim()
            : "",

        priority:
          announcementData.priority ||
          "Medium",

        status:
          announcementData.status ||
          "Draft",

        publishedAt:
          announcementData.publishedAt ||
          null,

        expiresAt:
          announcementData.expiresAt ||
          null,

        content:
          typeof announcementData.content ===
          "string"
            ? announcementData.content.trim()
            : "",
      };

      const response =
        await announcementApi.put(
          `/announcements/${id}`,
          payload
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to update announcement."
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| DELETE ANNOUNCEMENT
|--------------------------------------------------------------------------
|
| DELETE /api/announcements/:id
|
| ADMIN ONLY
|
|--------------------------------------------------------------------------
*/

export const deleteAnnouncementApi =
  async (id) => {
    if (!id) {
      throw new Error(
        "Announcement ID is required."
      );
    }

    try {
      const response =
        await announcementApi.delete(
          `/announcements/${id}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to delete announcement."
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE ANNOUNCEMENT STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/announcements/:id/status
|
| ADMIN ONLY
|
| Body:
|
|   { status: "Published" }
|
|--------------------------------------------------------------------------
*/

export const updateAnnouncementStatusApi =
  async (
    id,
    status
  ) => {
    if (!id) {
      throw new Error(
        "Announcement ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Announcement status is required."
      );
    }

    const allowedStatuses = [
      "Draft",
      "Published",
      "Archived",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      throw new Error(
        "Invalid announcement status."
      );
    }

    try {
      const response =
        await announcementApi.patch(
          `/announcements/${id}/status`,
          {
            status,
          }
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to update announcement status."
        )
      );
    }
  };

/*
|--------------------------------------------------------------------------
| EXTRACT ANNOUNCEMENTS
|--------------------------------------------------------------------------
|
| Supports:
|
| {
|   success: true,
|   data: [...]
| }
|
| {
|   success: true,
|   announcements: [...]
| }
|
| {
|   success: true,
|   data: {
|     announcements: [...]
|   }
| }
|
|--------------------------------------------------------------------------
*/

export const extractAnnouncements = (
  responseData
) => {
  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData?.announcements
    )
  ) {
    return responseData.announcements;
  }

  if (
    Array.isArray(
      responseData?.data?.announcements
    )
  ) {
    return responseData.data.announcements;
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| EXTRACT SINGLE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

export const extractAnnouncement = (
  responseData
) => {
  if (!responseData) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | data: { announcement: {...} }
  |--------------------------------------------------------------------------
  */

  if (
    responseData?.data &&
    !Array.isArray(responseData.data) &&
    typeof responseData.data ===
      "object"
  ) {
    if (
      responseData.data.announcement &&
      typeof responseData.data.announcement ===
        "object"
    ) {
      return responseData.data.announcement;
    }

    return responseData.data;
  }

  /*
  |--------------------------------------------------------------------------
  | announcement: {...}
  |--------------------------------------------------------------------------
  */

  if (
    responseData?.announcement &&
    typeof responseData.announcement ===
      "object"
  ) {
    return responseData.announcement;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| EXTRACT STATISTICS
|--------------------------------------------------------------------------
*/

export const extractAnnouncementStats = (
  responseData
) => {
  if (
    responseData?.data &&
    typeof responseData.data ===
      "object" &&
    !Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  return responseData || {};
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default announcementApi;