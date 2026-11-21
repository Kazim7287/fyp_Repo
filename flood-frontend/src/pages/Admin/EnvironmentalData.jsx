
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "./styles/EnvironmentalData.css";

import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Alert,
  Spin,
  Select,
  Button,
  message,
  DatePicker,
} from "antd";

import {
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  SearchOutlined,
  DatabaseOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CodeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/*
|--------------------------------------------------------------------------
| External APIs
|--------------------------------------------------------------------------
*/

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

/*
|--------------------------------------------------------------------------
| Backend APIs
|--------------------------------------------------------------------------
*/

const ENVIRONMENTAL_DATA_API =
  "/api/environmental-data";

const ENVIRONMENTAL_EXPORT_API =
  "/api/environmental-data/export";

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
|
| Production:
|   http://floodforecast.duckdns.org
|
| Local development:
|   VITE_SOCKET_URL=http://localhost:5000
|
| If VITE_SOCKET_URL is not defined, the frontend uses the
| current browser origin.
|
*/

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  window.location.origin;

const SOCKET_PATH = "/socket.io";

/*
|--------------------------------------------------------------------------
| Default Location
|--------------------------------------------------------------------------
*/

const DEFAULT_LOCATION = {
  name: "Nowshera",
  admin1: "Khyber Pakhtunkhwa",
  country: "Pakistan",
  country_code: "PK",
  latitude: 34.0151,
  longitude: 71.9747,
};

/*
|--------------------------------------------------------------------------
| Historical Range Options
|--------------------------------------------------------------------------
*/

const RANGE_OPTIONS = [
  {
    value: "24h",
    label: "Last 24 Hours",
  },
  {
    value: "7d",
    label: "Last 7 Days",
  },
  {
    value: "30d",
    label: "Last 30 Days",
  },
];

/*
|--------------------------------------------------------------------------
| Environmental Data Component
|--------------------------------------------------------------------------
*/

const EnvironmentalData = () => {
  /*
  |--------------------------------------------------------------------------
  | Location State
  |--------------------------------------------------------------------------
  */

  const [location, setLocation] =
    useState(DEFAULT_LOCATION);

  const [searchValue, setSearchValue] =
    useState("");

  const [locations, setLocations] =
    useState([]);

  /*
  |--------------------------------------------------------------------------
  | Keep Current Location Available to Socket.IO
  |--------------------------------------------------------------------------
  |
  | This prevents the Socket.IO event listener from using an old
  | location value after the user changes location.
  |
  */

  const locationRef = useRef(DEFAULT_LOCATION);

  /*
  |--------------------------------------------------------------------------
  | Weather State
  |--------------------------------------------------------------------------
  */

  const [weather, setWeather] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Socket.IO State
  |--------------------------------------------------------------------------
  */

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [lastRealtimeUpdate, setLastRealtimeUpdate] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Loading States
  |--------------------------------------------------------------------------
  */

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [savingData, setSavingData] =
    useState(false);

  const [historicalLoading, setHistoricalLoading] =
    useState(false);

  const [exportLoading, setExportLoading] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  const [error, setError] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Historical Data State
  |--------------------------------------------------------------------------
  */

  const [historicalData, setHistoricalData] =
    useState([]);

  const [selectedRange, setSelectedRange] =
    useState("24h");

  const [customDateRange, setCustomDateRange] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Synchronize Location Ref
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  /*
  |--------------------------------------------------------------------------
  | Search Locations
  |--------------------------------------------------------------------------
  */

  const searchLocations = async (value) => {
    if (!value || value.trim().length < 2) {
      setLocations([]);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await axios.get(
        GEOCODING_API,
        {
          params: {
            name: value.trim(),
            count: 10,
            language: "en",
            format: "json",
          },
        }
      );

      const results =
        response.data?.results || [];

      setLocations(results);
    } catch (err) {
      console.error(
        "Location search error:",
        err
      );

      setLocations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Build Historical Query Parameters
  |--------------------------------------------------------------------------
  */

  const getHistoricalParams = () => {
    const params = {
      location: location.name,
    };

    /*
    |----------------------------------------------------------------------
    | Custom Date Range
    |----------------------------------------------------------------------
    */

    if (
      customDateRange &&
      customDateRange.length === 2
    ) {
      params.start =
        customDateRange[0].toISOString();

      params.stop =
        customDateRange[1].toISOString();

      return params;
    }

    /*
    |----------------------------------------------------------------------
    | Preset Ranges
    |----------------------------------------------------------------------
    */

    if (selectedRange === "24h") {
      params.start = "-24h";
      params.stop = "now()";
    }

    if (selectedRange === "7d") {
      params.start = "-7d";
      params.stop = "now()";
    }

    if (selectedRange === "30d") {
      params.start = "-30d";
      params.stop = "now()";
    }

    return params;
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Historical Environmental Data
  |--------------------------------------------------------------------------
  */

  const fetchHistoricalData = async () => {
    try {
      setHistoricalLoading(true);

      const params =
        getHistoricalParams();

      const response =
        await axios.get(
          `${ENVIRONMENTAL_EXPORT_API}/json`,
          {
            params,
            withCredentials: true,
          }
        );

      if (response.data?.success) {
        setHistoricalData(
          response.data.data || []
        );
      } else {
        setHistoricalData([]);
      }
    } catch (err) {
      console.error(
        "Historical environmental data error:",
        err
      );

      setHistoricalData([]);

      message.error(
        "Unable to load historical environmental data."
      );
    } finally {
      setHistoricalLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save Environmental Data
  |--------------------------------------------------------------------------
  |
  | React
  |   ↓
  | Open-Meteo
  |   ↓
  | Backend API
  |   ↓
  | InfluxDB Cloud
  |   ↓
  | Socket.IO
  |   ↓
  | Connected Dashboards
  |
  */

  const saveEnvironmentalData = async (
    weatherData,
    selectedLocation
  ) => {
    try {
      const current =
        weatherData?.current;

      if (!current) {
        return;
      }

      const payload = {
        location:
          selectedLocation.name,

        latitude:
          selectedLocation.latitude != null
            ? Number(
                selectedLocation.latitude
              )
            : null,

        longitude:
          selectedLocation.longitude != null
            ? Number(
                selectedLocation.longitude
              )
            : null,

        temperature:
          current.temperature_2m != null
            ? Number(
                current.temperature_2m
              )
            : null,

        humidity:
          current.relative_humidity_2m != null
            ? Number(
                current.relative_humidity_2m
              )
            : null,

        rainfall:
          current.rain != null
            ? Number(current.rain)
            : current.precipitation != null
            ? Number(
                current.precipitation
              )
            : null,

        soil_moisture:
          current.soil_moisture_0_to_7cm != null
            ? Number(
                current.soil_moisture_0_to_7cm
              )
            : null,

        wind_speed:
          current.wind_speed_10m != null
            ? Number(
                current.wind_speed_10m
              )
            : null,
      };

      setSavingData(true);

      const response =
        await axios.post(
          ENVIRONMENTAL_DATA_API,
          payload,
          {
            withCredentials: true,
          }
        );

      if (response.data?.success) {
        console.log(
          "✅ Environmental data saved to InfluxDB Cloud"
        );
      }
    } catch (err) {
      console.error(
        "Failed to save environmental data:",
        err
      );

      message.warning(
        "Weather loaded, but environmental data could not be saved."
      );
    } finally {
      setSavingData(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Weather
  |--------------------------------------------------------------------------
  */

  const fetchWeather = async (
    selectedLocation = locationRef.current
  ) => {
    try {
      setWeatherLoading(true);
      setError(null);

      const response =
        await axios.get(
          WEATHER_API,
          {
            params: {
              latitude:
                selectedLocation.latitude,

              longitude:
                selectedLocation.longitude,

              /*
              |--------------------------------------------------------------
              | Current Conditions
              |--------------------------------------------------------------
              */

              current:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              |--------------------------------------------------------------
              | Hourly Conditions
              |--------------------------------------------------------------
              */

              hourly:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              |--------------------------------------------------------------
              | Timezone
              |--------------------------------------------------------------
              */

              timezone: "auto",

              /*
              |--------------------------------------------------------------
              | Units
              |--------------------------------------------------------------
              */

              temperature_unit: "celsius",

              wind_speed_unit: "kmh",

              precipitation_unit: "mm",
            },
          }
        );

      const weatherData =
        response.data;

      setWeather(weatherData);

      /*
      |----------------------------------------------------------------------
      | Save Current Environmental Data
      |----------------------------------------------------------------------
      */

      await saveEnvironmentalData(
        weatherData,
        selectedLocation
      );
    } catch (err) {
      console.error(
        "Environmental data error:",
        err
      );

      setError(
        "Unable to fetch environmental conditions for this location."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Socket.IO Real-Time Connection
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | The socket is created only once when the component mounts.
  |
  | It is NOT recreated when the user changes location.
  |
  */

  useEffect(() => {
    console.log(
      "🔌 Connecting to Socket.IO:",
      SOCKET_URL
    );

    const socket = io(
      SOCKET_URL,
      {
        path: SOCKET_PATH,

        withCredentials: true,

        transports: [
          "websocket",
          "polling",
        ],

        reconnection: true,

        reconnectionAttempts: Infinity,

        reconnectionDelay: 1000,

        reconnectionDelayMax: 5000,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Connecting
    |--------------------------------------------------------------------------
    */

    socket.on(
      "connect",
      () => {
        console.log(
          "🔌 WebSocket connected:",
          socket.id
        );

        console.log(
          "🌐 Socket URL:",
          SOCKET_URL
        );

        console.log(
          "📡 Socket path:",
          SOCKET_PATH
        );

        setSocketConnected(true);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Disconnected
    |--------------------------------------------------------------------------
    */

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "🔌 WebSocket disconnected:",
          reason
        );

        setSocketConnected(false);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Connection Error
    |--------------------------------------------------------------------------
    */

    socket.on(
      "connect_error",
      (socketError) => {
        console.error(
          "❌ WebSocket connection error:",
          socketError.message
        );

        console.error(
          "❌ Full Socket.IO error:",
          socketError
        );

        setSocketConnected(false);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Test Message
    |--------------------------------------------------------------------------
    |
    | If you later add a test_message event in the backend,
    | this will confirm that the Socket.IO connection itself works.
    |
    */

    socket.on(
      "test_message",
      (data) => {
        console.log(
          "🧪 TEST MESSAGE RECEIVED:",
          data
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Real-Time Environmental Data
    |--------------------------------------------------------------------------
    */

    socket.on(
      "environmental_data_updated",
      (newData) => {
        console.log(
          "🌱 Real-time environmental data received:",
          newData
        );

        if (
          !newData ||
          typeof newData !== "object"
        ) {
          console.warn(
            "⚠️ Invalid environmental data received."
          );

          return;
        }

        /*
        |----------------------------------------------------------------------
        | Current Selected Location
        |----------------------------------------------------------------------
        */

        const currentLocation =
          locationRef.current;

        /*
        |----------------------------------------------------------------------
        | Ignore data belonging to another location
        |----------------------------------------------------------------------
        */

        if (
          newData.location &&
          newData.location !==
            currentLocation.name
        ) {
          console.log(
            "🌍 Ignoring update for another location:",
            newData.location,
            "| Current:",
            currentLocation.name
          );

          return;
        }

        /*
        |----------------------------------------------------------------------
        | Store Latest Real-Time Update
        |----------------------------------------------------------------------
        */

        const realtimeTimestamp =
          newData.timestamp
            ? new Date(
                newData.timestamp
              )
            : new Date();

        setLastRealtimeUpdate(
          realtimeTimestamp
        );

        /*
        |----------------------------------------------------------------------
        | Update Current Weather
        |----------------------------------------------------------------------
        */

        setWeather(
          (previousWeather) => {
            if (
              !previousWeather
            ) {
              return previousWeather;
            }

            const previousCurrent =
              previousWeather.current ||
              {};

            return {
              ...previousWeather,

              current: {
                ...previousCurrent,

                temperature_2m:
                  newData.temperature ??
                  previousCurrent.temperature_2m,

                relative_humidity_2m:
                  newData.humidity ??
                  previousCurrent.relative_humidity_2m,

                rain:
                  newData.rainfall ??
                  previousCurrent.rain,

                precipitation:
                  newData.rainfall ??
                  previousCurrent.precipitation,

                soil_moisture_0_to_7cm:
                  newData.soil_moisture ??
                  previousCurrent.soil_moisture_0_to_7cm,

                wind_speed_10m:
                  newData.wind_speed ??
                  previousCurrent.wind_speed_10m,

                time:
                  newData.timestamp ??
                  previousCurrent.time,
              },
            };
          }
        );

        /*
        |----------------------------------------------------------------------
        | Add Real-Time Record to Historical Table
        |----------------------------------------------------------------------
        */

        const historicalRecord = {
          timestamp:
            newData.timestamp ||
            new Date().toISOString(),

          location:
            newData.location ||
            currentLocation.name,

          temperature:
            newData.temperature,

          humidity:
            newData.humidity,

          rainfall:
            newData.rainfall,

          soil_moisture:
            newData.soil_moisture,

          wind_speed:
            newData.wind_speed,
        };

        setHistoricalData(
          (previousData) => {
            const filteredData =
              previousData.filter(
                (record) =>
                  !(
                    record.timestamp ===
                      historicalRecord.timestamp &&
                    record.location ===
                      historicalRecord.location
                  )
              );

            return [
              historicalRecord,
              ...filteredData,
            ];
          }
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      console.log(
        "🔌 Closing WebSocket connection"
      );

      socket.removeAllListeners();

      socket.disconnect();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Weather Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    locationRef.current =
      DEFAULT_LOCATION;

    fetchWeather(
      DEFAULT_LOCATION
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Historical Data Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Refresh Weather Every 5 Minutes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval =
      setInterval(
        () => {
          fetchWeather(
            locationRef.current
          );
        },
        5 * 60 * 1000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Refresh Historical Data When Location / Range Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (location?.name) {
      fetchHistoricalData();
    }
  }, [
    location.name,
    selectedRange,
    customDateRange,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Location Selection
  |--------------------------------------------------------------------------
  */

  const handleLocationChange =
    (value) => {
      const selected =
        locations.find(
          (item) =>
            `${item.latitude}-${item.longitude}` ===
            value
        );

      if (!selected) {
        return;
      }

      const selectedLocation = {
        name:
          selected.name,

        admin1:
          selected.admin1,

        country:
          selected.country,

        country_code:
          selected.country_code,

        latitude:
          Number(
            selected.latitude
          ),

        longitude:
          Number(
            selected.longitude
          ),

        timezone:
          selected.timezone,
      };

      /*
      |----------------------------------------------------------------------
      | Update Location
      |----------------------------------------------------------------------
      */

      locationRef.current =
        selectedLocation;

      setLocation(
        selectedLocation
      );

      setSearchValue(
        selected.name
      );

      setLocations([]);

      /*
      |----------------------------------------------------------------------
      | Immediately Fetch New Location
      |----------------------------------------------------------------------
      */

      fetchWeather(
        selectedLocation
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Handle Range Change
  |--------------------------------------------------------------------------
  */

  const handleRangeChange =
    (value) => {
      setSelectedRange(
        value
      );

      setCustomDateRange(
        null
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Handle Custom Date Range
  |--------------------------------------------------------------------------
  */

  const handleCustomDateChange =
    (dates) => {
      if (!dates) {
        setCustomDateRange(
          null
        );

        return;
      }

      setCustomDateRange(
        dates
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Export File
  |--------------------------------------------------------------------------
  */

  const exportFile = async (
    format
  ) => {
    try {
      setExportLoading(
        format
      );

      const params =
        getHistoricalParams();

      /*
      |----------------------------------------------------------------------
      | JSON
      |----------------------------------------------------------------------
      */

      if (
        format === "json"
      ) {
        const response =
          await axios.get(
            `${ENVIRONMENTAL_EXPORT_API}/json`,
            {
              params,
              withCredentials: true,
            }
          );

        const blob =
          new Blob(
            [
              JSON.stringify(
                response.data,
                null,
                2
              ),
            ],
            {
              type:
                "application/json",
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          `environmental-data-${location.name}-${selectedRange}.json`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        message.success(
          "JSON file exported successfully."
        );

        return;
      }

      /*
      |----------------------------------------------------------------------
      | Excel / PDF
      |----------------------------------------------------------------------
      */

      const response =
        await axios.get(
          `${ENVIRONMENTAL_EXPORT_API}/${format}`,
          {
            params,

            responseType:
              "blob",

            withCredentials: true,
          }
        );

      const mimeType =
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";

      const extension =
        format === "excel"
          ? "xlsx"
          : "pdf";

      const blob =
        new Blob(
          [
            response.data,
          ],
          {
            type:
              mimeType,
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        `environmental-data-${location.name}-${selectedRange}.${extension}`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      message.success(
        `${format.toUpperCase()} file exported successfully.`
      );
    } catch (err) {
      console.error(
        `${format} export error:`,
        err
      );

      message.error(
        `Unable to export ${format.toUpperCase()} file.`
      );
    } finally {
      setExportLoading(
        null
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Current Weather Values
  |--------------------------------------------------------------------------
  */

  const current =
    weather?.current;

  const temperature =
    current?.temperature_2m ??
    null;

  const humidity =
    current?.relative_humidity_2m ??
    null;

  const rainfall =
    current?.rain ??
    current?.precipitation ??
    null;

  const windSpeed =
    current?.wind_speed_10m ??
    null;

  const soilMoisture =
    current?.soil_moisture_0_to_7cm ??
    null;

  /*
  |--------------------------------------------------------------------------
  | Status Helper
  |--------------------------------------------------------------------------
  */

  const getStatus = (
    parameter,
    value
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "Unknown";
    }

    /*
    |----------------------------------------------------------------------
    | Rainfall
    |----------------------------------------------------------------------
    */

    if (
      parameter ===
      "Rainfall"
    ) {
      if (value >= 20) {
        return "High";
      }

      if (value >= 5) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    |----------------------------------------------------------------------
    | Temperature
    |----------------------------------------------------------------------
    */

    if (
      parameter ===
      "Temperature"
    ) {
      if (
        value >= 40 ||
        value <= 5
      ) {
        return "High";
      }

      if (value >= 35) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    |----------------------------------------------------------------------
    | Humidity
    |----------------------------------------------------------------------
    */

    if (
      parameter ===
      "Humidity"
    ) {
      if (value >= 85) {
        return "High";
      }

      if (value >= 70) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    |----------------------------------------------------------------------
    | Wind
    |----------------------------------------------------------------------
    */

    if (
      parameter ===
      "Wind Speed"
    ) {
      if (value >= 50) {
        return "High";
      }

      if (value >= 30) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    |----------------------------------------------------------------------
    | Soil Moisture
    |----------------------------------------------------------------------
    */

    if (
      parameter ===
      "Soil Moisture"
    ) {
      if (value >= 0.40) {
        return "High";
      }

      if (value >= 0.25) {
        return "Moderate";
      }

      return "Normal";
    }

    return "Normal";
  };

  /*
  |--------------------------------------------------------------------------
  | Updated Time
  |--------------------------------------------------------------------------
  */

  const updatedTime =
    current?.time
      ? new Date(
          current.time
        ).toLocaleString(
          "en-PK",
          {
            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        )
      : "Unknown";

  /*
  |--------------------------------------------------------------------------
  | Current Table Data
  |--------------------------------------------------------------------------
  */

  const data = [
    {
      key: 1,

      parameter:
        "Rainfall",

      value:
        rainfall,

      unit:
        "mm",

      status:
        getStatus(
          "Rainfall",
          rainfall
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 2,

      parameter:
        "Temperature",

      value:
        temperature,

      unit:
        "°C",

      status:
        getStatus(
          "Temperature",
          temperature
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 3,

      parameter:
        "Humidity",

      value:
        humidity,

      unit:
        "%",

      status:
        getStatus(
          "Humidity",
          humidity
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 4,

      parameter:
        "Soil Moisture",

      value:
        soilMoisture,

      unit:
        "m³/m³",

      status:
        getStatus(
          "Soil Moisture",
          soilMoisture
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 5,

      parameter:
        "Wind Speed",

      value:
        windSpeed,

      unit:
        "km/h",

      status:
        getStatus(
          "Wind Speed",
          windSpeed
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Current Table Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title:
        "Environmental Parameter",

      dataIndex:
        "parameter",

      key:
        "parameter",

      render:
        (value) => (
          <Text strong>
            {value}
          </Text>
        ),
    },

    {
      title:
        "Current Value",

      key:
        "value",

      render:
        (_, record) => (
          <Text>
            {record.value !==
            null &&
            record.value !==
              undefined
              ? Number(
                  record.value
                ).toFixed(2)
              : "N/A"}

            {" "}

            {record.unit}
          </Text>
        ),
    },

    {
      title:
        "Status",

      dataIndex:
        "status",

      key:
        "status",

      render:
        (status) => {
          let color =
            "default";

          if (
            status ===
            "Normal"
          ) {
            color =
              "success";
          } else if (
            status ===
            "Moderate"
          ) {
            color =
              "warning";
          } else if (
            status ===
            "High"
          ) {
            color =
              "error";
          }

          return (
            <Tag
              color={
                color
              }
            >
              {status}
            </Tag>
          );
        },
    },

    {
      title:
        "Source",

      dataIndex:
        "source",

      key:
        "source",

      render:
        (source) => (
          <Tag>
            {source}
          </Tag>
        ),
    },

    {
      title:
        "Last Updated",

      dataIndex:
        "updated",

      key:
        "updated",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Historical Table Columns
  |--------------------------------------------------------------------------
  */

  const historicalColumns = [
    {
      title:
        "Date & Time",

      dataIndex:
        "timestamp",

      key:
        "timestamp",

      fixed:
        "left",

      width: 190,

      render:
        (timestamp) =>
          timestamp
            ? new Date(
                timestamp
              ).toLocaleString(
                "en-PK",
                {
                  dateStyle:
                    "medium",

                  timeStyle:
                    "short",
                }
              )
            : "N/A",
    },

    {
      title:
        "Location",

      dataIndex:
        "location",

      key:
        "location",

      width: 140,

      render:
        (value) => (
          <Tag color="blue">
            {value ||
              "N/A"}
          </Tag>
        ),
    },

    {
      title:
        "Temperature",

      dataIndex:
        "temperature",

      key:
        "temperature",

      render:
        (value) =>
          value != null
            ? `${Number(
                value
              ).toFixed(
                2
              )} °C`
            : "N/A",
    },

    {
      title:
        "Humidity",

      dataIndex:
        "humidity",

      key:
        "humidity",

      render:
        (value) =>
          value != null
            ? `${Number(
                value
              ).toFixed(
                2
              )} %`
            : "N/A",
    },

    {
      title:
        "Rainfall",

      dataIndex:
        "rainfall",

      key:
        "rainfall",

      render:
        (value) =>
          value != null
            ? `${Number(
                value
              ).toFixed(
                2
              )} mm`
            : "N/A",
    },

    {
      title:
        "Soil Moisture",

      dataIndex:
        "soil_moisture",

      key:
        "soil_moisture",

      render:
        (value) =>
          value != null
            ? `${Number(
                value
              ).toFixed(
                3
              )} m³/m³`
            : "N/A",
    },

    {
      title:
        "Wind Speed",

      dataIndex:
        "wind_speed",

      key:
        "wind_speed",

      render:
        (value) =>
          value != null
            ? `${Number(
                value
              ).toFixed(
                2
              )} km/h`
            : "N/A",
    },
  ];


  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (weatherLoading && !weather) {
    return (
      <div className="environmental-loading">
        <Spin size="large" />
        <Text type="secondary">Loading environmental conditions...</Text>
      </div>
    );
  }

  const selectedRangeLabel = customDateRange
    ? "Custom date range"
    : RANGE_OPTIONS.find((item) => item.value === selectedRange)?.label;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="environmental-page">
      {/* PAGE HEADING */}
      <section className="environmental-page-heading">
        <div className="environmental-heading-copy">
          <div className="environmental-eyebrow">
            <span className="environmental-eyebrow-dot" />
            ENVIRONMENTAL INTELLIGENCE
          </div>

          <Title level={2} className="environmental-page-title">
            Environmental Data
          </Title>

          <Text className="environmental-page-description">
            Monitor current weather conditions, track environmental
            measurements, and explore historical records for your selected
            location.
          </Text>
        </div>

        <div className="environmental-heading-actions">
          <Tag
            className="environmental-location-tag"
            icon={<EnvironmentOutlined />}
          >
            {location.name}, {location.country}
          </Tag>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchWeather(location)}
            loading={weatherLoading}
          >
            Refresh data
          </Button>
        </div>
      </section>

      {/* LOCATION SEARCH */}
      <Card className="environmental-card environmental-location-card">
        <div className="environmental-section-heading">
          <div className="environmental-section-icon">
            <EnvironmentOutlined />
          </div>

          <div>
            <Text className="environmental-section-title">
              Monitoring location
            </Text>
            <Text className="environmental-section-description">
              Search for a city or area to view its environmental conditions.
            </Text>
          </div>
        </div>

        <div className="environmental-location-controls">
          <Select
            showSearch
            allowClear
            value={searchValue || undefined}
            placeholder="Search city or area, e.g. Nowshera, Peshawar, Lahore"
            className="environmental-location-select"
            prefix={<SearchOutlined />}
            filterOption={false}
            onSearch={searchLocations}
            onChange={handleLocationChange}
            notFoundContent={
              searchLoading ? (
                <Spin size="small" />
              ) : (
                "No location found"
              )
            }
            options={locations.map((item) => ({
              value: `${item.latitude}-${item.longitude}`,
              label: (
                <div className="environmental-location-option">
                  <Text strong>{item.name}</Text>
                  <Text type="secondary">
                    {[item.admin2, item.admin1, item.country]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </div>
              ),
            }))}
          />

          <div className="environmental-location-meta">
            <Tag color="blue">{location.name}</Tag>
            {location.admin1 && <Tag>{location.admin1}</Tag>}
            <Tag>{location.country}</Tag>
            <Text type="secondary" className="environmental-coordinates">
              {Number(location.latitude).toFixed(5)},{" "}
              {Number(location.longitude).toFixed(5)}
            </Text>
          </div>
        </div>
      </Card>

      {/* ERROR */}
      {error && (
        <Alert
          className="environmental-error"
          type="error"
          showIcon
          message="Unable to retrieve environmental data"
          description={error}
        />
      )}

      {/* LIVE CONNECTION STRIP */}
      <Card className="environmental-card environmental-status-card">
        <div className="environmental-status-main">
          <div className="environmental-status-heading">
            <span className="environmental-status-pulse" />
            <div>
              <Text className="environmental-status-title">
                Data collection status
              </Text>
              <Text className="environmental-status-subtitle">
                {location.name} monitoring overview
              </Text>
            </div>
          </div>

          <div className="environmental-status-items">
            <div className="environmental-status-item">
              <span
                className={`environmental-status-indicator ${
                  socketConnected ? "is-online" : "is-offline"
                }`}
              />
              <div>
                <Text className="environmental-status-label">
                  Socket.IO
                </Text>
                <Text className="environmental-status-value">
                  {socketConnected ? "Connected" : "Disconnected"}
                </Text>
              </div>
            </div>

            <div className="environmental-status-item">
              <DatabaseOutlined className="environmental-status-icon" />
              <div>
                <Text className="environmental-status-label">
                  InfluxDB Cloud
                </Text>
                <Text className="environmental-status-value">
                  {savingData ? "Saving measurements..." : "Data ingestion"}
                </Text>
              </div>
            </div>

            <div className="environmental-status-item">
              <HistoryOutlined className="environmental-status-icon" />
              <div>
                <Text className="environmental-status-label">
                  Last live update
                </Text>
                <Text className="environmental-status-value">
                  {lastRealtimeUpdate
                    ? lastRealtimeUpdate.toLocaleTimeString("en-PK")
                    : "Waiting for update"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CURRENT CONDITIONS */}
      <div className="environmental-section-header">
        <div>
          <Title level={4} className="environmental-section-heading-title">
            Current conditions
          </Title>
          <Text className="environmental-section-heading-subtitle">
            Latest available measurements for {location.name}
          </Text>
        </div>

        <Tag color={weatherLoading ? "processing" : "success"}>
          {weatherLoading ? "Updating" : "Latest available"}
        </Tag>
      </div>

      <Row gutter={[16, 16]} className="environmental-metrics">
        <Col xs={24} sm={12} xl={6}>
          <Card className="environmental-metric-card metric-rainfall">
            <div className="environmental-metric-top">
              <div className="environmental-metric-icon">
                <CloudOutlined />
              </div>
              <Tag color="blue">Precipitation</Tag>
            </div>
            <Statistic
              title="Rainfall"
              value={rainfall ?? "—"}
              precision={rainfall == null ? undefined : 2}
              suffix={rainfall == null ? "" : "mm"}
            />
            <Text className="environmental-metric-caption">
              Current rainfall measurement
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="environmental-metric-card metric-temperature">
            <div className="environmental-metric-top">
              <div className="environmental-metric-icon">
                <FireOutlined />
              </div>
              <Tag color="volcano">Atmosphere</Tag>
            </div>
            <Statistic
              title="Temperature"
              value={temperature ?? "—"}
              precision={temperature == null ? undefined : 1}
              suffix={temperature == null ? "" : "°C"}
            />
            <Text className="environmental-metric-caption">
              Air temperature at 2 m
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="environmental-metric-card metric-humidity">
            <div className="environmental-metric-top">
              <div className="environmental-metric-icon">
                <ExperimentOutlined />
              </div>
              <Tag color="cyan">Moisture</Tag>
            </div>
            <Statistic
              title="Relative humidity"
              value={humidity ?? "—"}
              precision={humidity == null ? undefined : 1}
              suffix={humidity == null ? "" : "%"}
            />
            <Text className="environmental-metric-caption">
              Moisture in the atmosphere
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="environmental-metric-card metric-wind">
            <div className="environmental-metric-top">
              <div className="environmental-metric-icon">
                <ThunderboltOutlined />
              </div>
              <Tag color="purple">Wind</Tag>
            </div>
            <Statistic
              title="Wind speed"
              value={windSpeed ?? "—"}
              precision={windSpeed == null ? undefined : 1}
              suffix={windSpeed == null ? "" : "km/h"}
            />
            <Text className="environmental-metric-caption">
              Wind speed at 10 m
            </Text>
          </Card>
        </Col>
      </Row>

      {/* CURRENT MEASUREMENTS TABLE */}
      <Card className="environmental-card environmental-table-card">
        <div className="environmental-card-heading">
          <div className="environmental-card-heading-copy">
            <div className="environmental-section-icon">
              <CloudOutlined />
            </div>
            <div>
              <Text className="environmental-section-title">
                Environmental measurements
              </Text>
              <Text className="environmental-section-description">
                Current readings, condition levels, and data sources.
              </Text>
            </div>
          </div>

          <Tag color="blue">{data.length} parameters</Tag>
        </div>

        <Table
          className="environmental-table"
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={weatherLoading}
          scroll={{ x: "max-content" }}
        />

        <div className="environmental-table-footnote">
          <Text type="secondary">
            Weather observations supplied by Open-Meteo. Values reflect the
            latest available response for the selected location.
          </Text>
        </div>
      </Card>

      {/* HISTORICAL DATA */}
      <Card className="environmental-card environmental-history-card">
        <div className="environmental-card-heading environmental-history-heading">
          <div className="environmental-card-heading-copy">
            <div className="environmental-section-icon">
              <HistoryOutlined />
            </div>
            <div>
              <Text className="environmental-section-title">
                Historical environmental data
              </Text>
              <Text className="environmental-section-description">
                Review stored measurements and export records for analysis.
              </Text>
            </div>
          </div>

          <Tag color="blue">{historicalData.length} records</Tag>
        </div>

        <div className="environmental-history-toolbar">
          <div className="environmental-history-filters">
            <div className="environmental-filter-group">
              <Text className="environmental-filter-label">
                Time period
              </Text>
              <Select
                value={selectedRange}
                className="environmental-range-select"
                options={RANGE_OPTIONS}
                onChange={handleRangeChange}
              />
            </div>

            <div className="environmental-filter-group">
              <Text className="environmental-filter-label">
                Custom date range
              </Text>
              <RangePicker
                showTime
                className="environmental-date-picker"
                onChange={handleCustomDateChange}
                format="YYYY-MM-DD HH:mm"
              />
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchHistoricalData}
              loading={historicalLoading}
            >
              Refresh history
            </Button>
          </div>

          <div className="environmental-export-group">
            <Text className="environmental-filter-label">
              Export records
            </Text>
            <Space wrap>
              <Button
                icon={<CodeOutlined />}
                loading={exportLoading === "json"}
                onClick={() => exportFile("json")}
              >
                JSON
              </Button>

              <Button
                icon={<FileExcelOutlined />}
                loading={exportLoading === "excel"}
                onClick={() => exportFile("excel")}
              >
                Excel
              </Button>

              <Button
                icon={<FilePdfOutlined />}
                loading={exportLoading === "pdf"}
                onClick={() => exportFile("pdf")}
              >
                PDF
              </Button>
            </Space>
          </div>
        </div>

        <div className="environmental-filter-summary">
          <div>
            <Text className="environmental-summary-label">
              Selected location
            </Text>
            <Text strong>{location.name}</Text>
          </div>

          <div>
            <Text className="environmental-summary-label">
              Selected period
            </Text>
            <Text strong>{selectedRangeLabel}</Text>
          </div>

          <div>
            <Text className="environmental-summary-label">
              Available records
            </Text>
            <Text strong>{historicalData.length}</Text>
          </div>
        </div>

        <Table
          className="environmental-table environmental-history-table"
          rowKey={(record, index) =>
            `${record.timestamp}-${record.location}-${index}`
          }
          columns={historicalColumns}
          dataSource={historicalData}
          loading={historicalLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText:
              "No historical environmental data found for this location and time range.",
          }}
        />
      </Card>

      {/* DATA INFORMATION */}
      <footer className="environmental-page-footer">
        <div className="environmental-footer-icon">
          <DatabaseOutlined />
        </div>

        <div>
          <Text className="environmental-footer-title">
            Data sources and processing
          </Text>
          <Text className="environmental-footer-description">
            Current weather data and location search are provided by
            Open-Meteo. Measurements are submitted to the Flood Forecasting
            backend for InfluxDB Cloud storage. Socket.IO delivers real-time
            updates, while historical records can be filtered and exported
            as JSON, Excel, or PDF.
          </Text>
        </div>
      </footer>
    </div>
  );
};

export default EnvironmentalData;
