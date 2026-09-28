
const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

// ============================================================
// TOLTHAWK CONFIGURATION
// ============================================================

const TOLTHAWK_BASE_URL =
  "https://sensors.tolthawk.com";

const TOLTHAWK_LOGIN_URL =
  `${TOLTHAWK_BASE_URL}/Account/Login`;

const TOLTHAWK_DASHBOARD_URL =
  `${TOLTHAWK_BASE_URL}/Dashboard/Index`;

const TOLTHAWK_SENSOR_API =
  `${TOLTHAWK_BASE_URL}/api/SynchronizedCharts/GetSynchronizedCharts`;

// ============================================================
// CREATE TOLTHAWK CLIENT
// ============================================================

const createTolthawkClient = () => {
  const jar = new CookieJar();

  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      maxRedirects: 5,
      timeout: 30000,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36",
      },
    })
  );

  return {
    client,
    jar,
  };
};

// ============================================================
// LOGIN TO TOLTHAWK
// ============================================================

const loginToTolthawk = async (client) => {
  try {
    console.log(
      "Opening Tolthawk login page..."
    );

    // --------------------------------------------------------
    // GET LOGIN PAGE
    // --------------------------------------------------------

    const loginPage = await client.get(
      TOLTHAWK_LOGIN_URL
    );

    const $ = cheerio.load(
      loginPage.data
    );

    // --------------------------------------------------------
    // GET ANTI-FORGERY TOKEN
    // --------------------------------------------------------

    const verificationToken = $(
      'input[name="__RequestVerificationToken"]'
    ).val();

    if (!verificationToken) {
      throw new Error(
        "Tolthawk verification token was not found."
      );
    }

    // --------------------------------------------------------
    // GET CREDENTIALS
    // --------------------------------------------------------

    const email =
      process.env.TOLTHAWK_EMAIL;

    const password =
      process.env.TOLTHAWK_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "TOLTHAWK_EMAIL or TOLTHAWK_PASSWORD is missing from .env"
      );
    }

    // --------------------------------------------------------
    // CREATE LOGIN FORM
    // --------------------------------------------------------

    const form = new URLSearchParams();

    form.append(
      "Email",
      email
    );

    form.append(
      "Password",
      password
    );

    form.append(
      "__RequestVerificationToken",
      verificationToken
    );

    form.append(
      "RememberMe",
      "false"
    );

    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    console.log(
      "Logging into Tolthawk..."
    );

    const loginResponse =
      await client.post(
        TOLTHAWK_LOGIN_URL,
        form.toString(),
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Referer:
              TOLTHAWK_LOGIN_URL,
          },
        }
      );

    // --------------------------------------------------------
    // CHECK LOGIN RESULT
    // --------------------------------------------------------

    const finalUrl =
      loginResponse.request?.res?.responseUrl ||
      "";

    if (
      finalUrl.includes(
        "/Account/Login"
      )
    ) {
      throw new Error(
        "Tolthawk login failed. Please check TOLTHAWK_EMAIL and TOLTHAWK_PASSWORD."
      );
    }

    console.log(
      "Tolthawk authentication successful."
    );

    return true;
  } catch (error) {
    console.error(
      "Tolthawk Login Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.message ||
        "Tolthawk authentication failed."
    );
  }
};

// ============================================================
// INITIALIZE TOLTHAWK REGION
// ============================================================

const initializeTolthawkRegion = async (
  client,
  jar,
  regionId = 82
) => {
  try {
    console.log(
      `Initializing Tolthawk region ${regionId}...`
    );

    // --------------------------------------------------------
    // IMPORTANT TOLTHAWK REGION COOKIES
    //
    // These were identified from the successful browser
    // request:
    //
    // St=1
    // R=82
    // GR=1
    // --------------------------------------------------------

    await jar.setCookie(
      "St=1",
      TOLTHAWK_BASE_URL
    );

    await jar.setCookie(
      `R=${regionId}`,
      TOLTHAWK_BASE_URL
    );

    await jar.setCookie(
      "GR=1",
      TOLTHAWK_BASE_URL
    );

    // --------------------------------------------------------
    // OPEN DASHBOARD
    // --------------------------------------------------------

    const dashboardResponse =
      await client.get(
        TOLTHAWK_DASHBOARD_URL,
        {
          params: {
            regionId,
          },

          headers: {
            Referer:
              `${TOLTHAWK_BASE_URL}/Home/ChangeRegion`,
          },
        }
      );

    if (
      dashboardResponse.status !== 200
    ) {
      throw new Error(
        `Tolthawk dashboard returned HTTP ${dashboardResponse.status}`
      );
    }

    console.log(
      `Tolthawk region ${regionId} initialized successfully.`
    );

    return true;
  } catch (error) {
    console.error(
      "Tolthawk Region Initialization Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.message ||
        "Failed to initialize Tolthawk region."
    );
  }
};

// ============================================================
// FETCH SENSOR DATA
// ============================================================

const fetchSensorData = async ({
  locationId = 868,
  regionId = 82,
  chartOptions = 5,
  fromDateTime,
  toDateTime,
  tzOffset = 300,
  isFiltered = false,
  isPagedData = true,
  weatherIds = "",
  tidalId = "",
  tidalDatum = "",
} = {}) => {
  try {
    // --------------------------------------------------------
    // VALIDATE DATES
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
    // CREATE CLIENT
    // --------------------------------------------------------

    const {
      client,
      jar,
    } = createTolthawkClient();

    // --------------------------------------------------------
    // 1. LOGIN
    // --------------------------------------------------------

    await loginToTolthawk(
      client
    );

    // --------------------------------------------------------
    // 2. INITIALIZE REGION
    // --------------------------------------------------------

    await initializeTolthawkRegion(
      client,
      jar,
      regionId
    );

    // --------------------------------------------------------
    // 3. FETCH SENSOR DATA
    // --------------------------------------------------------

    console.log(
      `Fetching Tolthawk sensor data for location ${locationId}...`
    );

    const response =
      await client.get(
        TOLTHAWK_SENSOR_API,
        {
          params: {
            ids: locationId,
            chartOptions,
            fromDateTime,
            toDateTime,
            tzOffset,
            isFiltered,
            isPagedData,
            weatherIds,
            tidalId,
            tidalDatum,
          },

          headers: {
            Accept:
              "*/*",

            "Accept-Language":
              "en-GB,en-US;q=0.9,en;q=0.8",

            "X-Requested-With":
              "XMLHttpRequest",

            Referer:
              `${TOLTHAWK_DASHBOARD_URL}?regionId=${regionId}`,

            Origin:
              TOLTHAWK_BASE_URL,
          },
        }
      );

    // --------------------------------------------------------
    // GET API RESPONSE
    // --------------------------------------------------------

    const result =
      response.data;

    // --------------------------------------------------------
    // CHECK TOLTHAWK API ERROR
    // --------------------------------------------------------

    if (result?.error) {
      throw new Error(
        `Tolthawk API error: ${result.error}`
      );
    }

    // --------------------------------------------------------
    // CHECK RESPONSE STRUCTURE
    // --------------------------------------------------------

    if (
      !result?.data?.locations
    ) {
      throw new Error(
        "Invalid response from Tolthawk API."
      );
    }

    // --------------------------------------------------------
    // 4. GET LOCATION
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
    // 5. GET SENSOR 5
    // --------------------------------------------------------

    const sensor =
      location.sensorData?.["5"];

    if (!sensor) {
      throw new Error(
        `Sensor 5 was not found for location ${locationId}.`
      );
    }

    // --------------------------------------------------------
    // 6. GET CHART
    // --------------------------------------------------------

    const chart =
      sensor.chartData?.[0];

    if (!chart) {
      throw new Error(
        `No chart data found for sensor ${sensor.sensorId}.`
      );
    }

    // --------------------------------------------------------
    // 7. GET DATA POINTS
    // --------------------------------------------------------

    const dataPoints =
      chart.dataPoints || [];

    // --------------------------------------------------------
    // NORMALIZE READINGS
    // --------------------------------------------------------

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
              point.seaLevel !== undefined
                ? Number(
                    point.seaLevel
                  )
                : null,

            unit:
              point.dataPointSymbol ||
              "ft",
          })
        );

    console.log(
      `Received ${readings.length} Tolthawk readings.`
    );

    // --------------------------------------------------------
    // 8. RETURN NORMALIZED DATA
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
        chart.seaLevel !== undefined
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
        "Failed to fetch sensor data."
    );
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  fetchSensorData,
  loginToTolthawk,
  initializeTolthawkRegion,
};
