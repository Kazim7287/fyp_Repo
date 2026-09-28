
const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const {
  wrapper,
} = require("axios-cookiejar-support");

// ============================================================
// TOLTHAWK CONFIGURATION
// ============================================================

const TOLTHAWK_BASE_URL =
  "https://sensors.tolthawk.com";

const TOLTHAWK_LOGIN_URL =
  `${TOLTHAWK_BASE_URL}/Account/Login`;

const TOLTHAWK_SENSOR_URL =
  `${TOLTHAWK_BASE_URL}/api/SynchronizedCharts/GetSynchronizedCharts`;

// ============================================================
// CREATE AUTHENTICATED TOLTHAWK CLIENT
// ============================================================

const createTolthawkClient = () => {
  const jar = new CookieJar();

  const client = wrapper(
    axios.create({
      baseURL: TOLTHAWK_BASE_URL,

      jar,

      withCredentials: true,

      timeout: 30000,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/153.0.0.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml," +
          "application/xml;q=0.9,image/avif," +
          "image/webp,*/*;q=0.8",
      },
    })
  );

  return client;
};

// ============================================================
// LOGIN TO TOLTHAWK
// ============================================================

const loginToTolthawk = async (client) => {
  const email =
    process.env.TOLTHAWK_EMAIL;

  const password =
    process.env.TOLTHAWK_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TOLTHAWK_EMAIL and TOLTHAWK_PASSWORD are missing from .env"
    );
  }

  // ----------------------------------------------------------
  // STEP 1:
  // Open login page
  // ----------------------------------------------------------

  const loginPage =
    await client.get(
      TOLTHAWK_LOGIN_URL,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml," +
            "application/xml;q=0.9,image/avif," +
            "image/webp,*/*;q=0.8",
        },
      }
    );

  // ----------------------------------------------------------
  // STEP 2:
  // Extract anti-forgery token
  // ----------------------------------------------------------

  const $ =
    cheerio.load(loginPage.data);

  const verificationToken =
    $(
      'input[name="__RequestVerificationToken"]'
    ).val();

  if (!verificationToken) {
    throw new Error(
      "Tolthawk login verification token was not found."
    );
  }

  // ----------------------------------------------------------
  // STEP 3:
  // Submit login form
  // ----------------------------------------------------------

  const formData =
    new URLSearchParams();

  formData.append(
    "Email",
    email
  );

  formData.append(
    "Password",
    password
  );

  formData.append(
    "__RequestVerificationToken",
    verificationToken
  );

  formData.append(
    "RememberMe",
    "false"
  );

  const loginResponse =
    await client.post(
      TOLTHAWK_LOGIN_URL,
      formData.toString(),
      {
        maxRedirects: 5,

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/153.0.0.0 Safari/537.36",

          Referer:
            TOLTHAWK_LOGIN_URL,

          Origin:
            TOLTHAWK_BASE_URL,
        },
      }
    );

  // ----------------------------------------------------------
  // STEP 4:
  // Detect unsuccessful login
  // ----------------------------------------------------------

  const finalUrl =
    loginResponse.request?.res?.responseUrl ||
    "";

  const responseHtml =
    typeof loginResponse.data ===
    "string"
      ? loginResponse.data
      : "";

  const stillOnLoginPage =
    finalUrl.includes(
      "/Account/Login"
    );

  const loginFailed =
    stillOnLoginPage &&
    (
      responseHtml.includes(
        "Invalid login"
      ) ||
      responseHtml.includes(
        "invalid"
      ) ||
      responseHtml.includes(
        "incorrect"
      ) ||
      responseHtml.includes(
        "Login failed"
      )
    );

  if (loginFailed) {
    throw new Error(
      "Tolthawk login failed. Check TOLTHAWK_EMAIL and TOLTHAWK_PASSWORD."
    );
  }

  // ----------------------------------------------------------
  // STEP 5:
  // Check whether authenticated session exists
  // ----------------------------------------------------------

  const cookies =
    await client.defaults.jar.getCookies(
      TOLTHAWK_BASE_URL
    );

  if (!cookies.length) {
    throw new Error(
      "Tolthawk login completed but no authentication cookie was received."
    );
  }

  console.log(
    "✅ Tolthawk authentication successful."
  );

  return true;
};

// ============================================================
// FETCH TOLTHAWK SENSOR DATA
// ============================================================

const fetchSensorData = async ({
  locationId =
    Number(
      process.env.TOLTHAWK_LOCATION_ID
    ) || 868,

  chartOptions = 5,

  fromDateTime,

  toDateTime,

  tzOffset = 300,

  isFiltered = false,

  weatherIds = "",

  tidalId = "",

  tidalDatum = "",
} = {}) => {
  try {
    // --------------------------------------------------------
    // Validate dates
    // --------------------------------------------------------

    if (
      !fromDateTime ||
      !toDateTime
    ) {
      throw new Error(
        "fromDateTime and toDateTime are required."
      );
    }

    // --------------------------------------------------------
    // Create fresh authenticated client
    // --------------------------------------------------------

    const client =
      createTolthawkClient();

    // --------------------------------------------------------
    // Login
    // --------------------------------------------------------

    await loginToTolthawk(
      client
    );

    // --------------------------------------------------------
    // Request sensor data
    // --------------------------------------------------------

    console.log(
      `Fetching Tolthawk sensor data for location ${locationId}...`
    );

    const response =
      await client.get(
        TOLTHAWK_SENSOR_URL,
        {
          params: {
            ids: locationId,

            chartOptions,

            fromDateTime,

            toDateTime,

            tzOffset,

            isFiltered,

            weatherIds,

            tidalId,

            tidalDatum,
          },

          headers: {
            Accept:
              "application/json, text/plain, */*",

            Referer:
              `${TOLTHAWK_BASE_URL}/Dashboard/Index`,

            "X-Requested-With":
              "XMLHttpRequest",
          },
        }
      );

    // --------------------------------------------------------
    // Check API response
    // --------------------------------------------------------

    const result =
      response.data;

    if (
      result?.error
    ) {
      throw new Error(
        `Tolthawk API error: ${result.error}`
      );
    }

    if (
      !result?.data?.locations
    ) {
      console.error(
        "Unexpected Tolthawk response:",
        JSON.stringify(
          result,
          null,
          2
        )
      );

      throw new Error(
        "Invalid response from Tolthawk API"
      );
    }

    // --------------------------------------------------------
    // Get requested location
    // --------------------------------------------------------

    const location =
      result.data.locations[
        String(locationId)
      ];

    if (!location) {
      throw new Error(
        `Location ${locationId} was not found in Tolthawk response.`
      );
    }

    // --------------------------------------------------------
    // Get sensor 5
    // --------------------------------------------------------

    const sensor =
      location.sensorData?.["5"];

    if (!sensor) {
      throw new Error(
        `Sensor 5 was not found for location ${locationId}.`
      );
    }

    // --------------------------------------------------------
    // Get first chart
    // --------------------------------------------------------

    const chart =
      sensor.chartData?.[0];

    if (!chart) {
      throw new Error(
        `No chart data found for sensor ${sensor.sensorId}.`
      );
    }

    // --------------------------------------------------------
    // Extract data points
    // --------------------------------------------------------

    const dataPoints =
      Array.isArray(
        chart.dataPoints
      )
        ? chart.dataPoints
        : [];

    const readings =
      dataPoints
        .filter(
          (point) =>
            point.x !== undefined &&
            point.y !== undefined
        )
        .map(
          (point) => ({
            locationId:
              location.locationId,

            locationName:
              location.locationName,

            sensorId:
              sensor.sensorId,

            sensorType:
              sensor.sensorType,

            timestamp:
              Number(point.x),

            level:
              Number(point.y),

            seaLevel:
              point.seaLevel !==
                undefined
                ? Number(
                    point.seaLevel
                  )
                : null,

            unit:
              point.dataPointSymbol ||
              "ft",
          })
        )
        .filter(
          (reading) =>
            !Number.isNaN(
              reading.timestamp
            ) &&
            !Number.isNaN(
              reading.level
            )
        );

    // --------------------------------------------------------
    // Return normalized sensor data
    // --------------------------------------------------------

    return {
      locationId:
        location.locationId,

      locationName:
        location.locationName,

      sensorId:
        sensor.sensorId,

      sensorType:
        sensor.sensorType,

      chartId:
        chart.chartId,

      axisTitle:
        chart.axisY?.title ||
        "Level/Stage",

      floodCategories:
        chart.floodCategories ||
        [],

      seaLevelReference:
        chart.seaLevel !==
          undefined
          ? Number(
              chart.seaLevel
            )
          : null,

      readings,
    };
  } catch (error) {
    console.error(
      "Tolthawk Sensor Service Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch Tolthawk sensor data."
    );
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  fetchSensorData,
};
