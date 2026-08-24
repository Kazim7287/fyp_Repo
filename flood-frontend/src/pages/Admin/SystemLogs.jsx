import { useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Button,
  Modal,
  Descriptions,
} from "antd";

import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SystemLogs = () => {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* =========================================================
     PROTOTYPE LOG DATA
  ========================================================= */

  const [logs] = useState([
    {
      key: 1,
      timestamp: "2026-08-20 10:42:18",
      user: "Admin",
      action: "Updated Home Page",
      module: "Content Management",
      severity: "Info",
      ip: "192.168.1.10",
      status: "Success",
      details:
        "Hero heading and description were updated successfully.",
    },
    {
      key: 2,
      timestamp: "2026-08-20 10:35:42",
      user: "Admin",
      action: "Uploaded Media",
      module: "Media Library",
      severity: "Info",
      ip: "192.168.1.10",
      status: "Success",
      details:
        "Flood awareness image uploaded to the media library.",
    },
    {
      key: 3,
      timestamp: "2026-08-20 10:21:07",
      user: "User 01",
      action: "Login",
      module: "Authentication",
      severity: "Info",
      ip: "192.168.1.15",
      status: "Success",
      details:
        "User successfully authenticated into the admin portal.",
    },
    {
      key: 4,
      timestamp: "2026-08-20 09:58:31",
      user: "Admin",
      action: "Disabled User",
      module: "User Management",
      severity: "Warning",
      ip: "192.168.1.10",
      status: "Success",
      details:
        "User account was disabled by the administrator.",
    },
    {
      key: 5,
      timestamp: "2026-08-20 09:44:12",
      user: "User 02",
      action: "Login Attempt",
      module: "Authentication",
      severity: "Error",
      ip: "192.168.1.25",
      status: "Failed",
      details:
        "Authentication failed because the supplied credentials were invalid.",
    },
    {
      key: 6,
      timestamp: "2026-08-20 09:31:55",
      user: "Admin",
      action: "Updated Alert Configuration",
      module: "Alerts",
      severity: "Warning",
      ip: "192.168.1.10",
      status: "Success",
      details:
        "Flood alert threshold configuration was modified.",
    },
  ]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      log.action
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      log.module
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      log.ip
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesSeverity =
      severity === "all" ||
      log.severity === severity;

    return matchesSearch && matchesSeverity;
  });

  /* =========================================================
     VIEW LOG
  ========================================================= */

  const handleView = (record) => {
    setSelectedLog(record);
    setModalOpen(true);
  };

  /* =========================================================
     TABLE
  ========================================================= */

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (value) => (
        <Text code>{value}</Text>
      ),
    },

    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 120,
      render: (value) => (
        <Text strong>{value}</Text>
      ),
    },

    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 220,
    },

    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 180,
    },

    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 110,
      render: (value) => {
        const colors = {
          Info: "blue",
          Warning: "orange",
          Error: "red",
        };

        return (
          <Tag color={colors[value]}>
            {value}
          </Tag>
        );
      },
    },

    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      width: 140,
      render: (value) => (
        <Text code>{value}</Text>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (value) => (
        <Tag
          color={
            value === "Success"
              ? "success"
              : "error"
          }
        >
          {value}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 90,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={3}
            style={{ marginBottom: 4 }}
          >
            System Logs
          </Title>

          <Text type="secondary">
            Monitor administrative activities,
            authentication events, and system
            operations.
          </Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearch("");
            setSeverity("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <Space
          wrap
          style={{
            width: "100%",
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search logs..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: 300,
            }}
          />

          <Select
            value={severity}
            onChange={setSeverity}
            style={{
              width: 160,
            }}
            options={[
              {
                value: "all",
                label: "All Severity",
              },
              {
                value: "Info",
                label: "Info",
              },
              {
                value: "Warning",
                label: "Warning",
              },
              {
                value: "Error",
                label: "Error",
              },
            ]}
          />
        </Space>
      </Card>

      {/* =====================================================
          LOG TABLE
      ===================================================== */}

      <Card>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredLogs}
          scroll={{
            x: 1300,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} logs`,
          }}
        />
      </Card>

      {/* =====================================================
          LOG DETAILS
      ===================================================== */}

      <Modal
        title="System Log Details"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedLog(null);
        }}
        footer={null}
        width={650}
      >
        {selectedLog && (
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Timestamp">
              {selectedLog.timestamp}
            </Descriptions.Item>

            <Descriptions.Item label="User">
              {selectedLog.user}
            </Descriptions.Item>

            <Descriptions.Item label="Action">
              {selectedLog.action}
            </Descriptions.Item>

            <Descriptions.Item label="Module">
              {selectedLog.module}
            </Descriptions.Item>

            <Descriptions.Item label="Severity">
              <Tag
                color={
                  selectedLog.severity ===
                  "Info"
                    ? "blue"
                    : selectedLog.severity ===
                      "Warning"
                    ? "orange"
                    : "red"
                }
              >
                {selectedLog.severity}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="IP Address">
              <Text code>
                {selectedLog.ip}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedLog.status ===
                  "Success"
                    ? "success"
                    : "error"
                }
              >
                {selectedLog.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Details">
              {selectedLog.details}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SystemLogs;