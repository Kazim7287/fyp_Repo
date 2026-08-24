import { useState } from "react";

import {
  Card,
  Typography,
  Form,
  Input,
  Switch,
  Button,
  Select,
  Divider,
  Row,
  Col,
  message,
  Space,
} from "antd";

import {
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  GlobalOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Settings = () => {
  const [form] = Form.useForm();

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setSaving(true);

      // Prototype only
      console.log("Settings:", values);

      setTimeout(() => {
        setSaving(false);
        message.success(
          "Settings saved successfully"
        );
      }, 500);
    } catch (error) {
      // Ant Design handles validation errors
    }
  };

  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div style={{ marginBottom: 24 }}>
        <Title
          level={3}
          style={{ marginBottom: 4 }}
        >
          Settings
        </Title>

        <Text type="secondary">
          Configure system preferences, notifications,
          security, and application settings.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          systemName: "FloodGuard",
          timezone: "Asia/Karachi",
          language: "English",
          emailNotifications: true,
          smsNotifications: true,
          floodAlerts: true,
          systemAlerts: true,
          maintenanceMode: false,
          twoFactorAuth: false,
        }}
      >

        {/* =================================================
            GENERAL SETTINGS
        ================================================= */}

        <Card
          title={
            <Space>
              <SettingOutlined />
              General Settings
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="System Name"
                name="systemName"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter the system name",
                  },
                ]}
              >
                <Input
                  placeholder="Enter system name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Timezone"
                name="timezone"
              >
                <Select
                  options={[
                    {
                      value: "Asia/Karachi",
                      label:
                        "Pakistan Standard Time (UTC+5)",
                    },
                    {
                      value: "UTC",
                      label: "UTC",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Language"
                name="language"
              >
                <Select
                  options={[
                    {
                      value: "English",
                      label: "English",
                    },
                    {
                      value: "Urdu",
                      label: "Urdu",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            NOTIFICATION SETTINGS
        ================================================= */}

        <Card
          title={
            <Space>
              <BellOutlined />
              Notification Settings
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item
            label="SMS Notifications"
            name="smsNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Flood Risk Alerts"
            name="floodAlerts"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item
            label="System Notifications"
            name="systemAlerts"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* =================================================
            SECURITY SETTINGS
        ================================================= */}

        <Card
          title={
            <Space>
              <SafetyOutlined />
              Security Settings
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Form.Item
            label="Two-Factor Authentication"
            name="twoFactorAuth"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Text type="secondary">
            Require an additional authentication
            factor when administrators sign in.
          </Text>
        </Card>

        {/* =================================================
            SYSTEM SETTINGS
        ================================================= */}

        <Card
          title={
            <Space>
              <GlobalOutlined />
              System Status
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Form.Item
            label="Maintenance Mode"
            name="maintenanceMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Text type="secondary">
            Enable maintenance mode to temporarily
            restrict access to the public system.
          </Text>
        </Card>

        {/* =================================================
            SAVE
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>

      </Form>
    </div>
  );
};

export default Settings;