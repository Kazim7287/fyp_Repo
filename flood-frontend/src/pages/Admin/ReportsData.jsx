import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Select,
} from "antd";

import {
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ReportsData = () => {
  const reports = [
    {
      key: 1,
      reportId: "RPT-001",
      title: "Weekly Flood Monitoring Report",
      type: "Flood Monitoring",
      period: "Aug 10 - Aug 16, 2026",
      status: "Generated",
    },
    {
      key: 2,
      reportId: "RPT-002",
      title: "Environmental Conditions Report",
      type: "Environmental",
      period: "Aug 10 - Aug 16, 2026",
      status: "Generated",
    },
    {
      key: 3,
      reportId: "RPT-003",
      title: "IoT Infrastructure Health Report",
      type: "IoT",
      period: "Aug 10 - Aug 16, 2026",
      status: "Generated",
    },
    {
      key: 4,
      reportId: "RPT-004",
      title: "Flood Risk Assessment",
      type: "AI Forecasting",
      period: "Aug 01 - Aug 16, 2026",
      status: "Processing",
    },
  ];

  const columns = [
    {
      title: "Report ID",
      dataIndex: "reportId",
      key: "reportId",
      render: (value) => (
        <Text strong>{value}</Text>
      ),
    },
    {
      title: "Report",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag>{type}</Tag>
      ),
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Generated"
              ? "success"
              : "processing"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<DownloadOutlined />}
          disabled={record.status !== "Generated"}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER */}

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
          <Title
            level={3}
            style={{ marginBottom: 4 }}
          >
            Reports & Data
          </Title>

          <Text type="secondary">
            Generate, review, and manage system
            reports and collected monitoring data.
          </Text>
        </div>

        <Space wrap>
          <Select
            defaultValue="30"
            style={{ width: 150 }}
            options={[
              {
                value: "7",
                label: "Last 7 Days",
              },
              {
                value: "30",
                label: "Last 30 Days",
              },
              {
                value: "90",
                label: "Last 90 Days",
              },
            ]}
          />

          <Button
            type="primary"
            icon={<FileTextOutlined />}
          >
            Generate Report
          </Button>
        </Space>
      </div>

      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Reports"
              value={48}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Generated"
              value={43}
              prefix={<CloudDownloadOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Data Records"
              value="2.4M"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Data Sources"
              value={18}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* REPORT TABLE */}

      <Card
        title={
          <Space>
            <FileTextOutlined />
            Generated Reports
          </Space>
        }
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={reports}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: "max-content",
          }}
        />
      </Card>
    </div>
  );
};

export default ReportsData;