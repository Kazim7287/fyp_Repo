import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

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
  Divider,
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
| Backend API
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
| In production the frontend and backend are served through the same
| domain, so window.location.origin is the correct Socket.IO URL.
|
| Nginx:
|   /socket.io/ -> http://127.0.0.1:5000/socket.io/
|
*/

const SOCKET_URL =
  window.location.origin;

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

      if (
        response.data?.success
      ) {
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
          Number(
            selectedLocation.latitude
          ),

        longitude:
          Number(
            selectedLocation.longitude
          ),

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
          "Environmental data saved to InfluxDB Cloud"
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
    selectedLocation = location
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
              |--------------------------------------------------------------------------
              | Current Conditions
              |--------------------------------------------------------------------------
              */

              current:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              |--------------------------------------------------------------------------
              | Hourly Conditions
              |--------------------------------------------------------------------------
              */

              hourly:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              |--------------------------------------------------------------------------
              | Timezone
              |--------------------------------------------------------------------------
              */

              timezone:
                "auto",

              /*
              |--------------------------------------------------------------------------
              | Units
              |--------------------------------------------------------------------------
              */

              temperature_unit:
                "celsius",

              wind_speed_unit:
                "kmh",

              precipitation_unit:
                "mm",
            },
          }
        );

      const weatherData =
        response.data;

      setWeather(
        weatherData
      );

      /*
      |--------------------------------------------------------------------------
      | Save Current Environmental Data
      |--------------------------------------------------------------------------
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
  | Open-Meteo / IoT
  |       ↓
  | Express Backend
  |       ↓
  | InfluxDB Cloud
  |       ↓
  | Socket.IO
  |       ↓
  | React Dashboard
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
        withCredentials: true,

        transports: [
          "websocket",
          "polling",
        ],
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Connected
    |--------------------------------------------------------------------------
    */

    socket.on(
      "connect",
      () => {
        console.log(
          "🔌 WebSocket connected:",
          socket.id
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
          socketError
        );

        setSocketConnected(false);
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
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Only update the currently selected location
        |--------------------------------------------------------------------------
        */

        if (
          newData.location &&
          newData.location !== location.name
        ) {
          console.log(
            "🌍 Ignoring update for another location:",
            newData.location
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Store latest real-time update time
        |--------------------------------------------------------------------------
        */

        setLastRealtimeUpdate(
          new Date()
        );

        /*
        |--------------------------------------------------------------------------
        | Update Current Weather
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Update Historical Table
        |--------------------------------------------------------------------------
        */

        const historicalRecord = {
          timestamp:
            newData.timestamp,

          location:
            newData.location,

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

      socket.disconnect();
    };
  }, [location.name]);

  /*
  |--------------------------------------------------------------------------
  | Initial Weather Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
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
            location
          );
        },
        5 * 60 * 1000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [location]);

  /*
  |--------------------------------------------------------------------------
  | Refresh Historical Data When Location/Range Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      location?.name
    ) {
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
          selected.latitude,

        longitude:
          selected.longitude,

        timezone:
          selected.timezone,
      };

      setLocation(
        selectedLocation
      );

      setSearchValue(
        selected.name
      );

      setLocations([]);

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
      |--------------------------------------------------------------------------
      | JSON
      |--------------------------------------------------------------------------
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
      |--------------------------------------------------------------------------
      | Excel / PDF
      |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Rainfall
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Temperature
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Humidity
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Wind
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Soil Moisture
    |--------------------------------------------------------------------------
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
            null
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

  if (
    weatherLoading &&
    !weather
  ) {
    return (
      <div
        style={{
          minHeight: 400,

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Spin
          size="large"
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={3}
          style={{
            marginBottom: 4,
          }}
        >
          Environmental Data
        </Title>

        <Text type="secondary">
          Monitor real-time
          environmental
          conditions, store
          measurements in
          InfluxDB Cloud, and
          export historical
          environmental data.
        </Text>
      </div>

      {/* ================================================= */}
      {/* LOCATION SEARCH */}
      {/* ================================================= */}

      <Card
        style={{
          marginBottom: 24,
        }}
      >
        <Space
          direction="vertical"
          size={12}
          style={{
            width: "100%",
          }}
        >
          <Space>
            <EnvironmentOutlined />

            <Text strong>
              Select Monitoring
              Location
            </Text>
          </Space>

          <Select
            showSearch
            allowClear
            value={
              searchValue ||
              undefined
            }
            placeholder="Search city or area e.g. Dubai, Nowshera, Lahore"
            style={{
              width: "100%",
              maxWidth: 700,
            }}
            prefix={
              <SearchOutlined />
            }
            filterOption={
              false
            }
            onSearch={
              searchLocations
            }
            onChange={
              handleLocationChange
            }
            notFoundContent={
              searchLoading ? (
                <Spin
                  size="small"
                />
              ) : (
                "No location found"
              )
            }
            options={locations.map(
              (item) => ({
                value: `${item.latitude}-${item.longitude}`,

                label: (
                  <div>
                    <Text strong>
                      {item.name}
                    </Text>

                    <br />

                    <Text type="secondary">
                      {[
                        item.admin2,
                        item.admin1,
                        item.country,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )}
                    </Text>
                  </div>
                ),
              })
            )}
          />

          <Space
            wrap
          >
            <Tag color="blue">
              {location.name}
            </Tag>

            {location.admin1 && (
              <Tag>
                {location.admin1}
              </Tag>
            )}

            <Tag>
              {location.country}
            </Tag>

            <Text type="secondary">
              📍{" "}
              {Number(
                location.latitude
              ).toFixed(5)}
              ,{" "}
              {Number(
                location.longitude
              ).toFixed(5)}
            </Text>
          </Space>
        </Space>
      </Card>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <Alert
          type="error"
          showIcon
          message="Environmental Data Error"
          description={error}
          style={{
            marginBottom: 24,
          }}
        />
      )}

      {/* ================================================= */}
      {/* LOCATION INFO */}
      {/* ================================================= */}

      <Card
        style={{
          marginBottom: 24,
        }}
      >
        <Space
          wrap
          size="middle"
        >
          <EnvironmentOutlined />

          <Text>
            Monitoring Location:
          </Text>

          <Text strong>
            {location.name}
          </Text>

          {location.admin1 && (
            <Text type="secondary">
              {location.admin1}
            </Text>
          )}

          <Text type="secondary">
            {location.country}
          </Text>

          {/* Socket.IO Connection Status */}

          <Tag
            color={
              socketConnected
                ? "green"
                : "red"
            }
          >
            {socketConnected
              ? "Real-Time Connected"
              : "Real-Time Disconnected"}
          </Tag>

          {/* Last Socket.IO Update */}

          {lastRealtimeUpdate && (
            <Text type="secondary">
              Last live update:{" "}
              {lastRealtimeUpdate.toLocaleTimeString(
                "en-PK"
              )}
            </Text>
          )}

          <Tag
            color={
              savingData
                ? "processing"
                : "success"
            }
            icon={
              <DatabaseOutlined />
            }
          >
            {savingData
              ? "Saving to Cloud..."
              : "Stored in InfluxDB Cloud"}
          </Tag>

          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={() =>
              fetchWeather(
                location
              )
            }
            loading={
              weatherLoading
            }
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* RAINFALL */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Rainfall"
              value={
                rainfall ??
                0
              }
              precision={2}
              suffix="mm"
              prefix={
                <CloudOutlined />
              }
            />

            <Text type="secondary">
              Current precipitation
            </Text>
          </Card>
        </Col>

        {/* TEMPERATURE */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Temperature"
              value={
                temperature ??
                0
              }
              precision={1}
              suffix="°C"
              prefix={
                <FireOutlined />
              }
            />

            <Text type="secondary">
              2 m above ground
            </Text>
          </Card>
        </Col>

        {/* HUMIDITY */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Humidity"
              value={
                humidity ??
                0
              }
              precision={1}
              suffix="%"
              prefix={
                <ExperimentOutlined />
              }
            />

            <Text type="secondary">
              Relative humidity
            </Text>
          </Card>
        </Col>

        {/* WIND */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Wind Speed"
              value={
                windSpeed ??
                0
              }
              precision={1}
              suffix="km/h"
              prefix={
                <ThunderboltOutlined />
              }
            />

            <Text type="secondary">
              10 m above ground
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ================================================= */}
      {/* ENVIRONMENTAL TABLE */}
      {/* ================================================= */}

      <Card
        title={
          <Space>
            <CloudOutlined />

            <span>
              Environmental
              Measurements
            </span>
          </Space>
        }
        style={{
          marginBottom: 24,
        }}
      >
        <Table
          rowKey="key"
          columns={
            columns
          }
          dataSource={
            data
          }
          pagination={
            false
          }
          loading={
            weatherLoading
          }
          scroll={{
            x: "max-content",
          }}
        />
      </Card>

      {/* ================================================= */}
      {/* HISTORICAL DATA / EXPORT */}
      {/* ================================================= */}

      <Card
        title={
          <Space>
            <HistoryOutlined />

            <span>
              Historical Environmental Data
            </span>
          </Space>
        }
        extra={
          <Tag color="blue">
            {historicalData.length} Records
          </Tag>
        }
        style={{
          marginBottom: 24,
        }}
      >
        {/* FILTERS */}

        <Space
          wrap
          size="middle"
          style={{
            marginBottom: 20,
          }}
        >
          <Space>
            <Text strong>
              Time Range:
            </Text>

            <Select
              value={
                selectedRange
              }
              style={{
                width: 160,
              }}
              options={
                RANGE_OPTIONS
              }
              onChange={
                handleRangeChange
              }
            />
          </Space>

          <Space>
            <Text strong>
              Custom Range:
            </Text>

            <RangePicker
              showTime
              onChange={
                handleCustomDateChange
              }
              format="YYYY-MM-DD HH:mm"
            />
          </Space>

          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={
              fetchHistoricalData
            }
            loading={
              historicalLoading
            }
          >
            Refresh History
          </Button>
        </Space>

        <Divider />

        {/* EXPORT BUTTONS */}

        <Space
          wrap
          size="middle"
          style={{
            marginBottom: 20,
          }}
        >
          <Text strong>
            Export Data:
          </Text>

          <Button
            type="primary"
            icon={
              <CodeOutlined />
            }
            loading={
              exportLoading ===
              "json"
            }
            onClick={() =>
              exportFile(
                "json"
              )
            }
          >
            Export JSON
          </Button>

          <Button
            icon={
              <FileExcelOutlined />
            }
            loading={
              exportLoading ===
              "excel"
            }
            onClick={() =>
              exportFile(
                "excel"
              )
            }
          >
            Export Excel
          </Button>

          <Button
            icon={
              <FilePdfOutlined />
            }
            loading={
              exportLoading ===
              "pdf"
            }
            onClick={() =>
              exportFile(
                "pdf"
              )
            }
          >
            Export PDF
          </Button>
        </Space>

        {/* FILTER SUMMARY */}

        <Alert
          type="info"
          showIcon
          message="Export Filter"
          description={
            <>
              <Text>
                Location:{" "}
                <strong>
                  {location.name}
                </strong>
              </Text>

              <br />

              <Text>
                Period:{" "}
                <strong>
                  {customDateRange
                    ? "Custom Date Range"
                    : RANGE_OPTIONS.find(
                        (
                          item
                        ) =>
                          item.value ===
                          selectedRange
                      )?.label}
                </strong>
              </Text>

              <br />

              <Text>
                Records available:{" "}
                <strong>
                  {
                    historicalData.length
                  }
                </strong>
              </Text>
            </>
          }
          style={{
            marginBottom: 20,
          }}
        />

        {/* HISTORICAL TABLE */}

        <Table
          rowKey={(
            record,
            index
          ) =>
            `${record.timestamp}-${record.location}-${index}`
          }
          columns={
            historicalColumns
          }
          dataSource={
            historicalData
          }
          loading={
            historicalLoading
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal:
              (total) =>
                `Total ${total} records`,
          }}
          scroll={{
            x: 1100,
          }}
          locale={{
            emptyText:
              "No historical environmental data found for this location and time range.",
          }}
        />
      </Card>

      {/* ================================================= */}
      {/* DATA STORAGE INFORMATION */}
      {/* ================================================= */}

      <Divider />

      <Space
        direction="vertical"
        size={4}
      >
        <Text type="secondary">
          Environmental data
          provided by
          Open-Meteo.
        </Text>

        <Text type="secondary">
          Current measurements
          are automatically
          stored in InfluxDB
          Cloud through the
          Flood Forecasting
          backend.
        </Text>

        <Text type="secondary">
          Real-time updates are
          delivered to the
          dashboard through
          Socket.IO.
        </Text>

        <Text type="secondary">
          Historical measurements
          can be filtered by
          location and time
          range.
        </Text>

        <Text type="secondary">
          Historical data can
          be exported in JSON,
          Excel, and PDF formats.
        </Text>

        <Text type="secondary">
          Location coordinates
          are obtained through
          Open-Meteo geocoding.
        </Text>
      </Space>
    </div>
  );
};

export default EnvironmentalData;