import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Spin,
  Alert as AntAlert,
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
  ReloadOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchAlerts,
  fetchAlertById,
  createManualAlert,
  resolveAlert,
  acknowledgeAlert,
  selectAlerts,
  selectSelectedAlert,
  selectAlertsLoading,
  selectAlertsCreating,
  selectAlertsUpdating,
  selectAlertsError,
  selectAlertsCreateError,
} from "../store/slices/alertSlice";

const { Title, Text, Paragraph } =
  Typography;

const { TextArea } = Input;

/* =========================================================
   LEVEL TAG
========================================================= */

const getLevelTag = (level) => {
  switch (level) {
    case "Critical":
      return (
        <Tag
          icon={
            <CloseCircleOutlined />
          }
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
  switch (status) {
    case "Active":
      return (
        <Tag
          icon={<AlertOutlined />}
          color="error"
        >
          Active
        </Tag>
      );

    case "Acknowledged":
      return (
        <Tag
          icon={
            <CheckCircleOutlined />
          }
          color="processing"
        >
          Acknowledged
        </Tag>
      );

    case "Resolved":
      return (
        <Tag
          icon={
            <CheckCircleOutlined />
          }
          color="success"
        >
          Resolved
        </Tag>
      );

    default:
      return <Tag>{status}</Tag>;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const Alerts = () => {
  /*
  |--------------------------------------------------------------------------
  | REDUX
  |--------------------------------------------------------------------------
  */

  const dispatch = useDispatch();

  const alerts = useSelector(
    selectAlerts
  );

  const selectedAlert = useSelector(
    selectSelectedAlert
  );

  const loading = useSelector(
    selectAlertsLoading
  );

  const creating = useSelector(
    selectAlertsCreating
  );

  const updating = useSelector(
    selectAlertsUpdating
  );

  const error = useSelector(
    selectAlertsError
  );

  const createError = useSelector(
    selectAlertsCreateError
  );

  /*
  |--------------------------------------------------------------------------
  | LOCAL UI STATE
  |--------------------------------------------------------------------------
  */

  const [
    viewModalOpen,
    setViewModalOpen,
  ] = useState(false);

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [form] =
    Form.useForm();

  /*
  |--------------------------------------------------------------------------
  | LOAD ALERTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const statistics = useMemo(() => {
    return {
      total: alerts.length,

      active: alerts.filter(
        (alert) =>
          alert.status === "Active"
      ).length,

      critical: alerts.filter(
        (alert) =>
          alert.level ===
            "Critical" &&
          alert.status !==
            "Resolved"
      ).length,

      resolved: alerts.filter(
        (alert) =>
          alert.status ===
          "Resolved"
      ).length,
    };
  }, [alerts]);

  /*
  |--------------------------------------------------------------------------
  | VIEW ALERT
  |--------------------------------------------------------------------------
  */

  const handleView = async (
    alert
  ) => {
    try {
      await dispatch(
        fetchAlertById(alert.id)
      ).unwrap();

      setViewModalOpen(true);
    } catch (error) {
      message.error(
        error ||
          "Unable to load alert details."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE MODAL
  |--------------------------------------------------------------------------
  */

  const openCreateModal = () => {
    form.resetFields();

    setCreateModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE MANUAL ALERT
  |--------------------------------------------------------------------------
  */

  const handleCreate = async () => {
    try {
      const values =
        await form.validateFields();

      const alertData = {
        location:
          values.location,

        station:
          values.station,

        level:
          values.level,

        title:
          values.title,

        description:
          values.description,

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | This tells the backend that this
        | alert was manually created.
        |
        */

        type: "manual",
      };

      await dispatch(
        createManualAlert(
          alertData
        )
      ).unwrap();

      message.success(
        "Manual alert created successfully."
      );

      form.resetFields();

      setCreateModalOpen(false);

      /*
      |--------------------------------------------------------------------------
      | Refresh from database
      |--------------------------------------------------------------------------
      */

      dispatch(fetchAlerts());
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Ant Design validation errors
      |--------------------------------------------------------------------------
      |
      | validateFields() rejects when validation
      | fails. We don't need to show an error.
      |
      */

      if (
        typeof error ===
        "string"
      ) {
        message.error(error);
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESOLVE ALERT
  |--------------------------------------------------------------------------
  */

  const handleResolve = async (
    alertId
  ) => {
    try {
      await dispatch(
        resolveAlert(alertId)
      ).unwrap();

      message.success(
        "Alert resolved successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | Refresh database data
      |--------------------------------------------------------------------------
      */

      dispatch(fetchAlerts());

      setViewModalOpen(false);
    } catch (error) {
      message.error(
        error ||
          "Failed to resolve alert."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ACKNOWLEDGE ALERT
  |--------------------------------------------------------------------------
  */

  const handleAcknowledge =
    async (alertId) => {
      try {
        await dispatch(
          acknowledgeAlert(
            alertId
          )
        ).unwrap();

        message.success(
          "Alert acknowledged successfully."
        );

        dispatch(
          fetchAlerts()
        );
      } catch (error) {
        message.error(
          error ||
            "Failed to acknowledge alert."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TABLE COLUMNS
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title: "Location",

      dataIndex: "location",

      key: "location",

      render: (value) => (
        <Space>
          <EnvironmentOutlined />

          <Text strong>
            {value || "—"}
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
          {value || "—"}
        </Text>
      ),
    },

    {
      title: "Source",

      dataIndex: "type",

      key: "type",

      render: (value) => {
        const type =
          String(
            value || ""
          ).toLowerCase();

        if (
          type === "automatic"
        ) {
          return (
            <Tag color="blue">
              Automatic
            </Tag>
          );
        }

        return (
          <Tag color="purple">
            Manual
          </Tag>
        );
      },
    },

    {
      title: "Time",

      dataIndex: "timestamp",

      key: "timestamp",

      render: (
        value,
        record
      ) => (
        <Space>
          <ClockCircleOutlined />

          <Text type="secondary">
            {value ||
              record.created_at ||
              "—"}
          </Text>
        </Space>
      ),
    },

    {
      title: "Action",

      key: "action",

      render: (
        _,
        record
      ) => (
        <Space wrap>
          <Button
            size="small"
            icon={
              <EyeOutlined />
            }
            onClick={() =>
              handleView(
                record
              )
            }
          >
            View
          </Button>

          {record.status ===
            "Active" && (
            <Popconfirm
              title="Acknowledge this alert?"
              description="The alert will be marked as acknowledged."
              okText="Acknowledge"
              cancelText="Cancel"
              onConfirm={() =>
                handleAcknowledge(
                  record.id
                )
              }
            >
              <Button
                size="small"
                icon={
                  <CheckCircleOutlined />
                }
                loading={
                  updating
                }
              >
                Acknowledge
              </Button>
            </Popconfirm>
          )}

          {record.status !==
            "Resolved" && (
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
                danger
                icon={
                  <CheckCircleOutlined />
                }
                loading={
                  updating
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

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

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
            Monitor, create, manage,
            acknowledge, and resolve
            flood and environmental
            alerts.
          </Text>
        </div>

        <Space>
          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={() =>
              dispatch(
                fetchAlerts()
              )
            }
            loading={loading}
          >
            Refresh
          </Button>

          <Button
            type="primary"
            icon={
              <PlusOutlined />
            }
            onClick={
              openCreateModal
            }
          >
            Create Alert
          </Button>
        </Space>
      </div>

      {/* ===================================================
          API ERROR
      =================================================== */}

      {error && (
        <AntAlert
          type="error"
          showIcon
          closable
          message="Unable to load alerts"
          description={error}
          style={{
            marginBottom: 24,
          }}
        />
      )}

      {/* ===================================================
          CREATE ERROR
      =================================================== */}

      {createError && (
        <AntAlert
          type="error"
          showIcon
          message="Alert creation failed"
          description={createError}
          style={{
            marginBottom: 24,
          }}
        />
      )}

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
              value={
                statistics.total
              }
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
              value={
                statistics.active
              }
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
              value={
                statistics.critical
              }
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
              value={
                statistics.resolved
              }
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
        {loading &&
        alerts.length === 0 ? (
          <div
            style={{
              minHeight: 250,
              display: "flex",
              justifyContent:
                "center",
              alignItems: "center",
            }}
          >
            <Spin
              size="large"
              tip="Loading alerts..."
            />
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={alerts}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [
                "10",
                "20",
                "50",
              ],
            }}
            scroll={{
              x: 1100,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No alerts found"
                />
              ),
            }}
          />
        )}
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
        width={700}
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
                {selectedAlert.location ||
                  "—"}
              </Descriptions.Item>

              <Descriptions.Item
                label="Station"
              >
                {selectedAlert.station ||
                  "—"}
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
                label="Source"
              >
                {String(
                  selectedAlert.type ||
                    ""
                ).toLowerCase() ===
                "automatic" ? (
                  <Tag color="blue">
                    Automatic
                  </Tag>
                ) : (
                  <Tag color="purple">
                    Manual
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Title"
              >
                {selectedAlert.title ||
                  "—"}
              </Descriptions.Item>

              <Descriptions.Item
                label="Time"
              >
                {selectedAlert.timestamp ||
                  selectedAlert.created_at ||
                  "—"}
              </Descriptions.Item>

              {selectedAlert.created_by && (
                <Descriptions.Item
                  label="Created By"
                >
                  {selectedAlert.created_by}
                </Descriptions.Item>
              )}
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
                {selectedAlert.description ||
                  "No description available."}
              </Paragraph>
            </Card>

            {selectedAlert.status ===
              "Active" && (
              <Space
                style={{
                  marginTop: 16,
                }}
              >
                <Button
                  icon={
                    <CheckCircleOutlined />
                  }
                  onClick={() =>
                    handleAcknowledge(
                      selectedAlert.id
                    )
                  }
                  loading={updating}
                >
                  Acknowledge
                </Button>

                <Button
                  type="primary"
                  danger
                  icon={
                    <CheckCircleOutlined />
                  }
                  onClick={() =>
                    handleResolve(
                      selectedAlert.id
                    )
                  }
                  loading={updating}
                >
                  Resolve Alert
                </Button>
              </Space>
            )}

            {selectedAlert.status ===
              "Acknowledged" && (
              <Button
                type="primary"
                danger
                icon={
                  <CheckCircleOutlined />
                }
                style={{
                  marginTop: 16,
                }}
                onClick={() =>
                  handleResolve(
                    selectedAlert.id
                  )
                }
                loading={updating}
              >
                Resolve Alert
              </Button>
            )}
          </>
        )}
      </Modal>

      {/* ===================================================
          CREATE MANUAL ALERT MODAL
      =================================================== */}

      <Modal
        title={
          <Space>
            <PlusOutlined />

            Create Manual Alert
          </Space>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(
            false
          );

          form.resetFields();
        }}
        onOk={handleCreate}
        okText="Create Alert"
        confirmLoading={creating}
        width={650}
        destroyOnHidden
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
            <Input
              placeholder="Enter alert title"
            />
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

          <AntAlert
            type="info"
            showIcon
            message="Manual Alert"
            description="This alert will be stored as a manual alert and associated with the currently logged-in user."
          />
        </Form>
      </Modal>
    </div>
  );
};

export default Alerts;