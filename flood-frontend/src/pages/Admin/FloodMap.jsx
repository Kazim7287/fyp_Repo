
import { useEffect, useMemo, useState } from "react";

import {
  Card,
  Typography,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Spin,
  Alert,
  Button,
} from "antd";

import {
  EnvironmentOutlined,
  WarningOutlined,
  AimOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { getNodes } from "../../api/nodeApi";

// =========================================================
// FIX DEFAULT LEAFLET MARKER ICON
// =========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const { Title, Text } = Typography;

// =========================================================
// MAP CENTER
// =========================================================
//
// Nowshera is used as the fallback location when there
// are no nodes available.
//

const NOWSHERA_CENTER = [
  34.0151,
  71.9747,
];

// =========================================================
// FIT MAP TO NODES
// =========================================================

const FitMapToNodes = ({ nodes }) => {
  const map = useMap();

  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      map.setView(
        NOWSHERA_CENTER,
        11
      );

      return;
    }

    const validNodes = nodes.filter(
      (node) =>
        Number.isFinite(
          Number(node.latitude)
        ) &&
        Number.isFinite(
          Number(node.longitude)
        )
    );

    if (validNodes.length === 0) {
      map.setView(
        NOWSHERA_CENTER,
        11
      );

      return;
    }

    const bounds = L.latLngBounds(
      validNodes.map((node) => [
        Number(node.latitude),
        Number(node.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [nodes, map]);

  return null;
};

// =========================================================
// FLOOD MAP COMPONENT
// =========================================================

const FloodMap = () => {
  const [nodes, setNodes] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // =======================================================
  // FETCH NODES
  // =======================================================

  const fetchNodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await getNodes();

      console.log(
        "Nodes received:",
        response
      );

      /*
      |--------------------------------------------------------------------------
      | Handle different possible API response formats
      |--------------------------------------------------------------------------
      |
      | Supported:
      |
      | [
      |   {...},
      |   {...}
      | ]
      |
      | {
      |   nodes: [...]
      | }
      |
      | {
      |   data: [...]
      | }
      |
      */

      let nodeData = [];

      if (Array.isArray(response)) {
        nodeData = response;
      } else if (
        Array.isArray(response?.nodes)
      ) {
        nodeData = response.nodes;
      } else if (
        Array.isArray(response?.data)
      ) {
        nodeData = response.data;
      }

      setNodes(nodeData);
    } catch (err) {
      console.error(
        "Failed to fetch nodes:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load monitoring nodes."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchNodes();

    /*
    |--------------------------------------------------------------------------
    | Refresh node locations every 60 seconds
    |--------------------------------------------------------------------------
    */

    const interval = setInterval(
      fetchNodes,
      60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =======================================================
  // VALID NODES
  // =======================================================

  const validNodes = useMemo(() => {
    return nodes.filter(
      (node) =>
        Number.isFinite(
          Number(node.latitude)
        ) &&
        Number.isFinite(
          Number(node.longitude)
        )
    );
  }, [nodes]);

  // =======================================================
  // ACTIVE / FLOOD NODES
  // =======================================================

  const activeNodes = useMemo(() => {
    return validNodes.filter(
      (node) => {
        const status =
          String(
            node.status ||
              node.risk_level ||
              ""
          ).toLowerCase();

        return (
          status === "active" ||
          status === "high" ||
          status === "critical" ||
          status === "danger"
        );
      }
    );
  }, [validNodes]);

  // =======================================================
  // MAP CENTER
  // =======================================================

  const mapCenter =
    validNodes.length > 0
      ? [
          Number(
            validNodes[0].latitude
          ),
          Number(
            validNodes[0].longitude
          ),
        ]
      : NOWSHERA_CENTER;

  // =======================================================
  // NODE STATUS
  // =======================================================

  const getNodeStatus = (
    node
  ) => {
    const status = String(
      node.status ||
        node.risk_level ||
        node.riskLevel ||
        "unknown"
    ).toLowerCase();

    if (
      status === "critical" ||
      status === "danger" ||
      status === "high"
    ) {
      return {
        label: "High Risk",
        color: "red",
      };
    }

    if (
      status === "moderate" ||
      status === "warning"
    ) {
      return {
        label: "Moderate Risk",
        color: "orange",
      };
    }

    if (
      status === "safe" ||
      status === "normal" ||
      status === "active"
    ) {
      return {
        label: "Normal",
        color: "green",
      };
    }

    return {
      label:
        node.status ||
        "Unknown",
      color: "blue",
    };
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading &&
    nodes.length === 0
  ) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

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
          Flood Map
        </Title>

        <Text type="secondary">
          Monitor deployed flood-monitoring
          nodes and their actual geographic
          locations in Nowshera.
        </Text>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <Alert
          type="error"
          showIcon
          message="Unable to load nodes"
          description={error}
          style={{
            marginBottom: 24,
          }}
        />
      )}

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* MONITORED AREAS */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card>
            <Statistic
              title="Monitored Areas"
              value={validNodes.length}
              prefix={
                <EnvironmentOutlined />
              }
            />
          </Card>
        </Col>

        {/* ACTIVE / HIGH RISK */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card>
            <Statistic
              title="Active Flood Zones"
              value={
                activeNodes.length
              }
              prefix={
                <WarningOutlined />
              }
            />
          </Card>
        </Col>

        {/* STATIONS */}

        <Col
          xs={24}
          sm={12}
          lg={8}
        >
          <Card>
            <Statistic
              title="Monitoring Stations"
              value={validNodes.length}
              prefix={
                <AimOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ================================================= */}
      {/* MAP */}
      {/* ================================================= */}

      <Card
        title={
          <Space>
            <EnvironmentOutlined />

            <span>
              Flood Monitoring Map
            </span>

            <Tag color="green">
              {validNodes.length} Nodes
            </Tag>
          </Space>
        }
        extra={
          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={
              fetchNodes
            }
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <div
          style={{
            height: 550,
            width: "100%",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{
              height: "100%",
              width: "100%",
            }}
          >
            {/* ========================================= */}
            {/* OPENSTREETMAP */}
            {/* ========================================= */}

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ========================================= */}
            {/* AUTOMATICALLY FIT ALL NODES */}
            {/* ========================================= */}

            <FitMapToNodes
              nodes={validNodes}
            />

            {/* ========================================= */}
            {/* NODE MARKERS */}
            {/* ========================================= */}

            {validNodes.map(
              (node) => {
                const latitude =
                  Number(
                    node.latitude
                  );

                const longitude =
                  Number(
                    node.longitude
                  );

                const status =
                  getNodeStatus(
                    node
                  );

                return (
                  <div
                    key={
                      node.id ??
                      node.node_id ??
                      `${latitude}-${longitude}`
                    }
                  >
                    {/* NODE MARKER */}

                    <Marker
                      position={[
                        latitude,
                        longitude,
                      ]}
                    >
                      <Popup>
                        <div
                          style={{
                            minWidth: 220,
                          }}
                        >
                          <Title
                            level={5}
                            style={{
                              marginTop: 0,
                            }}
                          >
                            {node.name ||
                              node.node_name ||
                              `Node ${
                                node.id ??
                                ""
                              }`}
                          </Title>

                          <Space
                            direction="vertical"
                            size={6}
                          >
                            <div>
                              <Text strong>
                                Node ID:
                              </Text>{" "}
                              {node.id ??
                                node.node_id ??
                                "N/A"}
                            </div>

                            <div>
                              <Text strong>
                                Latitude:
                              </Text>{" "}
                              {latitude.toFixed(
                                6
                              )}
                            </div>

                            <div>
                              <Text strong>
                                Longitude:
                              </Text>{" "}
                              {longitude.toFixed(
                                6
                              )}
                            </div>

                            <div>
                              <Text strong>
                                Status:
                              </Text>{" "}

                              <Tag
                                color={
                                  status.color
                                }
                              >
                                {
                                  status.label
                                }
                              </Tag>
                            </div>

                            {node.water_level !==
                              undefined && (
                              <div>
                                <Text strong>
                                  Water Level:
                                </Text>{" "}
                                {
                                  node.water_level
                                }{" "}
                                m
                              </div>
                            )}
                          </Space>
                        </div>
                      </Popup>
                    </Marker>

                    {/* ================================= */}
                    {/* RISK CIRCLE */}
                    {/* ================================= */}

                    <Circle
                      center={[
                        latitude,
                        longitude,
                      ]}
                      radius={
                        status.label ===
                        "High Risk"
                          ? 500
                          : status.label ===
                            "Moderate Risk"
                          ? 300
                          : 150
                      }
                      pathOptions={{
                        color:
                          status.color ===
                          "red"
                            ? "red"
                            : status.color ===
                              "orange"
                            ? "orange"
                            : "green",

                        fillOpacity: 0.12,
                      }}
                    />
                  </div>
                );
              }
            )}
          </MapContainer>
        </div>

        {/* ================================================= */}
        {/* MAP INFORMATION */}
        {/* ================================================= */}

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Space>
            <Tag color="green">
              Normal
            </Tag>

            <Tag color="orange">
              Moderate Risk
            </Tag>

            <Tag color="red">
              High Risk
            </Tag>
          </Space>

          <Text type="secondary">
            Showing{" "}
            <Text strong>
              {validNodes.length}
            </Text>{" "}
            deployed monitoring
            node(s)
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default FloodMap;
