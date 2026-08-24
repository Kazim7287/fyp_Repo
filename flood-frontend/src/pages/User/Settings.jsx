
import {
  Card,
  Typography,
  Switch,
  Select,
  Divider,
  Space,
  Row,
  Col,
  Button,
  message,
} from "antd";

import {
  BellOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Settings = () => {
  const [messageApi, contextHolder] =
    message.useMessage();

  const handleSave = () => {
    messageApi.success(
      "Settings saved successfully"
    );
  };

  return (
    <>
      {contextHolder}

      <div
        style={{
          minHeight: "100%",
          padding: 24,
          background: "#f5f7fa",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            marginBottom: 24,
          }}
        >
          <Title
            level={2}
            style={{
              marginBottom: 5,
            }}
          >
            Settings
          </Title>

          <Text type="secondary">
            Customize your flood monitoring experience.
          </Text>
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            marginBottom: 20,
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <Space>
            <BellOutlined
              style={{
                fontSize: 20,
                color: "#1677ff",
              }}
            />

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                }}
              >
                Notifications
              </Title>

              <Text type="secondary">
                Control how you receive flood warnings.
              </Text>
            </div>
          </Space>

          <Divider />

          <Row
            justify="space-between"
            align="middle"
            style={{
              marginBottom: 20,
            }}
          >
            <Col>
              <Text strong>
                Flood Alerts
              </Text>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 4,
                }}
              >
                Receive important flood-risk alerts.
              </Text>
            </Col>

            <Col>
              <Switch defaultChecked />
            </Col>
          </Row>

          <Row
            justify="space-between"
            align="middle"
          >
            <Col>
              <Text strong>
                Emergency Notifications
              </Text>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 4,
                }}
              >
                Receive urgent emergency information.
              </Text>
            </Col>

            <Col>
              <Switch defaultChecked />
            </Col>
          </Row>
        </Card>

        {/* =================================================
            LANGUAGE
        ================================================= */}

        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            marginBottom: 20,
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <Space>
            <GlobalOutlined
              style={{
                fontSize: 20,
                color: "#1677ff",
              }}
            />

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                }}
              >
                Language
              </Title>

              <Text type="secondary">
                Select your preferred language.
              </Text>
            </div>
          </Space>

          <Divider />

          <Row
            justify="space-between"
            align="middle"
          >
            <Col>
              <Text strong>
                Interface Language
              </Text>
            </Col>

            <Col>
              <Select
                defaultValue="English"
                style={{
                  width: 180,
                }}
                options={[
                  {
                    value: "English",
                    label: "English",
                  },
                  {
                    value: "Urdu",
                    label: "اردو",
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* =================================================
            SECURITY
        ================================================= */}

        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            marginBottom: 20,
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <Space>
            <SafetyCertificateOutlined
              style={{
                fontSize: 20,
                color: "#52c41a",
              }}
            />

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                }}
              >
                Security
              </Title>

              <Text type="secondary">
                Manage your account security preferences.
              </Text>
            </div>
          </Space>

          <Divider />

          <Row
            justify="space-between"
            align="middle"
          >
            <Col>
              <Text strong>
                Secure Session
              </Text>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 4,
                }}
              >
                Keep your authenticated session active.
              </Text>
            </Col>

            <Col>
              <Switch defaultChecked />
            </Col>
          </Row>
        </Card>

        {/* =================================================
            SAVE
        ================================================= */}

        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.05)",
          }}
        >
          <Row
            justify="end"
          >
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default Settings;

