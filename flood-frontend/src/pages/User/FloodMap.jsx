import { useState } from "react";

import {
  Card,
  Input,
  Tag,
  Typography,
  Space,
  Divider,
  Empty,
} from "antd";

import {
  SearchOutlined,
  EnvironmentOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;


// =========================================================
// SAMPLE STATION DATA
// =========================================================

const stations = [
  {
    id: "NWS-01",
    name: "Station NWS-01",
    latitude: 34.0151,
    longitude: 71.5249,

    waterLevel: 14.2,
    rainfall: 32,
    flow: 3.8,

    risk: "WATCH",

    lastUpdated: "11:42 AM",
  },

  {
    id: "NWS-02",
    name: "Station NWS-02",
    latitude: 34.0205,
    longitude: 71.5301,

    waterLevel: 11.8,
    rainfall: 18,
    flow: 2.4,

    risk: "NORMAL",

    lastUpdated: "11:40 AM",
  },

  {
    id: "NWS-03",
    name: "Station NWS-03",
    latitude: 34.0087,
    longitude: 71.5184,

    waterLevel: 16.7,
    rainfall: 47,
    flow: 5.2,

    risk: "WARNING",

    lastUpdated: "11:41 AM",
  },

  {
    id: "NWS-04",
    name: "Station NWS-04",
    latitude: 34.0272,
    longitude: 71.5421,

    waterLevel: 19.3,
    rainfall: 68,
    flow: 7.1,

    risk: "CRITICAL",

    lastUpdated: "11:39 AM",
  },
];


// =========================================================
// RISK CONFIGURATION
// =========================================================

const riskConfig = {
  NORMAL: {
    label: "Normal",
    color: "green",
    marker: "🟢",
  },

  WATCH: {
    label: "Watch",
    color: "gold",
    marker: "🟡",
  },

  WARNING: {
    label: "Warning",
    color: "orange",
    marker: "🟠",
  },

  CRITICAL: {
    label: "Critical",
    color: "red",
    marker: "🔴",
  },
};


// =========================================================
// COMPONENT
// =========================================================

const FloodMap = () => {
  const [search, setSearch] = useState("");
  const [selectedStation, setSelectedStation] =
    useState(stations[0]);


  // =======================================================
  // SEARCH
  // =======================================================

  const filteredStations = stations.filter((station) => {
    const query = search.toLowerCase();

    return (
      station.id.toLowerCase().includes(query) ||
      station.name.toLowerCase().includes(query)
    );
  });


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      style={{
        padding: "24px",
        background: "#f5f7fa",
        minHeight: "100%",
      }}
    >

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div
        style={{
          marginBottom: 20,
        }}
      >

        <Title
          level={2}
          style={{
            margin: 0,
          }}
        >
          Flood Map
        </Title>

        <Text type="secondary">
          Monitor flood risk and current conditions
          across monitored locations.
        </Text>

      </div>


      {/* ===================================================
          SEARCH
      =================================================== */}

      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
        }}
      >

        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search station..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          allowClear
        />

      </Card>


      {/* ===================================================
          MAIN MAP AREA
      =================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 340px",
          gap: 16,
          alignItems: "stretch",
        }}
      >

        {/* =================================================
            MAP
        ================================================= */}

        <Card
          styles={{
            body: {
              padding: 0,
            },
          }}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            minHeight: 600,
          }}
        >

          <div
            style={{
              position: "relative",
              height: "600px",

              background:
                "linear-gradient(135deg, #dff3ff, #eef7f2)",

              overflow: "hidden",
            }}
          >

            {/* =============================================
                MAP BACKGROUND
            ============================================= */}

            <div
              style={{
                position: "absolute",
                inset: 0,

                backgroundImage:
                  `
                  linear-gradient(
                    rgba(255,255,255,0.35) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.35) 1px,
                    transparent 1px
                  )
                  `,

                backgroundSize: "40px 40px",
              }}
            />


            {/* =============================================
                RIVER
            ============================================= */}

            <div
              style={{
                position: "absolute",

                width: "120%",
                height: 120,

                background:
                  "rgba(64,169,255,0.35)",

                transform:
                  "rotate(-12deg)",

                left: "-10%",
                top: "42%",

                borderRadius: "50%",
              }}
            />


            {/* =============================================
                STATION MARKERS
            ============================================= */}

            {filteredStations.map((station, index) => {

              const positions = [
                {
                  top: "25%",
                  left: "30%",
                },
                {
                  top: "40%",
                  left: "65%",
                },
                {
                  top: "58%",
                  left: "42%",
                },
                {
                  top: "70%",
                  left: "72%",
                },
              ];

              const position =
                positions[index % positions.length];

              const isSelected =
                selectedStation?.id === station.id;

              return (
                <button
                  key={station.id}
                  onClick={() =>
                    setSelectedStation(station)
                  }
                  title={station.name}
                  style={{
                    position: "absolute",

                    top: position.top,
                    left: position.left,

                    transform:
                      "translate(-50%, -50%)",

                    width: isSelected ? 52 : 42,
                    height: isSelected ? 52 : 42,

                    borderRadius: "50%",

                    border: isSelected
                      ? "4px solid #ffffff"
                      : "3px solid #ffffff",

                    background:
                      riskConfig[
                        station.risk
                      ].color === "green"
                        ? "#52c41a"
                        : riskConfig[
                            station.risk
                          ].color === "gold"
                        ? "#faad14"
                        : riskConfig[
                            station.risk
                          ].color === "orange"
                        ? "#fa8c16"
                        : "#ff4d4f",

                    color: "#ffffff",

                    boxShadow:
                      "0 4px 14px rgba(0,0,0,0.25)",

                    cursor: "pointer",

                    fontSize: 20,

                    zIndex: isSelected
                      ? 5
                      : 2,

                    transition:
                      "all 0.2s ease",
                  }}
                >
                  {riskConfig[station.risk].marker}
                </button>
              );
            })}


            {/* =============================================
                MAP LABEL
            ============================================= */}

            <div
              style={{
                position: "absolute",
                top: 18,
                left: 18,

                background:
                  "rgba(255,255,255,0.92)",

                padding:
                  "8px 12px",

                borderRadius: 8,

                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >

              <Space size={6}>

                <EnvironmentOutlined />

                <Text strong>
                  Flood Monitoring Area
                </Text>

              </Space>

            </div>


            {/* =============================================
                LEGEND
            ============================================= */}

            <Card
              size="small"
              style={{
                position: "absolute",

                bottom: 18,
                left: 18,

                borderRadius: 10,

                boxShadow:
                  "0 4px 16px rgba(0,0,0,0.12)",
              }}
            >

              <Text strong>
                Risk Level
              </Text>

              <Divider
                style={{
                  margin: "8px 0",
                }}
              />

              <Space
                direction="vertical"
                size={5}
              >

                {Object.entries(
                  riskConfig
                ).map(
                  ([key, config]) => (
                    <Space
                      key={key}
                      size={7}
                    >

                      <span>
                        {config.marker}
                      </span>

                      <Text>
                        {config.label}
                      </Text>

                    </Space>
                  )
                )}

              </Space>

            </Card>

          </div>

        </Card>


        {/* =================================================
            STATION DETAILS
        ================================================= */}

        <Card
          title={
            <Space>
              <EnvironmentOutlined />

              <span>
                Station Details
              </span>
            </Space>
          }

          style={{
            borderRadius: 12,
          }}
        >

          {selectedStation ? (

            <>

              {/* ===========================================
                  STATION NAME
              =========================================== */}

              <div
                style={{
                  marginBottom: 20,
                }}
              >

                <Text type="secondary">
                  Monitoring Station
                </Text>

                <Title
                  level={4}
                  style={{
                    margin:
                      "4px 0 0",
                  }}
                >
                  {selectedStation.name}
                </Title>

              </div>


              {/* ===========================================
                  RISK
              =========================================== */}

              <div
                style={{
                  padding: 16,

                  background: "#fafafa",

                  borderRadius: 10,

                  marginBottom: 18,
                }}
              >

                <Text type="secondary">
                  Current Risk
                </Text>

                <div
                  style={{
                    marginTop: 8,
                  }}
                >

                  <Tag
                    color={
                      riskConfig[
                        selectedStation.risk
                      ].color
                    }
                    style={{
                      fontSize: 14,
                      padding:
                        "5px 12px",
                      borderRadius: 6,
                    }}
                  >
                    {
                      riskConfig[
                        selectedStation.risk
                      ].marker
                    }{" "}
                    {
                      riskConfig[
                        selectedStation.risk
                      ].label
                    }
                  </Tag>

                </div>

              </div>


              {/* ===========================================
                  WATER LEVEL
              =========================================== */}

              <div
                style={{
                  marginBottom: 20,
                }}
              >

                <Space
                  align="start"
                  size={12}
                >

                  <DashboardOutlined
                    style={{
                      fontSize: 20,
                      color: "#1677ff",
                    }}
                  />

                  <div>

                    <Text type="secondary">
                      Water Level
                    </Text>

                    <Title
                      level={4}
                      style={{
                        margin:
                          "2px 0 0",
                      }}
                    >
                      {
                        selectedStation.waterLevel
                      }{" "}
                      m
                    </Title>

                  </div>

                </Space>

              </div>


              {/* ===========================================
                  RAINFALL
              =========================================== */}

              <div
                style={{
                  marginBottom: 20,
                }}
              >

                <Space
                  align="start"
                  size={12}
                >

                  <CloudOutlined
                    style={{
                      fontSize: 20,
                      color: "#1677ff",
                    }}
                  />

                  <div>

                    <Text type="secondary">
                      Rainfall
                    </Text>

                    <Title
                      level={4}
                      style={{
                        margin:
                          "2px 0 0",
                      }}
                    >
                      {
                        selectedStation.rainfall
                      }{" "}
                      mm
                    </Title>

                  </div>

                </Space>

              </div>


              {/* ===========================================
                  FLOW
              =========================================== */}

              <div
                style={{
                  marginBottom: 20,
                }}
              >

                <Space
                  align="start"
                  size={12}
                >

                  <ThunderboltOutlined
                    style={{
                      fontSize: 20,
                      color: "#1677ff",
                    }}
                  />

                  <div>

                    <Text type="secondary">
                      Flow
                    </Text>

                    <Title
                      level={4}
                      style={{
                        margin:
                          "2px 0 0",
                      }}
                    >
                      {
                        selectedStation.flow
                      }{" "}
                      m/s
                    </Title>

                  </div>

                </Space>

              </div>


              <Divider />


              {/* ===========================================
                  LAST UPDATED
              =========================================== */}

              <Space>

                <ClockCircleOutlined
                  style={{
                    color: "#8c8c8c",
                  }}
                />

                <Text type="secondary">
                  Last Updated:
                </Text>

                <Text>
                  {
                    selectedStation.lastUpdated
                  }
                </Text>

              </Space>

            </>

          ) : (

            <Empty
              description="Select a monitoring station"
            />

          )}

        </Card>

      </div>

    </div>
  );
};

export default FloodMap;