
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  AimOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SafetyOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./styles/FloodMap.css";

import { getNodes } from "../../api/nodeApi";

const { Title, Text } = Typography;

const NOWSHERA_CENTER = [34.0151, 71.9747];
const DEFAULT_ZOOM = 11;
const REFRESH_INTERVAL = 60 * 1000;

// ---------------------------------------------------------
// MAP MARKER ICONS
// ---------------------------------------------------------

const createNodeIcon = (risk) => {
  const markerClass =
    risk === "high"
      ? "flood-map-marker--high"
      : risk === "moderate"
        ? "flood-map-marker--moderate"
        : risk === "normal"
          ? "flood-map-marker--normal"
          : "flood-map-marker--unknown";

  return L.divIcon({
    className: "flood-map-marker-wrapper",
    html: `<div class="flood-map-marker ${markerClass}">
      <span class="flood-map-marker__pulse"></span>
      <span class="flood-map-marker__dot"></span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
};

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getCoordinate = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const getNodeCoordinates = (node) => {
  const latitude = getCoordinate(
    node.latitude ?? node.lat
  );

  const longitude = getCoordinate(
    node.longitude ?? node.lng ?? node.lon
  );

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
};

const getNodeName = (node) =>
  node.name ||
  node.node_name ||
  node.nodeName ||
  `Node ${node.id ?? node.node_id ?? ""}`;

const getNodeId = (node) =>
  node.node_code ||
  node.nodeCode ||
  node.id ||
  node.node_id ||
  "N/A";

// Risk is intentionally separate from operational status.
const getNodeRisk = (node) => {
  const rawRisk = String(
    node.risk_level ??
      node.riskLevel ??
      node.flood_risk ??
      node.floodRisk ??
      node.status ??
      "unknown"
  ).toLowerCase().trim();

  if (
    ["critical", "danger", "high", "severe"].includes(rawRisk)
  ) {
    return {
      key: "high",
      label: "High Risk",
      color: "red",
    };
  }

  if (
    ["moderate", "warning", "medium"].includes(rawRisk)
  ) {
    return {
      key: "moderate",
      label: "Moderate Risk",
      color: "orange",
    };
  }

  if (
    ["normal", "safe", "low"].includes(rawRisk)
  ) {
    return {
      key: "normal",
      label: "Normal",
      color: "green",
    };
  }

  return {
    key: "unknown",
    label: "Unknown",
    color: "default",
  };
};

const getOperationalStatus = (node) => {
  const rawStatus = String(
    node.operational_status ??
      node.operationalStatus ??
      node.status ??
      ""
  ).toLowerCase().trim();

  if (["active", "online", "operational"].includes(rawStatus)) {
    return {
      label: "Active",
      color: "success",
    };
  }

  if (["inactive", "offline", "disabled"].includes(rawStatus)) {
    return {
      label: "Inactive",
      color: "default",
    };
  }

  return {
    label: "Unknown",
    color: "processing",
  };
};

const getWaterLevel = (node) => {
  const value =
    node.water_level ??
    node.waterLevel ??
    node.level;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

// ---------------------------------------------------------
// FIT MAP TO NODES
// ---------------------------------------------------------

const FitMapToNodes = ({ nodes }) => {
  const map = useMap();

  useEffect(() => {
    if (!nodes.length) {
      map.setView(NOWSHERA_CENTER, DEFAULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(
      nodes.map((node) => node.coordinates)
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [55, 55],
        maxZoom: 15,
      });
    }
  }, [nodes, map]);

  return null;
};

// ---------------------------------------------------------
// MAP NODE POPUP
// ---------------------------------------------------------

const NodePopup = ({ node }) => {
  const risk = getNodeRisk(node);
  const operational = getOperationalStatus(node);
  const waterLevel = getWaterLevel(node);

  const [latitude, longitude] = node.coordinates;

  const waterLevelUnit =
    node.water_level_unit ||
    node.waterLevelUnit ||
    node.unit ||
    "m";

  return (
    <div className="flood-map-popup">
      <div className="flood-map-popup__header">
        <div>
          <Text className="flood-map-popup__eyebrow">
            MONITORING NODE
          </Text>

          <Title level={5} className="flood-map-popup__title">
            {getNodeName(node)}
          </Title>
        </div>

        <Tag color={risk.color}>
          {risk.label}
        </Tag>
      </div>

      <div className="flood-map-popup__details">
        <div className="flood-map-popup__detail">
          <Text type="secondary">Node ID</Text>
          <Text strong>{getNodeId(node)}</Text>
        </div>

        <div className="flood-map-popup__detail">
          <Text type="secondary">Operational status</Text>
          <Badge
            status={operational.color}
            text={operational.label}
          />
        </div>

        <div className="flood-map-popup__detail">
          <Text type="secondary">Latitude</Text>
          <Text strong>{latitude.toFixed(6)}</Text>
        </div>

        <div className="flood-map-popup__detail">
          <Text type="secondary">Longitude</Text>
          <Text strong>{longitude.toFixed(6)}</Text>
        </div>

        <div className="flood-map-popup__detail">
          <Text type="secondary">Water level</Text>
          <Text strong>
            {waterLevel === null
              ? "Not available"
              : `${waterLevel.toFixed(2)} ${waterLevelUnit}`}
          </Text>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// FLOOD MAP PAGE
// ---------------------------------------------------------

const FloodMap = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // -------------------------------------------------------
  // FETCH NODES
  // -------------------------------------------------------

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNodes();

      // Support common API response structures.
      const candidates = [
        response,
        response?.nodes,
        response?.data,
        response?.data?.nodes,
        response?.data?.data,
      ];

      const nodeData = candidates.find(Array.isArray) || [];

      setNodes(nodeData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch monitoring nodes:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load monitoring nodes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------------------------------------
  // INITIAL LOAD + AUTOMATIC REFRESH
  // -------------------------------------------------------

  useEffect(() => {
    fetchNodes();

    const interval = setInterval(() => {
      fetchNodes();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNodes]);

  // -------------------------------------------------------
  // VALID NODE LOCATIONS
  // -------------------------------------------------------

  const mappedNodes = useMemo(() => {
    return nodes
      .map((node) => {
        const coordinates = getNodeCoordinates(node);

        if (!coordinates) {
          return null;
        }

        return {
          ...node,
          coordinates,
        };
      })
      .filter(Boolean);
  }, [nodes]);

  // -------------------------------------------------------
  // STATISTICS
  // -------------------------------------------------------

  const statistics = useMemo(() => {
    const highRisk = mappedNodes.filter(
      (node) => getNodeRisk(node).key === "high"
    ).length;

    const moderateRisk = mappedNodes.filter(
      (node) => getNodeRisk(node).key === "moderate"
    ).length;

    const normalRisk = mappedNodes.filter(
      (node) => getNodeRisk(node).key === "normal"
    ).length;

    const active = mappedNodes.filter(
      (node) =>
        getOperationalStatus(node).label === "Active"
    ).length;

    return {
      total: mappedNodes.length,
      active,
      highRisk,
      moderateRisk,
      normalRisk,
    };
  }, [mappedNodes]);

  // -------------------------------------------------------
  // MAP CENTER
  // -------------------------------------------------------

  const mapCenter =
    mappedNodes.length > 0
      ? mappedNodes[0].coordinates
      : NOWSHERA_CENTER;

  // -------------------------------------------------------
  // LAST UPDATED LABEL
  // -------------------------------------------------------

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Not available";

  // -------------------------------------------------------
  // PAGE
  // -------------------------------------------------------

  return (
    <div className="flood-map-page">

      {/* PAGE HEADER */}

      <div className="flood-map-page__header">
        <div className="flood-map-page__heading">
          <div className="flood-map-page__icon">
            <EnvironmentOutlined />
          </div>

          <div>
            <Title level={3} className="flood-map-page__title">
              Flood Monitoring Map
            </Title>

            <Text className="flood-map-page__subtitle">
              Geographic overview of deployed monitoring nodes
              and their reported flood-risk conditions.
            </Text>
          </div>
        </div>

        <div className="flood-map-page__header-actions">
          <div className="flood-map-page__update">
            <Badge
              status={loading ? "processing" : error ? "error" : "success"}
              text={
                loading
                  ? "Refreshing data"
                  : error
                    ? "Update failed"
                    : "Refresh enabled"
              }
            />

            <Text type="secondary">
              Last update: {lastUpdatedLabel}
            </Text>
          </div>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchNodes}
            loading={loading}
          >
            Refresh Map
          </Button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <Alert
          className="flood-map-page__alert"
          type="error"
          showIcon
          message="Unable to update monitoring nodes"
          description={error}
          action={
            <Button
              size="small"
              danger
              onClick={fetchNodes}
              loading={loading}
            >
              Retry
            </Button>
          }
        />
      )}

      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
        className="flood-map-stats"
      >
        <Col xs={24} sm={12} xl={6}>
          <Card className="flood-map-stat-card">
            <Statistic
              title="Mapped Nodes"
              value={statistics.total}
              prefix={
                <span className="flood-map-stat-icon flood-map-stat-icon--blue">
                  <EnvironmentOutlined />
                </span>
              }
            />

            <Text type="secondary" className="flood-map-stat-caption">
              Nodes with valid coordinates
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="flood-map-stat-card">
            <Statistic
              title="Active Nodes"
              value={statistics.active}
              prefix={
                <span className="flood-map-stat-icon flood-map-stat-icon--green">
                  <CheckCircleOutlined />
                </span>
              }
            />

            <Text type="secondary" className="flood-map-stat-caption">
              Reported as operational
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="flood-map-stat-card">
            <Statistic
              title="Moderate Risk"
              value={statistics.moderateRisk}
              prefix={
                <span className="flood-map-stat-icon flood-map-stat-icon--orange">
                  <ExclamationCircleOutlined />
                </span>
              }
            />

            <Text type="secondary" className="flood-map-stat-caption">
              Nodes reporting moderate risk
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="flood-map-stat-card">
            <Statistic
              title="High Risk"
              value={statistics.highRisk}
              prefix={
                <span className="flood-map-stat-icon flood-map-stat-icon--red">
                  <WarningOutlined />
                </span>
              }
            />

            <Text type="secondary" className="flood-map-stat-caption">
              Nodes reporting high risk
            </Text>
          </Card>
        </Col>
      </Row>

      {/* MAP CARD */}

      <Card
        className="flood-map-main-card"
        title={
          <div className="flood-map-card-heading">
            <div className="flood-map-card-heading__icon">
              <AimOutlined />
            </div>

            <div>
              <Text strong className="flood-map-card-heading__title">
                Geographic Node Distribution
              </Text>

              <Text type="secondary" className="flood-map-card-heading__subtitle">
                Nowshera monitoring area
              </Text>
            </div>
          </div>
        }
        extra={
          <Tag color="blue">
            {statistics.total} Mapped
          </Tag>
        }
      >
        {loading && mappedNodes.length === 0 && !error ? (
          <div className="flood-map-state">
            <Spin size="large" />

            <Text type="secondary">
              Loading monitoring locations...
            </Text>
          </div>
        ) : mappedNodes.length === 0 ? (
          <div className="flood-map-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text strong>
                    No mapped monitoring nodes
                  </Text>

                  <br />

                  <Text type="secondary">
                    No nodes with valid geographic coordinates
                    are currently available.
                  </Text>
                </div>
              }
            />

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchNodes}
              loading={loading}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="flood-map-canvas">
              <MapContainer
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom
                className="flood-map-leaflet"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitMapToNodes nodes={mappedNodes} />

                {mappedNodes.map((node) => {
                  const risk = getNodeRisk(node);
                  const [latitude, longitude] = node.coordinates;

                  const markerKey =
                    node.id ??
                    node.node_id ??
                    node.node_code ??
                    `${latitude}-${longitude}`;

                  const circleColor =
                    risk.key === "high"
                      ? "#dc2626"
                      : risk.key === "moderate"
                        ? "#d97706"
                        : risk.key === "normal"
                          ? "#16a34a"
                          : "#64748b";

                  const circleRadius =
                    risk.key === "high"
                      ? 500
                      : risk.key === "moderate"
                        ? 300
                        : 150;

                  return (
                    <Fragment key={markerKey}>
                      <Marker
                        position={node.coordinates}
                        icon={createNodeIcon(risk.key)}
                      >
                        <Popup>
                          <NodePopup node={node} />
                        </Popup>
                      </Marker>

                      <Circle
                        center={[latitude, longitude]}
                        radius={circleRadius}
                        pathOptions={{
                          color: circleColor,
                          fillColor: circleColor,
                          fillOpacity: 0.09,
                          weight: 1.5,
                        }}
                      />
                    </Fragment>
                  );
                })}
              </MapContainer>

              {loading && (
                <div className="flood-map-refresh-overlay">
                  <Spin size="small" />
                  <Text>Updating node data...</Text>
                </div>
              )}
            </div>

            {/* MAP LEGEND */}

            <div className="flood-map-footer">
              <div className="flood-map-legend">
                <Text strong className="flood-map-legend__title">
                  Risk legend
                </Text>

                <Space size={[14, 8]} wrap>
                  <span className="flood-map-legend__item">
                    <span className="flood-map-legend__dot flood-map-legend__dot--normal" />
                    Normal
                  </span>

                  <span className="flood-map-legend__item">
                    <span className="flood-map-legend__dot flood-map-legend__dot--moderate" />
                    Moderate
                  </span>

                  <span className="flood-map-legend__item">
                    <span className="flood-map-legend__dot flood-map-legend__dot--high" />
                    High
                  </span>

                  <span className="flood-map-legend__item">
                    <span className="flood-map-legend__dot flood-map-legend__dot--unknown" />
                    Unknown
                  </span>
                </Space>
              </div>

              <div className="flood-map-footer__summary">
                <SafetyOutlined />

                <Text type="secondary">
                  Displaying {statistics.total} mapped node(s)
                </Text>
              </div>
            </div>

            <div className="flood-map-disclaimer">
              <Text type="secondary">
                <ExclamationCircleOutlined /> Colored circles are
                illustrative proximity indicators only. They do not
                represent verified flood boundaries or predicted
                inundation areas.
              </Text>
            </div>
          </>
        )}
      </Card>

      {/* DATA QUALITY NOTE */}

      <div className="flood-map-page__footnote">
        <Text type="secondary">
          <EnvironmentOutlined /> Map locations are based on the
          latitude and longitude returned by the monitoring-node API.
          Nodes without valid coordinates are excluded from the map.
        </Text>
      </div>
    </div>
  );
};

export default FloodMap;
