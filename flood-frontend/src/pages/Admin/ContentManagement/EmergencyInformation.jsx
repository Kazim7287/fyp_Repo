import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Card,
  Col,
  Empty,
  List,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  fetchEmergencyInformation,
  selectEmergencyInformation,
  selectEmergencyLoading,
  selectEmergencyError,
} from "../../../store/slices/emergencySlice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
  NORMAL: {
    label: "Normal",
    color: "green",
    icon: <SafetyOutlined />,
    description: "No immediate flood threat has been reported.",
  },
  WATCH: {
    label: "Watch",
    color: "gold",
    icon: <WarningOutlined />,
    description:
      "Conditions are being monitored. Residents should remain alert.",
  },
  WARNING: {
    label: "Warning",
    color: "orange",
    icon: <WarningOutlined />,
    description:
      "Flood risk is elevated. Residents should prepare for possible action.",
  },
  CRITICAL: {
    label: "Critical",
    color: "red",
    icon: <ExclamationCircleOutlined />,
    description:
      "A critical flood situation is active. Follow official emergency instructions.",
  },
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeNodes = (response) => {
  /*
   * Supports common backend response formats:
   *
   * { success: true, data: [...] }
   * { data: [...] }
   * [...]
   */
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const normalizeEmergencyData = (response) => {
  /*
   * Supports:
   *
   * { success: true, data: [...] }
   * { data: [...] }
   * [...]
   */
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const EmergencyInfo = () => {
  const dispatch = useDispatch();

  const emergencyInformation = useSelector(selectEmergencyInformation);
  const emergencyLoading = useSelector(selectEmergencyLoading);
  const emergencyError = useSelector(selectEmergencyError);

  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState(null);

  /*
   * This is the dynamically selected database node ID.
   *
   * IMPORTANT:
   * There is NO hardcoded node_id here.
   */
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  /*
   * Load all nodes dynamically.
   */
  useEffect(() => {
    const loadNodes = async () => {
      try {
        setNodesLoading(true);
        setNodesError(null);

        const response = await fetch("/api/nodes", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load nodes (${response.status})`);
        }

        const result = await response.json();

        const loadedNodes = normalizeNodes(result);

        setNodes(loadedNodes);

        /*
         * Automatically select the first available node.
         *
         * This is NOT hardcoding a node ID.
         * The ID comes from the database/API response.
         */
        if (loadedNodes.length > 0) {
          setSelectedNodeId(loadedNodes[0].id);
        }
      } catch (error) {
        console.error("Failed to load nodes:", error);
        setNodesError(error.message || "Failed to load nodes.");
      } finally {
        setNodesLoading(false);
      }
    };

    loadNodes();
  }, []);

  /*
   * Fetch emergency information whenever the selected
   * database node changes.
   */
  useEffect(() => {
    if (!selectedNodeId) {
      return;
    }

    dispatch(
      fetchEmergencyInformation({
        node_id: selectedNodeId,
      })
    );
  }, [dispatch, selectedNodeId]);

  /*
   * Find the selected node from the dynamically loaded nodes.
   */
  const selectedNode = useMemo(() => {
    return nodes.find(
      (node) => String(node.id) === String(selectedNodeId)
    );
  }, [nodes, selectedNodeId]);

  /*
   * The API normally returns an array.
   */
  const emergency = emergencyInformation?.[0] || null;

  /*
   * Prefer emergency information returned by the API.
   * Fall back to the selected node information.
   */
  const locationName =
    emergency?.location_name ||
    emergency?.node_name ||
    selectedNode?.location_name ||
    selectedNode?.node_name ||
    "Selected monitoring node";

  const nodeName =
    emergency?.node_name ||
    selectedNode?.node_name ||
    selectedNode?.location_name ||
    "Monitoring Node";

  const deviceId =
    emergency?.device_id ||
    selectedNode?.device_id ||
    "N/A";

  const status = emergency?.status || "NORMAL";

  const statusConfig =
    STATUS_CONFIG[status] || STATUS_CONFIG.NORMAL;

  const safeLocations = Array.isArray(emergency?.safe_locations)
    ? emergency.safe_locations
    : [];

  /*
   * Show emergency alert only when active.
   */
  const isActiveEmergency =
    emergency?.active_emergency === true ||
    emergency?.active_emergency === "true";

  const evacuationRequired =
    emergency?.evacuation_required === true ||
    emergency?.evacuation_required === "true";

  const handleNodeChange = (value) => {
    setSelectedNodeId(value);
  };

  /*
   * Node loading error
   */
  if (nodesError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          message="Unable to load monitoring nodes"
          description={nodesError}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Emergency Information
          </Title>

          <Text type="secondary">
            Monitor and manage emergency information for registered
            flood-monitoring nodes.
          </Text>
        </div>

        {/* DYNAMIC NODE SELECTOR */}
        <div style={{ minWidth: 280 }}>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 6,
            }}
          >
            Monitoring Node
          </Text>

          <Select
            showSearch
            value={selectedNodeId}
            loading={nodesLoading}
            placeholder="Select a monitoring node"
            style={{ width: "100%" }}
            optionFilterProp="children"
            onChange={handleNodeChange}
            notFoundContent={
              nodesLoading ? <Spin size="small" /> : "No nodes found"
            }
          >
            {nodes.map((node) => (
              <Option key={node.id} value={node.id}>
                {node.node_name ||
                  node.location_name ||
                  node.device_id ||
                  `Node ${node.id}`}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* NODE INFORMATION */}
      {selectedNode && (
        <Card
          size="small"
          style={{
            marginBottom: 20,
            background: "#fafafa",
          }}
        >
          <Row gutter={[24, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Node</Text>
              <div>
                <Text strong>{nodeName}</Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Device ID</Text>
              <div>
                <Text strong>{deviceId}</Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Location</Text>
              <div>
                <Text strong>{locationName}</Text>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Database Node ID</Text>
              <div>
                <Text strong>{selectedNode.id}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* LOADING */}
      {emergencyLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <Spin size="large" />
        </div>
      ) : !selectedNodeId ? (
        <Card>
          <Empty
            description={
              nodesLoading
                ? "Loading monitoring nodes..."
                : "Select a monitoring node"
            }
          />
        </Card>
      ) : !emergency ? (
        <Card>
          <Empty
            description={
              <>
                <div>
                  No emergency information is available for{" "}
                  <strong>{locationName}</strong>.
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: "#888",
                  }}
                >
                  Node ID: {selectedNodeId}
                </div>
              </>
            }
          />
        </Card>
      ) : (
        <>
          {/* API ERROR */}
          {emergencyError && (
            <Alert
              type="error"
              showIcon
              message="Emergency information error"
              description={emergencyError}
              style={{ marginBottom: 20 }}
            />
          )}

          {/* ACTIVE EMERGENCY */}
          {isActiveEmergency && (
            <Alert
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message="ACTIVE EMERGENCY"
              description={
                emergency.message ||
                "An active emergency has been reported for this monitoring area. Follow official emergency instructions."
              }
              style={{
                marginBottom: 20,
              }}
            />
          )}

          {/* CURRENT STATUS */}
          <Card
            title="Current Emergency Status"
            style={{ marginBottom: 20 }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 28 }}>
                    {statusConfig.icon}
                  </div>

                  <div>
                    <Text type="secondary">
                      Current Status
                    </Text>

                    <div>
                      <Tag
                        color={statusConfig.color}
                        style={{
                          fontSize: 15,
                          padding: "4px 10px",
                          marginTop: 4,
                        }}
                      >
                        {statusConfig.label}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <Text type="secondary">Monitoring Area</Text>

                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <EnvironmentOutlined />

                  <Text strong>{locationName}</Text>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <Text type="secondary">Last Updated</Text>

                <div style={{ marginTop: 6 }}>
                  <Text strong>
                    {formatDate(
                      emergency.updated_at ||
                        emergency.updated_at_db
                    )}
                  </Text>
                </div>
              </Col>
            </Row>

            <Alert
              type={
                status === "CRITICAL"
                  ? "error"
                  : status === "WARNING"
                  ? "warning"
                  : status === "WATCH"
                  ? "info"
                  : "success"
              }
              showIcon
              message={statusConfig.description}
              style={{ marginTop: 20 }}
            />
          </Card>

          {/* CURRENT SITUATION */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card title="Current Situation" style={{ height: "100%" }}>
                <Paragraph style={{ marginBottom: 0 }}>
                  {emergency.message ||
                    "No additional emergency message is currently available."}
                </Paragraph>

                {emergency.affected_area && (
                  <div style={{ marginTop: 20 }}>
                    <Text strong>Affected Area</Text>

                    <Paragraph style={{ marginTop: 6 }}>
                      {emergency.affected_area}
                    </Paragraph>
                  </div>
                )}
              </Card>
            </Col>

            {/* WHAT TO DO */}
            <Col xs={24} lg={12}>
              <Card title="What You Should Do" style={{ height: "100%" }}>
                <List
                  size="small"
                  dataSource={[
                    "Monitor official flood warnings and emergency announcements.",
                    "Keep important documents, medicines, water, and essential supplies ready.",
                    "Avoid walking or driving through flooded roads or flowing water.",
                    "Move to higher ground if authorities instruct residents to evacuate.",
                    "Follow instructions issued by local authorities and emergency services.",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* EVACUATION */}
          <Card
            title="Evacuation Information"
            style={{ marginTop: 20 }}
          >
            <Row gutter={[24, 20]}>
              <Col xs={24} md={12}>
                <Text type="secondary">
                  Active Emergency
                </Text>

                <div style={{ marginTop: 8 }}>
                  <Tag color={isActiveEmergency ? "red" : "green"}>
                    {isActiveEmergency ? "YES" : "NO"}
                  </Tag>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Text type="secondary">
                  Evacuation Required
                </Text>

                <div style={{ marginTop: 8 }}>
                  <Tag color={evacuationRequired ? "red" : "green"}>
                    {evacuationRequired ? "YES" : "NO"}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>

          {/* SAFE LOCATIONS */}
          <Card
            title="Safe Locations"
            style={{ marginTop: 20 }}
          >
            {safeLocations.length > 0 ? (
              <List
                bordered
                dataSource={safeLocations}
                renderItem={(location, index) => (
                  <List.Item>
                    <Text>
                      {index + 1}. {location}
                    </Text>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No safe locations have been configured."
              />
            )}
          </Card>

          {/* EMERGENCY CONTACTS */}
          <Card
            title="Emergency Contacts"
            style={{ marginTop: 20 }}
          >
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={8}>
                <Card size="small">
                  <Text type="secondary">
                    Rescue / Emergency
                  </Text>

                  <Title level={4} style={{ margin: "6px 0 0" }}>
                    1122
                  </Title>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card size="small">
                  <Text type="secondary">
                    Police
                  </Text>

                  <Title level={4} style={{ margin: "6px 0 0" }}>
                    15
                  </Title>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card size="small">
                  <Text type="secondary">
                    Emergency Services
                  </Text>

                  <Title level={4} style={{ margin: "6px 0 0" }}>
                    Contact local authorities
                  </Title>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmergencyInfo;