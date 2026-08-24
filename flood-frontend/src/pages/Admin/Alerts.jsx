import { useMemo, useState } from "react";

import {
  Card,
  Col,
  Row,
  Table,
  Tag,
  Typography,
  Space,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Descriptions,
  Badge,
  Popconfirm,
  message,
  Empty,
} from "antd";

import {
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const { TextArea } = Input;

/* =========================================================
   PROTOTYPE ALERT DATA
========================================================= */

const initialAlerts = [
  {
    id: "ALT-001",
    location: "Nowshera",
    station: "NWS-01",
    level: "Critical",
    status: "Active",
    title: "Critical Water Level",
    description:
      "Water level has exceeded the critical threshold.",
    timestamp: "2026-08-19 20:42:15",
  },

  {
    id: "ALT-002",
    location: "Kabul",
    station: "NWS-02",
    level: "Warning",
    status: "Active",
    title: "Rapid Water-Level Increase",
    description:
      "Water level is increasing rapidly and approaching warning threshold.",
    timestamp: "2026-08-19 20:35:42",
  },

  {
    id: "ALT-003",
    location: "Station 02",
    station: "NWS-02",
    level: "Watch",
    status: "Resolved",
    title: "Heavy Rainfall Watch",
    description:
      "Rainfall intensity temporarily exceeded the monitoring threshold.",
    timestamp: "2026-08-19 18:20:11",
  },
];

/* =========================================================
   LEVEL TAG
========================================================= */

const getLevelTag = (level) => {
  switch (level) {
    case "Critical":
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color="error"
        >
          Critical
        </Tag>
      );

    case "Warning":
      return (
        <Tag
          icon={<WarningOutlined />}
          color="warning"
        >
          Warning
        </Tag>
      );

    case "Watch":
      return (
        <Tag
          icon={<EyeOutlined />}
          color="processing"
        >
          Watch
        </Tag>
      );

    default:
      return <Tag>{level}</Tag>;
  }
};

/* =========================================================
   STATUS TAG
========================================================= */

const getStatusTag = (status) => {
  if (status === "Active") {
    return (
      <Tag
        icon={<AlertOutlined />}
        color="error"
      >
        Active
      </Tag>
    );
  }

  return (
    <Tag
      icon={<CheckCircleOutlined />}
      color="success"
    >
      Resolved
    </Tag>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Alerts = () => {
  const [alerts, setAlerts] =
    useState(initialAlerts);

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [viewModalOpen, setViewModalOpen] =
    useState(false);

  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  const [form] = Form.useForm();

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: alerts.length,

      active: alerts.filter(
        (alert) =>
          alert.status === "Active"
      ).length,

      critical: alerts.filter(
        (alert) =>
          alert.level === "Critical" &&
          alert.status === "Active"
      ).length,

      resolved: alerts.filter(
        (alert) =>
          alert.status === "Resolved"
      ).length,
    };
  }, [alerts]);

  /* =======================================================
     VIEW ALERT
  ======================================================= */

  const handleView = (alert) => {
    setSelectedAlert(alert);
    setViewModalOpen(true);
  };

  /* =======================================================
     RESOLVE ALERT
  ======================================================= */

  const handleResolve = (alertId) => {
    setAlerts((previous) =>
      previous.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "Resolved",
            }
          : alert
      )
    );

    message.success(
      "Alert resolved successfully."
    );
  };

  /* =======================================================
     CREATE ALERT
  ======================================================= */

  const handleCreate = async () => {
    try {
      const values =
        await form.validateFields();

      const newAlert = {
        id: `ALT-${String(
          alerts.length + 1
        ).padStart(3, "0")}`,

        location: values.location,

        station: values.station,

        level: values.level,

        status: "Active",

        title: values.title,

        description:
          values.description,

        timestamp:
          new Date().toLocaleString(),
      };

      setAlerts((previous) => [
        newAlert,
        ...previous,
      ]);

      form.resetFields();

      setCreateModalOpen(false);

      message.success(
        "Alert created successfully."
      );
    } catch (error) {
      // Validation error
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Location",
      dataIndex: "location",
      key: "location",

      render: (value) => (
        <Space>
          <EnvironmentOutlined />

          <Text strong>
            {value}
          </Text>
        </Space>
      ),
    },

    {
      title: "Level",
      dataIndex: "level",
      key: "level",

      render: (value) =>
        getLevelTag(value),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (value) =>
        getStatusTag(value),
    },

    {
      title: "Station",
      dataIndex: "station",
      key: "station",

      render: (value) => (
        <Text>
          {value}
        </Text>
      ),
    },

    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",

      render: (value) => (
        <Space>
          <ClockCircleOutlined />

          <Text type="secondary">
            {value}
          </Text>
        </Space>
      ),
    },

    {
      title: "Action",
      key: "action",

      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              handleView(record)
            }
          >
            View
          </Button>

          {record.status ===
            "Active" && (
            <Popconfirm
              title="Resolve this alert?"
              description="The alert will be marked as resolved."
              okText="Resolve"
              cancelText="Cancel"
              onConfirm={() =>
                handleResolve(
                  record.id
                )
              }
            >
              <Button
                size="small"
                type="primary"
                icon={
                  <CheckCircleOutlined />
                }
              >
                Resolve
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              marginBottom: 4,
            }}
          >
            Alerts Management
          </Title>

          <Text type="secondary">
            Monitor, create, manage, and
            resolve flood and environmental
            alerts.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            setCreateModalOpen(true)
          }
        >
          Create Alert
        </Button>
      </div>

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Alerts"
              value={statistics.total}
              prefix={
                <AlertOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Active Alerts"
              value={statistics.active}
              prefix={
                <WarningOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Critical Alerts"
              value={statistics.critical}
              prefix={
                <CloseCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Resolved"
              value={statistics.resolved}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

      </Row>

      {/* ===================================================
          ALERT TABLE
      =================================================== */}

      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />

            <span>
              Alert Registry
            </span>

            <Badge
              count={
                statistics.active
              }
              overflowCount={99}
            />
          </Space>
        }
      >

        <Table
          rowKey="id"
          columns={columns}
          dataSource={alerts}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 900,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No alerts found"
              />
            ),
          }}
        />

      </Card>

      {/* ===================================================
          VIEW ALERT MODAL
      =================================================== */}

      <Modal
        title={
          <Space>
            <AlertOutlined />

            Alert Details
          </Space>
        }
        open={viewModalOpen}
        onCancel={() =>
          setViewModalOpen(false)
        }
        footer={null}
        width={650}
      >

        {selectedAlert && (
          <>
            <Descriptions
              bordered
              column={1}
            >

              <Descriptions.Item
                label="Alert ID"
              >
                <Text strong>
                  {selectedAlert.id}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label="Location"
              >
                {selectedAlert.location}
              </Descriptions.Item>

              <Descriptions.Item
                label="Station"
              >
                {selectedAlert.station}
              </Descriptions.Item>

              <Descriptions.Item
                label="Level"
              >
                {getLevelTag(
                  selectedAlert.level
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Status"
              >
                {getStatusTag(
                  selectedAlert.status
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Title"
              >
                {selectedAlert.title}
              </Descriptions.Item>

              <Descriptions.Item
                label="Time"
              >
                {selectedAlert.timestamp}
              </Descriptions.Item>

            </Descriptions>

            <Card
              size="small"
              style={{
                marginTop: 16,
              }}
            >
              <Text strong>
                Description
              </Text>

              <Paragraph
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                {
                  selectedAlert.description
                }
              </Paragraph>
            </Card>

            {selectedAlert.status ===
              "Active" && (
              <Button
                type="primary"
                danger
                icon={
                  <CheckCircleOutlined />
                }
                style={{
                  marginTop: 16,
                }}
                onClick={() => {
                  handleResolve(
                    selectedAlert.id
                  );

                  setSelectedAlert({
                    ...selectedAlert,
                    status: "Resolved",
                  });
                }}
              >
                Resolve Alert
              </Button>
            )}
          </>
        )}

      </Modal>

      {/* ===================================================
          CREATE ALERT MODAL
      =================================================== */}

      <Modal
        title={
          <Space>
            <PlusOutlined />

            Create New Alert
          </Space>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        okText="Create Alert"
        width={650}
      >

        <Form
          form={form}
          layout="vertical"
        >

          <Form.Item
            label="Location"
            name="location"
            rules={[
              {
                required: true,
                message:
                  "Please enter location",
              },
            ]}
          >
            <Input
              prefix={
                <EnvironmentOutlined />
              }
              placeholder="e.g. Nowshera"
            />
          </Form.Item>

          <Form.Item
            label="Station"
            name="station"
            rules={[
              {
                required: true,
                message:
                  "Please select station",
              },
            ]}
          >
            <Select
              placeholder="Select monitoring station"
              options={[
                {
                  value: "NWS-01",
                  label: "NWS-01",
                },
                {
                  value: "NWS-02",
                  label: "NWS-02",
                },
                {
                  value: "NWS-03",
                  label: "NWS-03",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Alert Level"
            name="level"
            rules={[
              {
                required: true,
                message:
                  "Please select alert level",
              },
            ]}
          >
            <Select
              placeholder="Select alert level"
              options={[
                {
                  value: "Critical",
                  label: "Critical",
                },
                {
                  value: "Warning",
                  label: "Warning",
                },
                {
                  value: "Watch",
                  label: "Watch",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Alert Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter alert title",
              },
            ]}
          >
            <Input placeholder="Enter alert title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message:
                  "Please enter description",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the alert condition..."
            />
          </Form.Item>

        </Form>

      </Modal>

    </div>
  );
};

export default Alerts;