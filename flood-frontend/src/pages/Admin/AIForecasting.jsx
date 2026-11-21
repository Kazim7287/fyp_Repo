
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
  Badge,
  Tooltip as AntTooltip,
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
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
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
  ComposedChart,
} from "recharts";

import "./AIForecasting.css";

const { Title, Text, Paragraph } = Typography;

// =========================================================
// PROTOTYPE DATA
// These values are illustrative, not live model outputs.
// =========================================================

const forecastData = [
  { time: "10:00", actual: 12.4, predicted: null, upper: null, lower: null },
  { time: "11:00", actual: 12.7, predicted: null, upper: null, lower: null },
  { time: "12:00", actual: 13.0, predicted: null, upper: null, lower: null },
  { time: "13:00", actual: 13.4, predicted: null, upper: null, lower: null },
  { time: "14:00", actual: 13.9, predicted: null, upper: null, lower: null },
  { time: "15:00", actual: 14.5, predicted: 14.5, upper: 14.8, lower: 14.2 },
  { time: "16:00", actual: null, predicted: 15.2, upper: 15.7, lower: 14.7 },
  { time: "17:00", actual: null, predicted: 15.6, upper: 16.2, lower: 15.0 },
  { time: "18:00", actual: null, predicted: 15.9, upper: 16.6, lower: 15.2 },
  { time: "19:00", actual: null, predicted: 16.3, upper: 17.0, lower: 15.6 },
  { time: "20:00", actual: null, predicted: 16.8, upper: 17.6, lower: 16.0 },
  { time: "21:00", actual: null, predicted: 17.2, upper: 18.1, lower: 16.3 },
];

const environmentalData = [
  { time: "10:00", rainfall: 4, waterLevel: 12.4 },
  { time: "11:00", rainfall: 7, waterLevel: 12.7 },
  { time: "12:00", rainfall: 11, waterLevel: 13.0 },
  { time: "13:00", rainfall: 18, waterLevel: 13.4 },
  { time: "14:00", rainfall: 24, waterLevel: 13.9 },
  { time: "15:00", rainfall: 38, waterLevel: 14.5 },
  { time: "16:00", rainfall: 42, waterLevel: 15.2 },
  { time: "17:00", rainfall: 46, waterLevel: 15.6 },
  { time: "18:00", rainfall: 52, waterLevel: 15.9 },
  { time: "19:00", rainfall: 57, waterLevel: 16.3 },
  { time: "20:00", rainfall: 61, waterLevel: 16.8 },
  { time: "21:00", rainfall: 65, waterLevel: 17.2 },
];

const riskData = [
  { time: "Now", normal: 22, warning: 64, critical: 14 },
  { time: "+1h", normal: 16, warning: 67, critical: 17 },
  { time: "+2h", normal: 12, warning: 63, critical: 25 },
  { time: "+3h", normal: 8, warning: 58, critical: 34 },
  { time: "+4h", normal: 5, warning: 51, critical: 44 },
  { time: "+5h", normal: 3, warning: 43, critical: 54 },
  { time: "+6h", normal: 2, warning: 36, critical: 62 },
];

const modelPerformance = [
  { model: "LSTM", accuracy: 91, confidence: 88 },
  { model: "Random Forest", accuracy: 89, confidence: 86 },
  { model: "XGBoost", accuracy: 93, confidence: 91 },
  { model: "Decision Fusion", accuracy: 95, confidence: 94 },
];

// =========================================================
// CHART COLORS
// =========================================================

const CHART_COLORS = {
  primary: "#1677ff",
  secondary: "#13a8a8",
  prediction: "#722ed1",
  warning: "#faad14",
  critical: "#dc4446",
  normal: "#16a36a",
  grid: "#edf1f6",
  text: "#8491a3",
};

// =========================================================
// SHARED CHART TOOLTIP
// =========================================================

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const visibleItems = payload.filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.name !== "Upper range" &&
      item.name !== "Lower range"
  );

  return (
    <div className="ai-chart-tooltip">
      <Text strong className="ai-chart-tooltip__heading">
        {label}
      </Text>

      {visibleItems.map((item) => (
        <div className="ai-chart-tooltip__row" key={item.dataKey}>
          <span
            className="ai-chart-tooltip__dot"
            style={{ background: item.color || item.stroke }}
          />

          <Text type="secondary">{item.name}</Text>

          <Text strong>
            {Number(item.value).toFixed(1)} m
          </Text>
        </div>
      ))}
    </div>
  );
};

const RiskTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="ai-chart-tooltip">
      <Text strong className="ai-chart-tooltip__heading">
        {label}
      </Text>

      {payload.map((item) => (
        <div className="ai-chart-tooltip__row" key={item.dataKey}>
          <span
            className="ai-chart-tooltip__dot"
            style={{ background: item.color }}
          />

          <Text type="secondary">{item.name}</Text>

          <Text strong>{item.value}%</Text>
        </div>
      ))}
    </div>
  );
};

// =========================================================
// SECTION HEADER
// =========================================================

const SectionHeading = ({ icon, title, subtitle, extra }) => (
  <div className="ai-section-heading">
    <div className="ai-section-heading__left">
      <div className="ai-section-heading__icon">{icon}</div>

      <div>
        <Text strong className="ai-section-heading__title">
          {title}
        </Text>

        {subtitle && (
          <Text className="ai-section-heading__subtitle">
            {subtitle}
          </Text>
        )}
      </div>
    </div>

    {extra && (
      <div className="ai-section-heading__extra">
        {extra}
      </div>
    )}
  </div>
);

// =========================================================
// KPI CARD
// =========================================================

const MetricCard = ({
  title,
  value,
  suffix,
  precision,
  icon,
  color,
  background,
  description,
  tag,
  progress,
}) => (
  <Card className="ai-metric-card">
    <div className="ai-metric-card__top">
      <Text className="ai-metric-card__label">{title}</Text>

      <span
        className="ai-metric-card__icon"
        style={{ color, background }}
      >
        {icon}
      </span>
    </div>

    <Statistic
      value={value}
      precision={precision}
      suffix={suffix}
      valueStyle={{
        color: "#172b4d",
        fontSize: 28,
        fontWeight: 700,
      }}
    />

    {progress !== undefined && (
      <Progress
        percent={progress}
        size="small"
        showInfo={false}
        strokeColor={color}
        trailColor="#edf1f6"
        className="ai-metric-card__progress"
      />
    )}

    <div className="ai-metric-card__bottom">
      {tag || (
        <Text type="secondary">{description}</Text>
      )}
    </div>
  </Card>
);

// =========================================================
// COMPONENT
// =========================================================

const AIForecasting = () => {
  const riskHorizon = riskData[riskData.length - 1];

  return (
    <div className="ai-forecast-page">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="ai-page-header">
        <div className="ai-page-header__main">
          <div className="ai-page-header__icon">
            <RobotOutlined />
          </div>

          <div>
            <Title level={3} className="ai-page-header__title">
              AI & Forecasting
            </Title>

            <Text className="ai-page-header__subtitle">
              Water-level forecasting, environmental analysis,
              and probabilistic flood-risk assessment.
            </Text>
          </div>
        </div>

        <div className="ai-page-header__status">
          <Badge status="processing" text="Prototype simulation" />
          <Tag color="blue">6-hour forecast</Tag>
        </div>
      </div>

      {/* ===================================================
          PROTOTYPE NOTICE
      =================================================== */}

      <Alert
        className="ai-prototype-alert"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Prototype forecasting dashboard"
        description="The measurements, forecast outputs, risk probabilities, and model-performance figures on this page are illustrative sample data. They are not live sensor readings, verified predictions, or measured model-validation results."
      />

      {/* ===================================================
          TOP METRICS
      =================================================== */}

      <Row gutter={[16, 16]} className="ai-metrics-row">

        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Current Water Level"
            value={14.5}
            precision={1}
            suffix="m"
            icon={<DashboardOutlined />}
            color="#1677ff"
            background="#eaf2ff"
            description="Illustrative observed value"
            tag={<Tag color="processing">Sample measurement</Tag>}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Forecast Horizon"
            value={6}
            suffix="hours"
            icon={<LineChartOutlined />}
            color="#13a8a8"
            background="#e6f8f7"
            description="Short-term prediction window"
            tag={<Tag color="cyan">Short-term</Tag>}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Prediction Confidence"
            value={87}
            suffix="%"
            icon={<ExperimentOutlined />}
            color="#722ed1"
            background="#f3eaff"
            progress={87}
            description="Illustrative confidence value"
            tag={<Tag color="purple">Sample value</Tag>}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Current Risk"
            value="MEDIUM"
            icon={<SafetyCertificateOutlined />}
            color="#d97706"
            background="#fff5e6"
            description="Illustrative risk classification"
            tag={<Tag color="warning">Moderate risk</Tag>}
          />
        </Col>

      </Row>

      {/* ===================================================
          WATER LEVEL FORECAST
      =================================================== */}

      <Card
        className="ai-panel-card ai-main-forecast"
        title={
          <SectionHeading
            icon={<LineChartOutlined />}
            title="Water-Level Forecast"
            subtitle="Observed measurements and illustrative future predictions"
            extra={<Tag color="purple">LSTM sample output</Tag>}
          />
        }
      >
        <div className="ai-chart-container ai-chart-container--large">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 15, right: 20, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="aiObservedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1677ff" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#1677ff" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={15}
              />

              <YAxis
                domain={[10, 20]}
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(value) => `${value}m`}
              />

              <Tooltip content={<ForecastTooltip />} />

              <Legend
                verticalAlign="bottom"
                height={35}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              />

              <ReferenceLine
                y={15}
                stroke={CHART_COLORS.warning}
                strokeDasharray="6 5"
                label={{
                  value: "Sample warning level",
                  position: "insideTopRight",
                  fill: CHART_COLORS.warning,
                  fontSize: 10,
                }}
              />

              <ReferenceLine
                y={17}
                stroke={CHART_COLORS.critical}
                strokeDasharray="6 5"
                label={{
                  value: "Sample critical level",
                  position: "insideTopRight",
                  fill: CHART_COLORS.critical,
                  fontSize: 10,
                }}
              />

              <Area
                type="monotone"
                dataKey="actual"
                name="Observed"
                stroke={CHART_COLORS.primary}
                strokeWidth={2.8}
                fill="url(#aiObservedGradient)"
                connectNulls={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="upper"
                name="Upper prediction range"
                stroke="#b9a1e8"
                strokeWidth={1.5}
                strokeDasharray="3 5"
                dot={false}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="lower"
                name="Lower prediction range"
                stroke="#b9a1e8"
                strokeWidth={1.5}
                strokeDasharray="3 5"
                dot={false}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                stroke={CHART_COLORS.prediction}
                strokeWidth={3}
                strokeDasharray="7 5"
                dot={{ r: 3, fill: CHART_COLORS.prediction }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <Divider />

        <Row gutter={[16, 16]} className="ai-forecast-summary">

          <Col xs={24} sm={8}>
            <div className="ai-forecast-summary__item">
              <Text className="ai-forecast-summary__label">
                1-hour prediction
              </Text>

              <Statistic
                value={15.2}
                precision={1}
                suffix="m"
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: "#1677ff", fontSize: 23, fontWeight: 700 }}
              />
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="ai-forecast-summary__item">
              <Text className="ai-forecast-summary__label">
                3-hour prediction
              </Text>

              <Statistic
                value={15.9}
                precision={1}
                suffix="m"
                valueStyle={{ color: "#1677ff", fontSize: 23, fontWeight: 700 }}
              />
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="ai-forecast-summary__item">
              <Text className="ai-forecast-summary__label">
                6-hour prediction
              </Text>

              <Statistic
                value={17.2}
                precision={1}
                suffix="m"
                valueStyle={{ color: "#d97706", fontSize: 23, fontWeight: 700 }}
              />
            </div>
          </Col>

        </Row>

        <div className="ai-chart-note">
          <InfoCircleOutlined />
          Prediction boundaries are illustrative ranges, not statistically
          calibrated confidence intervals.
        </div>
      </Card>

      {/* ===================================================
          ENVIRONMENTAL CORRELATION + RISK
      =================================================== */}

      <Row gutter={[16, 16]} className="ai-chart-row">

        <Col xs={24} xl={14}>
          <Card
            className="ai-panel-card ai-secondary-chart-card"
            title={
              <SectionHeading
                icon={<CloudOutlined />}
                title="Rainfall vs Water-Level Response"
                subtitle="Illustrative environmental relationship"
              />
            }
          >
            <div className="ai-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={environmentalData}
                  margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke={CHART_COLORS.grid}
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    yAxisId="rainfall"
                    orientation="left"
                    tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                    tickFormatter={(value) => `${value}`}
                  />

                  <YAxis
                    yAxisId="water"
                    orientation="right"
                    tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                    tickFormatter={(value) => `${value}m`}
                  />

                  <Tooltip />

                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  />

                  <Line
                    yAxisId="rainfall"
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2.7}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />

                  <Line
                    yAxisId="water"
                    type="monotone"
                    dataKey="waterLevel"
                    name="Water level (m)"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.7}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="ai-chart-note">
              <InfoCircleOutlined />
              Separate axes are used because rainfall and water level
              have different measurement scales.
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="ai-panel-card ai-secondary-chart-card"
            title={
              <SectionHeading
                icon={<SafetyCertificateOutlined />}
                title="Flood-Risk Probability"
                subtitle="Illustrative risk distribution over six hours"
              />
            }
          >
            <div className="ai-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskData}
                  stackOffset="expand"
                  margin={{ top: 12, right: 8, left: -12, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke={CHART_COLORS.grid}
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />

                  <Tooltip content={<RiskTooltip />} />

                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, paddingTop: 12 }}
                  />

                  <Bar
                    dataKey="normal"
                    stackId="risk"
                    name="Normal"
                    fill={CHART_COLORS.normal}
                  />

                  <Bar
                    dataKey="warning"
                    stackId="risk"
                    name="Warning"
                    fill={CHART_COLORS.warning}
                  />

                  <Bar
                    dataKey="critical"
                    stackId="risk"
                    name="Critical"
                    fill={CHART_COLORS.critical}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ai-risk-highlight">
              <div>
                <Text type="secondary">Critical probability at +6h</Text>
                <Title level={3} className="ai-risk-highlight__value">
                  {riskHorizon.critical}%
                </Title>
              </div>

              <Tag color="error">Illustrative scenario</Tag>
            </div>
          </Card>
        </Col>

      </Row>

      {/* ===================================================
          AI PIPELINE
      =================================================== */}

      <Card
        className="ai-panel-card ai-pipeline-card"
        title={
          <SectionHeading
            icon={<RobotOutlined />}
            title="AI Flood Forecasting Pipeline"
            subtitle="Conceptual processing workflow"
            extra={<Tag color="blue">6 stages</Tag>}
          />
        }
      >
        <Steps
          direction="vertical"
          current={5}
          className="ai-pipeline-steps"
          items={[
            {
              title: "Current Water-Level Measurements",
              description:
                "Receive water-level readings from deployed monitoring nodes.",
              icon: <DashboardOutlined />,
            },
            {
              title: "Historical Data Collection",
              description:
                "Prepare historical water level, rainfall, river flow, and environmental observations.",
              icon: <DatabaseOutlined />,
            },
            {
              title: "Environmental Data Processing",
              description:
                "Process rainfall, temperature, humidity, soil moisture, and terrain-related variables.",
              icon: <CloudOutlined />,
            },
            {
              title: "AI Model Processing",
              description:
                "Apply LSTM, Random Forest, XGBoost, and decision-fusion methods to engineered features.",
              icon: <RobotOutlined />,
            },
            {
              title: "Water-Level Prediction",
              description:
                "Generate future water-level estimates and associated prediction ranges.",
              icon: <LineChartOutlined />,
            },
            {
              title: "Flood-Risk Assessment",
              description:
                "Convert model outputs into Normal, Warning, or Critical risk categories using defined criteria.",
              icon: <SafetyCertificateOutlined />,
            },
          ]}
        />

        <div className="ai-pipeline-note">
          <InfoCircleOutlined />
          This is the intended system workflow. It does not indicate
          that all stages are currently connected or running.
        </div>
      </Card>

      {/* ===================================================
          MODEL PERFORMANCE
      =================================================== */}

      <Card
        className="ai-panel-card ai-performance-card"
        title={
          <SectionHeading
            icon={<ExperimentOutlined />}
            title="AI Model Performance"
            subtitle="Illustrative comparison of model metrics"
            extra={
              <AntTooltip title="These sample percentages are not measured validation results.">
                <Tag color="orange">
                  <InfoCircleOutlined /> Sample metrics
                </Tag>
              </AntTooltip>
            }
          />
        }
      >
        <div className="ai-chart-container ai-chart-container--performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modelPerformance}
              margin={{ top: 18, right: 20, left: 0, bottom: 12 }}
            >
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="model"
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [`${value}%`]}
              />

              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              />

              <Bar
                dataKey="accuracy"
                name="Accuracy"
                fill={CHART_COLORS.primary}
                radius={[5, 5, 0, 0]}
                maxBarSize={38}
              />

              <Bar
                dataKey="confidence"
                name="Confidence"
                fill={CHART_COLORS.prediction}
                radius={[5, 5, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Divider />

        <Row gutter={[16, 16]}>
          {modelPerformance.map((model) => (
            <Col xs={24} sm={12} xl={6} key={model.model}>
              <div className="ai-model-summary">
                <div className="ai-model-summary__heading">
                  <Text strong>{model.model}</Text>
                  <Tag color="blue">Sample</Tag>
                </div>

                <div className="ai-model-summary__metric">
                  <Text type="secondary">Accuracy</Text>
                  <Text strong>{model.accuracy}%</Text>
                </div>

                <Progress
                  percent={model.accuracy}
                  showInfo={false}
                  strokeColor={CHART_COLORS.primary}
                  trailColor="#edf1f6"
                  size="small"
                />

                <div className="ai-model-summary__metric">
                  <Text type="secondary">Confidence</Text>
                  <Text strong>{model.confidence}%</Text>
                </div>

                <Progress
                  percent={model.confidence}
                  showInfo={false}
                  strokeColor={CHART_COLORS.prediction}
                  trailColor="#edf1f6"
                  size="small"
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ===================================================
          RISK ASSESSMENT + ADVISORY
      =================================================== */}

      <Row gutter={[16, 16]} className="ai-advisory-row">

        <Col xs={24} xl={12}>
          <Card
            className="ai-panel-card ai-current-risk-card"
            title={
              <SectionHeading
                icon={<SafetyCertificateOutlined />}
                title="Current Flood-Risk Assessment"
                subtitle="Illustrative prototype classification"
              />
            }
          >
            <div className="ai-current-risk">
              <div className="ai-current-risk__level">
                <Title level={1}>MEDIUM</Title>
                <Tag color="warning">Moderate Flood Risk</Tag>
              </div>

              <div className="ai-current-risk__progress">
                <div className="ai-current-risk__progress-label">
                  <Text type="secondary">Sample warning probability</Text>
                  <Text strong>64%</Text>
                </div>

                <Progress
                  percent={64}
                  showInfo={false}
                  strokeColor={CHART_COLORS.warning}
                  trailColor="#edf1f6"
                  strokeWidth={12}
                />
              </div>

              <Paragraph className="ai-current-risk__description">
                The sample scenario shows a sustained increase in
                water level. The illustrative risk distribution shifts
                toward the critical category over the forecast horizon.
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            className="ai-panel-card ai-advisory-card"
            title={
              <SectionHeading
                icon={<WarningOutlined />}
                title="Forecast Advisory"
                subtitle="Interpretation of the sample forecast"
              />
            }
          >
            <Alert
              type="warning"
              showIcon
              message="Illustrative increase in flood risk"
              description="The sample forecast approaches the illustrative warning and critical thresholds. Continuous monitoring would be recommended in a real deployment."
            />

            <Divider />

            <div className="ai-advisory-details">
              <div className="ai-advisory-details__heading">
                <Text strong>Model components</Text>
                <Tag color="processing">Prototype configuration</Tag>
              </div>

              <div className="ai-advisory-model">
                <span>
                  <DatabaseOutlined />
                  LSTM
                </span>
                <Tag color="blue">Planned</Tag>
              </div>

              <div className="ai-advisory-model">
                <span>
                  <BarChartOutlined />
                  Random Forest
                </span>
                <Tag color="blue">Planned</Tag>
              </div>

              <div className="ai-advisory-model">
                <span>
                  <ExperimentOutlined />
                  XGBoost
                </span>
                <Tag color="blue">Planned</Tag>
              </div>

              <div className="ai-advisory-model">
                <span>
                  <SafetyCertificateOutlined />
                  Decision Fusion
                </span>
                <Tag color="blue">Planned</Tag>
              </div>
            </div>
          </Card>
        </Col>

      </Row>

      {/* ===================================================
          FINAL PROTOTYPE INFORMATION
      =================================================== */}

      <Card className="ai-prototype-card">
        <div className="ai-prototype-card__content">
          <div className="ai-prototype-card__icon">
            <ThunderboltOutlined />
          </div>

          <div>
            <Text strong className="ai-prototype-card__title">
              Prototype 1 — AI Simulation
            </Text>

            <Paragraph className="ai-prototype-card__description">
              This dashboard currently demonstrates the proposed
              forecasting interface using sample data. In the
              implementation phase, the sample datasets will be
              replaced by actual sensor observations, historical
              datasets, trained model predictions, model evaluation
              results, and backend-generated flood-risk assessments.
            </Paragraph>

            <Space wrap>
              <Tag color="blue">LSTM</Tag>
              <Tag color="blue">Random Forest</Tag>
              <Tag color="blue">XGBoost</Tag>
              <Tag color="blue">Decision Fusion</Tag>
            </Space>
          </div>
        </div>
      </Card>

      <div className="ai-page-footnote">
        <ClockCircleOutlined />
        <Text type="secondary">
          Forecast values and thresholds shown on this page are
          demonstration values and must not be used for emergency decisions.
        </Text>
      </div>

    </div>
  );
};

export default AIForecasting;
