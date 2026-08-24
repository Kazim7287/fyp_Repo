import {
  Card,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  Alert,
} from "antd";

import {
  RiseOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const { Title, Text } = Typography;


// =========================================================
// MOCK SYSTEM RESPONSE
// =========================================================
//
// IMPORTANT:
//
// current       = measured sensor data
// prediction    = AI predicted future values
// risk          = decision-engine classification
// alert         = user-facing warning/action
//
// These must remain separate.
// =========================================================

const forecastResponse = {
  current: {
    waterLevel: 14.8,
    rainfall: 32,
    flow: 3.8,
    updatedAt: "11:42 AM",
  },

  prediction: {
    waterLevel: [
      {
        time: "Now",
        measured: 14.8,
        forecast: null,
      },
      {
        time: "+1h",
        measured: null,
        forecast: 15.1,
      },
      {
        time: "+3h",
        measured: null,
        forecast: 15.8,
      },
      {
        time: "+6h",
        measured: null,
        forecast: 16.5,
      },
    ],
  },

  expectedCondition: {
    trend: "rising",
    description:
      "Water level is expected to continue rising over the next few hours.",
  },

  risk: {
    current: "WATCH",
    predicted: "WARNING",
    score: 68,
  },

  alert: {
    active: true,
    severity: "WATCH",
    message:
      "Water levels are rising. Stay alert and monitor local flood conditions.",
  },
};


// =========================================================
// RISK CONFIGURATION
// =========================================================

const riskConfig = {
  NORMAL: {
    color: "green",
    icon: "🟢",
    label: "NORMAL",
    description:
      "Flood conditions are currently within normal limits.",
  },

  WATCH: {
    color: "gold",
    icon: "🟡",
    label: "WATCH",
    description:
      "Conditions are changing. Stay alert and continue monitoring.",
  },

  WARNING: {
    color: "orange",
    icon: "🟠",
    label: "WARNING",
    description:
      "Flood conditions may become dangerous. Prepare to take action.",
  },

  CRITICAL: {
    color: "red",
    icon: "🔴",
    label: "CRITICAL",
    description:
      "Dangerous flood conditions detected. Follow emergency instructions.",
  },
};


// =========================================================
// CUSTOM CHART TOOLTIP
// =========================================================

const ForecastTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const measured = payload.find(
    (item) => item.dataKey === "measured"
  );

  const forecast = payload.find(
    (item) => item.dataKey === "forecast"
  );

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "12px 14px",
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.10)",
      }}
    >
      <Text strong>
        {label}
      </Text>

      <div style={{ marginTop: 8 }}>

        {measured?.value != null && (
          <div>
            <Text type="secondary">
              Measured:
            </Text>{" "}
            <strong>
              {measured.value} m
            </strong>
          </div>
        )}

        {forecast?.value != null && (
          <div>
            <Text type="secondary">
              Forecast:
            </Text>{" "}
            <strong>
              {forecast.value} m
            </strong>
          </div>
        )}

      </div>
    </div>
  );
};


// =========================================================
// FORECAST PAGE
// =========================================================

const Forecast = () => {

  const data = forecastResponse;

  const currentRisk =
    riskConfig[data.risk.current];

  const predictedRisk =
    riskConfig[data.risk.predicted];


  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f5f7fa",
        padding: 24,
      }}
    >

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div
        style={{
          marginBottom: 24,
        }}
      >

        <Title
          level={2}
          style={{
            margin: 0,
          }}
        >
          Flood Forecast
        </Title>

        <Text type="secondary">
          Understand current conditions, future
          water-level predictions, and flood risk.
        </Text>

      </div>


      {/* ===================================================
          SECTION 1 — CURRENT CONDITION
      =================================================== */}

      <Card
        title={
          <Space>
            <EnvironmentOutlined />

            <span>
              Current Condition
            </span>
          </Space>
        }

        extra={
          <Text type="secondary">
            Updated {data.current.updatedAt}
          </Text>
        }

        style={{
          borderRadius: 12,
          marginBottom: 16,
        }}
      >

        <Row
          gutter={[
            24,
            24,
          ]}
        >

          <Col
            xs={24}
            sm={8}
          >

            <Statistic
              title="Water Level"
              value={
                data.current.waterLevel
              }
              precision={1}
              suffix="m"
            />

            <Text type="secondary">
              Measured
            </Text>

          </Col>


          <Col
            xs={24}
            sm={8}
          >

            <Statistic
              title="Rainfall"
              value={
                data.current.rainfall
              }
              suffix="mm"
            />

            <Text type="secondary">
              Current rainfall
            </Text>

          </Col>


          <Col
            xs={24}
            sm={8}
          >

            <Statistic
              title="Flow"
              value={
                data.current.flow
              }
              precision={1}
              suffix="m/s"
            />

            <Text type="secondary">
              Current flow rate
            </Text>

          </Col>

        </Row>

      </Card>


      {/* ===================================================
          SECTION 2 — AI PREDICTION
      =================================================== */}

      <Card
        title={
          <Space>
            <RiseOutlined />

            <span>
              AI Water-Level Prediction
            </span>
          </Space>
        }

        style={{
          borderRadius: 12,
          marginBottom: 16,
        }}
      >

        <Alert
          type="info"
          showIcon
          message="Prediction is not the risk level"
          description="The chart shows what the AI model expects to happen. Risk classification is calculated separately by the decision engine."
          style={{
            marginBottom: 24,
          }}
        />


        {/* CHART LEGEND */}

        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >

          <Space size={8}>

            <span
              style={{
                width: 28,
                height: 4,
                display: "inline-block",
                background: "#1677ff",
                borderRadius: 4,
              }}
            />

            <Text>
              Measured
            </Text>

          </Space>


          <Space size={8}>

            <span
              style={{
                width: 28,
                height: 0,
                display: "inline-block",
                borderTop:
                  "4px dashed #722ed1",
              }}
            />

            <Text>
              AI Forecast
            </Text>

          </Space>

        </div>


        {/* CHART */}

        <div
          style={{
            width: "100%",
            height: 400,
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={
                data.prediction.waterLevel
              }

              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="time"
              />

              <YAxis
                domain={[
                  13,
                  18,
                ]}
                tickFormatter={(value) =>
                  `${value} m`
                }
              />

              <Tooltip
                content={
                  <ForecastTooltip />
                }
              />


              {/* NOW MARKER */}

              <ReferenceLine
                x="Now"
                stroke="#8c8c8c"
                strokeDasharray="5 5"
                label={{
                  value: "CURRENT",
                  position: "insideTop",
                }}
              />


              {/* MEASURED */}

              <Line
                type="monotone"
                dataKey="measured"
                stroke="#1677ff"
                strokeWidth={4}
                dot={{
                  r: 6,
                }}
                connectNulls={false}
              />


              {/* AI FORECAST */}

              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#722ed1"
                strokeWidth={4}
                strokeDasharray="8 6"
                dot={{
                  r: 6,
                }}
                activeDot={{
                  r: 8,
                }}
                connectNulls={true}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* FORECAST VALUES */}

        <Divider />

        <Row
          gutter={[
            12,
            12,
          ]}
        >

          {data.prediction.waterLevel.map(
            (item) => {

              const value =
                item.measured ??
                item.forecast;

              const isMeasured =
                item.measured != null;

              return (
                <Col
                  xs={12}
                  sm={6}
                  key={item.time}
                >

                  <Card
                    size="small"
                    style={{
                      background:
                        isMeasured
                          ? "#f0f5ff"
                          : "#f9f0ff",
                      border: "none",
                    }}
                  >

                    <Text type="secondary">
                      {item.time}
                    </Text>

                    <Title
                      level={4}
                      style={{
                        margin:
                          "6px 0",
                      }}
                    >
                      {value} m
                    </Title>

                    <Text
                      type="secondary"
                    >
                      {isMeasured
                        ? "Measured"
                        : "AI Forecast"}
                    </Text>

                  </Card>

                </Col>
              );
            }
          )}

        </Row>

      </Card>


      {/* ===================================================
          SECTION 3 — EXPECTED FUTURE CONDITION
      =================================================== */}

      <Card
        title={
          <Space>
            <RiseOutlined />

            <span>
              Expected Future Condition
            </span>
          </Space>
        }

        style={{
          borderRadius: 12,
          marginBottom: 16,
        }}
      >

        <Row
          gutter={[
            24,
            24,
          ]}
          align="middle"
        >

          <Col
            xs={24}
            md={16}
          >

            <Title
              level={4}
              style={{
                marginTop: 0,
              }}
            >
              Water level is expected to rise
            </Title>

            <Text type="secondary">
              {data.expectedCondition.description}
            </Text>

          </Col>


          <Col
            xs={24}
            md={8}
          >

            <Card
              size="small"
              style={{
                background: "#fff7e6",
                border:
                  "1px solid #ffd591",
              }}
            >

              <Space>

                <RiseOutlined
                  style={{
                    color: "#fa8c16",
                  }}
                />

                <div>

                  <Text type="secondary">
                    Trend
                  </Text>

                  <div>
                    <strong>
                      RISING
                    </strong>
                  </div>

                </div>

              </Space>

            </Card>

          </Col>

        </Row>

      </Card>


      {/* ===================================================
          SECTION 4 — RISK ASSESSMENT
      =================================================== */}

      <Card
        title={
          <Space>
            <WarningOutlined />

            <span>
              Risk Assessment
            </span>
          </Space>
        }

        style={{
          borderRadius: 12,
          marginBottom: 16,
        }}
      >

        <Alert
          type="warning"
          showIcon
          message="Risk is calculated separately from prediction"
          description="The decision engine evaluates current measurements and expected future conditions to determine the appropriate risk level."
          style={{
            marginBottom: 24,
          }}
        />


        <Row
          gutter={[
            24,
            24,
          ]}
        >

          {/* CURRENT RISK */}

          <Col
            xs={24}
            md={12}
          >

            <Card
              style={{
                borderRadius: 10,
                background:
                  "#fffbe6",
              }}
            >

              <Text type="secondary">
                Current Risk Level
              </Text>

              <div
                style={{
                  marginTop: 12,
                }}
              >

                <Tag
                  color={currentRisk.color}
                  style={{
                    fontSize: 16,
                    padding:
                      "8px 16px",
                    borderRadius: 8,
                  }}
                >
                  {currentRisk.icon}{" "}
                  {currentRisk.label}
                </Tag>

              </div>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 12,
                }}
              >
                {currentRisk.description}
              </Text>

            </Card>

          </Col>


          {/* PREDICTED RISK */}

          <Col
            xs={24}
            md={12}
          >

            <Card
              style={{
                borderRadius: 10,
                background:
                  "#f9f0ff",
              }}
            >

              <Text type="secondary">
                Expected Risk
              </Text>

              <div
                style={{
                  marginTop: 12,
                }}
              >

                <Tag
                  color={predictedRisk.color}
                  style={{
                    fontSize: 16,
                    padding:
                      "8px 16px",
                    borderRadius: 8,
                  }}
                >
                  {predictedRisk.icon}{" "}
                  {predictedRisk.label}
                </Tag>

              </div>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 12,
                }}
              >
                Based on predicted future
                conditions.
              </Text>

            </Card>

          </Col>

        </Row>


        {/* RISK SCORE */}

        <Divider />

        <Space>

          <Text type="secondary">
            Risk Assessment Score:
          </Text>

          <strong>
            {data.risk.score} / 100
          </strong>

        </Space>

      </Card>


      {/* ===================================================
          SECTION 5 — ALERT / ACTION
      =================================================== */}

      <Card
        title={
          <Space>
            <ThunderboltOutlined />

            <span>
              Alert & Recommended Action
            </span>
          </Space>
        }

        style={{
          borderRadius: 12,
        }}
      >

        {data.alert.active ? (

          <Alert
            type={
              data.alert.severity ===
              "CRITICAL"
                ? "error"
                : "warning"
            }

            showIcon

            message={
              data.alert.severity ===
              "CRITICAL"
                ? "Critical Flood Alert"
                : "Flood Risk Alert"
            }

            description={
              <Space
                direction="vertical"
                size={4}
              >

                <span>
                  {data.alert.message}
                </span>

                <strong>
                  Recommended action:
                </strong>

                <span>
                  Continue monitoring the
                  flood situation and follow
                  official emergency guidance.
                </span>

              </Space>
            }

          />

        ) : (

          <Alert
            type="success"
            showIcon
            message="No active flood alert"
            description="Current conditions do not require immediate action."
          />

        )}

      </Card>


      {/* ===================================================
          FOOTER INFORMATION
      =================================================== */}

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
        }}
      >

        <Space>

          <ClockCircleOutlined />

          <Text type="secondary">
            Forecast horizon: 6 hours
          </Text>

        </Space>

      </div>

    </div>
  );
};


export default Forecast;