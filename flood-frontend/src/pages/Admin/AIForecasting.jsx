import {
  Card,
  Col,
  Row,
  Typography,
  Space,
  Statistic,
  Tag,
  Progress,
  Steps,
  Divider,
  Alert,
} from "antd";

import {
  DashboardOutlined,
  DatabaseOutlined,
  CloudOutlined,
  RobotOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  ArrowUpOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ComposedChart,
} from "recharts";

const { Title, Text, Paragraph } = Typography;


/* =========================================================
   SAMPLE FORECAST DATA
========================================================= */

const forecastData = [
  {
    time: "10:00",
    actual: 12.4,
    predicted: null,
    upper: null,
    lower: null,
  },
  {
    time: "11:00",
    actual: 12.7,
    predicted: null,
    upper: null,
    lower: null,
  },
  {
    time: "12:00",
    actual: 13.0,
    predicted: null,
    upper: null,
    lower: null,
  },
  {
    time: "13:00",
    actual: 13.4,
    predicted: null,
    upper: null,
    lower: null,
  },
  {
    time: "14:00",
    actual: 13.9,
    predicted: null,
    upper: null,
    lower: null,
  },
  {
    time: "15:00",
    actual: 14.5,
    predicted: 14.5,
    upper: 14.8,
    lower: 14.2,
  },
  {
    time: "16:00",
    actual: null,
    predicted: 15.2,
    upper: 15.7,
    lower: 14.7,
  },
  {
    time: "17:00",
    actual: null,
    predicted: 15.6,
    upper: 16.2,
    lower: 15.0,
  },
  {
    time: "18:00",
    actual: null,
    predicted: 15.9,
    upper: 16.6,
    lower: 15.2,
  },
  {
    time: "19:00",
    actual: null,
    predicted: 16.3,
    upper: 17.0,
    lower: 15.6,
  },
  {
    time: "20:00",
    actual: null,
    predicted: 16.8,
    upper: 17.6,
    lower: 16.0,
  },
  {
    time: "21:00",
    actual: null,
    predicted: 17.2,
    upper: 18.1,
    lower: 16.3,
  },
];


/* =========================================================
   RAINFALL / WATER LEVEL DATA
========================================================= */

const environmentalData = [
  {
    time: "10:00",
    rainfall: 4,
    waterLevel: 12.4,
  },
  {
    time: "11:00",
    rainfall: 7,
    waterLevel: 12.7,
  },
  {
    time: "12:00",
    rainfall: 11,
    waterLevel: 13.0,
  },
  {
    time: "13:00",
    rainfall: 18,
    waterLevel: 13.4,
  },
  {
    time: "14:00",
    rainfall: 24,
    waterLevel: 13.9,
  },
  {
    time: "15:00",
    rainfall: 38,
    waterLevel: 14.5,
  },
  {
    time: "16:00",
    rainfall: 42,
    waterLevel: 15.2,
  },
  {
    time: "17:00",
    rainfall: 46,
    waterLevel: 15.6,
  },
  {
    time: "18:00",
    rainfall: 52,
    waterLevel: 15.9,
  },
  {
    time: "19:00",
    rainfall: 57,
    waterLevel: 16.3,
  },
  {
    time: "20:00",
    rainfall: 61,
    waterLevel: 16.8,
  },
  {
    time: "21:00",
    rainfall: 65,
    waterLevel: 17.2,
  },
];


/* =========================================================
   RISK PROBABILITY
========================================================= */

const riskData = [
  {
    time: "Now",
    normal: 22,
    warning: 64,
    critical: 14,
  },
  {
    time: "+1h",
    normal: 16,
    warning: 67,
    critical: 17,
  },
  {
    time: "+2h",
    normal: 12,
    warning: 63,
    critical: 25,
  },
  {
    time: "+3h",
    normal: 8,
    warning: 58,
    critical: 34,
  },
  {
    time: "+4h",
    normal: 5,
    warning: 51,
    critical: 44,
  },
  {
    time: "+5h",
    normal: 3,
    warning: 43,
    critical: 54,
  },
  {
    time: "+6h",
    normal: 2,
    warning: 36,
    critical: 62,
  },
];


/* =========================================================
   MODEL PERFORMANCE
========================================================= */

const modelPerformance = [
  {
    model: "LSTM",
    accuracy: 91,
    confidence: 88,
  },
  {
    model: "Random Forest",
    accuracy: 89,
    confidence: 86,
  },
  {
    model: "XGBoost",
    accuracy: 93,
    confidence: 91,
  },
  {
    model: "Decision Fusion",
    accuracy: 95,
    confidence: 94,
  },
];


/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        padding: "12px 14px",
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Text strong>
        {label}
      </Text>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          style={{
            marginTop: 6,
          }}
        >
          <Text type="secondary">
            {item.name}:{" "}
          </Text>

          <Text strong>
            {item.value} m
          </Text>
        </div>
      ))}
    </div>
  );
};


/* =========================================================
   COMPONENT
========================================================= */

const AIForecasting = () => {
  return (
    <div>

      {/* =====================================================
          HEADER
      ===================================================== */}

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
          AI & Forecasting
        </Title>

        <Text type="secondary">
          AI-driven flood prediction, water-level
          forecasting, and probabilistic risk assessment.
        </Text>
      </div>


      {/* =====================================================
          TOP STATISTICS
      ===================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Water Level"
              value={14.5}
              precision={1}
              suffix="m"
              prefix={
                <DashboardOutlined />
              }
            />

            <Tag
              color="warning"
              style={{
                marginTop: 10,
              }}
            >
              Elevated
            </Tag>
          </Card>
        </Col>


        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Forecast Horizon"
              value={6}
              suffix="hours"
              prefix={
                <LineChartOutlined />
              }
            />

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 8,
              }}
            >
              Short-term prediction
            </Text>
          </Card>
        </Col>


        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Prediction Confidence"
              value={87}
              suffix="%"
              prefix={
                <ExperimentOutlined />
              }
            />

            <Progress
              percent={87}
              size="small"
              showInfo={false}
              style={{
                marginTop: 8,
              }}
            />
          </Card>
        </Col>


        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Risk"
              value="MEDIUM"
              prefix={
                <SafetyCertificateOutlined />
              }
            />

            <Tag
              color="warning"
              style={{
                marginTop: 10,
              }}
            >
              Moderate Flood Risk
            </Tag>
          </Card>
        </Col>

      </Row>


      {/* =====================================================
          MAIN FORECAST CHART
      ===================================================== */}

      <Card
        title={
          <Space>
            <LineChartOutlined />

            <span>
              Water-Level Forecast
            </span>
          </Space>
        }
        extra={
          <Tag color="blue">
            LSTM Forecast
          </Tag>
        }
        style={{
          marginBottom: 24,
        }}
      >

        <div
          style={{
            width: "100%",
            height: 430,
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <ComposedChart
              data={forecastData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <defs>

                <linearGradient
                  id="forecastArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="95%"
                    stopOpacity={0}
                  />
                </linearGradient>

              </defs>


              <CartesianGrid
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="time"
              />


              <YAxis
                domain={[
                  10,
                  20,
                ]}
                label={{
                  value: "Water Level (m)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />


              <Tooltip
                content={
                  <ForecastTooltip />
                }
              />


              <Legend />


              {/* WARNING LEVEL */}

              <ReferenceLine
                y={15}
                strokeDasharray="5 5"
                label="Warning Threshold"
              />


              {/* CRITICAL LEVEL */}

              <ReferenceLine
                y={17}
                strokeDasharray="5 5"
                label="Critical Threshold"
              />


              {/* CONFIDENCE BAND */}

              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#forecastArea)"
                name="Upper Confidence"
              />


              {/* ACTUAL */}

              <Line
                type="monotone"
                dataKey="actual"
                name="Observed"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                connectNulls={false}
              />


              {/* PREDICTION */}

              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                strokeWidth={3}
                strokeDasharray="7 5"
                dot={{
                  r: 4,
                }}
              />

            </ComposedChart>

          </ResponsiveContainer>

        </div>


        <Divider />


        <Row
          gutter={[
            16,
            16,
          ]}
        >

          <Col xs={24} sm={8}>

            <Statistic
              title="1 Hour Prediction"
              value={15.2}
              precision={1}
              suffix="m"
              prefix={
                <ArrowUpOutlined />
              }
            />

          </Col>


          <Col xs={24} sm={8}>

            <Statistic
              title="3 Hour Prediction"
              value={15.9}
              precision={1}
              suffix="m"
            />

          </Col>


          <Col xs={24} sm={8}>

            <Statistic
              title="6 Hour Prediction"
              value={17.2}
              precision={1}
              suffix="m"
            />

          </Col>

        </Row>

      </Card>


      {/* =====================================================
          ENVIRONMENTAL CORRELATION
      ===================================================== */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >

        <Col xs={24} lg={14}>

          <Card
            title={
              <Space>
                <CloudOutlined />

                <span>
                  Rainfall vs Water-Level Response
                </span>
              </Space>
            }
          >

            <div
              style={{
                width: "100%",
                height: 350,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={environmentalData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="waterLevel"
                    name="Water Level (m)"
                    strokeWidth={3}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </Card>

        </Col>


        {/* ===================================================
            RISK PROBABILITY
        =================================================== */}

        <Col xs={24} lg={10}>

          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />

                <span>
                  Flood-Risk Probability
                </span>
              </Space>
            }
          >

            <div
              style={{
                width: "100%",
                height: 350,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={riskData}
                  stackOffset="expand"
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
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
                    tickFormatter={(value) =>
                      `${Math.round(value * 100)}%`
                    }
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="normal"
                    stackId="risk"
                    name="Normal"
                  />

                  <Bar
                    dataKey="warning"
                    stackId="risk"
                    name="Warning"
                  />

                  <Bar
                    dataKey="critical"
                    stackId="risk"
                    name="Critical"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          AI PIPELINE
      ===================================================== */}

      <Card
        title={
          <Space>
            <RobotOutlined />

            <span>
              AI Flood Forecasting Pipeline
            </span>
          </Space>
        }
        style={{
          marginBottom: 24,
        }}
      >

        <Steps
          direction="vertical"
          current={4}
          items={[
            {
              title: "Current Water Level",
              description:
                "Real-time water-level measurements received from monitoring stations.",
              icon:
                <DashboardOutlined />,
            },

            {
              title: "Historical Data",
              description:
                "Historical water level, rainfall, flow, and environmental observations.",
              icon:
                <DatabaseOutlined />,
            },

            {
              title: "Environmental Data",
              description:
                "Rainfall, temperature, humidity, soil moisture, terrain, and related variables.",
              icon:
                <CloudOutlined />,
            },

            {
              title: "AI Models",
              description:
                "LSTM, Random Forest, XGBoost, and Decision Fusion process engineered features.",
              icon:
                <RobotOutlined />,
            },

            {
              title: "Prediction",
              description:
                "Future water-level forecasts and probabilistic flood-risk predictions are generated.",
              icon:
                <LineChartOutlined />,
            },

            {
              title: "Risk Assessment",
              description:
                "Predictions are transformed into Normal, Warning, or Critical risk levels.",
              icon:
                <SafetyCertificateOutlined />,
            },
          ]}
        />

      </Card>


      {/* =====================================================
          MODEL PERFORMANCE
      ===================================================== */}

      <Card
        title={
          <Space>
            <ExperimentOutlined />

            <span>
              AI Model Performance
            </span>
          </Space>
        }
        style={{
          marginBottom: 24,
        }}
      >

        <div
          style={{
            width: "100%",
            height: 350,
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={modelPerformance}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="model"
              />

              <YAxis
                domain={[
                  0,
                  100,
                ]}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="accuracy"
                name="Accuracy (%)"
              />

              <Bar
                dataKey="confidence"
                name="Confidence (%)"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </Card>


      {/* =====================================================
          CURRENT RISK ASSESSMENT
      ===================================================== */}

      <Row
        gutter={[
          16,
          16,
        ]}
      >

        <Col xs={24} lg={12}>

          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />

                <span>
                  Current Flood Risk
                </span>
              </Space>
            }
          >

            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
              }}
            >

              <Title
                level={1}
                style={{
                  marginBottom: 4,
                }}
              >
                MEDIUM
              </Title>

              <Tag
                color="warning"
              >
                Moderate Flood Risk
              </Tag>

            </div>


            <Progress
              percent={64}
              status="active"
              strokeWidth={12}
            />


            <Paragraph
              type="secondary"
              style={{
                marginTop: 16,
              }}
            >
              The current prototype predicts a
              sustained increase in water level.
              The probability of reaching the
              warning threshold increases throughout
              the forecast horizon.
            </Paragraph>

          </Card>

        </Col>


        <Col xs={24} lg={12}>

          <Card
            title={
              <Space>
                <WarningOutlined />

                <span>
                  Forecast Advisory
                </span>
              </Space>
            }
          >

            <Alert
              type="warning"
              showIcon
              message="Increasing Flood Risk"
              description={
                "Forecasted water levels are approaching the warning threshold. Continuous monitoring is recommended."
              }
            />


            <Divider />


            <Space
              direction="vertical"
              style={{
                width: "100%",
              }}
            >

              <Text strong>
                Model Status
              </Text>

              <Space
                wrap
              >

                <Tag color="green">
                  LSTM Online
                </Tag>

                <Tag color="green">
                  Random Forest Online
                </Tag>

                <Tag color="green">
                  XGBoost Online
                </Tag>

                <Tag color="blue">
                  Fusion Active
                </Tag>

              </Space>

            </Space>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          PROTOTYPE NOTICE
      ===================================================== */}

      <Card
        style={{
          marginTop: 24,
        }}
      >

        <Space align="start">

          <ThunderboltOutlined
            style={{
              fontSize: 22,
            }}
          />

          <div>

            <Text strong>
              Prototype 1 — AI Simulation
            </Text>

            <Paragraph
              type="secondary"
              style={{
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              The values and model performance
              metrics displayed above are simulated
              prototype data. During the AI development
              phase, these components can be connected
              to the actual LSTM forecasting,
              Random Forest, XGBoost, and Decision
              Fusion inference pipelines.
            </Paragraph>

          </div>

        </Space>

      </Card>

    </div>
  );
};

export default AIForecasting;