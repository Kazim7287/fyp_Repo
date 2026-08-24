import { Typography, Row, Col } from "antd";

import RiskCard from "../../components/User/RiskCard";
import SummaryCards from "../../components/User/SummaryCards";
import WaterLevelForecast from "../../components/User/WaterLevelForecast";
import LiveFloodMap from "../../components/User/LiveFloodMap";

const { Title, Text } = Typography;

const UserDashboard = () => {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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
          Flood Situation
        </Title>

        <Text type="secondary">
          Monitor current conditions and upcoming flood risk.
        </Text>
      </div>

      {/* =====================================================
          1. CURRENT FLOOD RISK
      ===================================================== */}

      <RiskCard />

      {/* =====================================================
          2. SUMMARY
      ===================================================== */}

      <SummaryCards />

      {/* =====================================================
          3. WATER LEVEL FORECAST
      ===================================================== */}

      <WaterLevelForecast />

      {/* =====================================================
          4. LIVE FLOOD MAP
      ===================================================== */}

      <LiveFloodMap />
    </div>
  );
};

export default UserDashboard;