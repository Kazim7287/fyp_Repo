import {
  Card,
  Col,
  Row,
  Typography,
  Button,
  Space,
} from "antd";

import {
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const { Title, Text } = Typography;

const sections = [
  {
    key: "home",
    title: "Home Page",
    description: "Manage public homepage content.",
    icon: <HomeOutlined />,
    path: "/admin/content/home",
  },
  {
    key: "blog",
    title: "Blog",
    description: "Manage blog articles and publications.",
    icon: <FileTextOutlined />,
    path: "/admin/content/blog",
  },
  {
    key: "research",
    title: "Research",
    description: "Manage research papers and publications.",
    icon: <BookOutlined />,
    path: "/admin/content/research",
  },
  {
    key: "news",
    title: "News",
    description: "Manage project and system news.",
    icon: <NotificationOutlined />,
    path: "/admin/content/news",
  },
  {
    key: "awareness",
    title: "Flood Awareness",
    description: "Manage flood safety and awareness content.",
    icon: <SafetyCertificateOutlined />,
    path: "/admin/content/awareness",
  },
  {
    key: "announcements",
    title: "Announcements",
    description: "Manage important public announcements.",
    icon: <NotificationOutlined />,
    path: "/admin/content/announcements",
  },
  {
    key: "faqs",
    title: "FAQs",
    description: "Manage frequently asked questions.",
    icon: <QuestionCircleOutlined />,
    path: "/admin/content/faqs",
  },
{
  key: "emergency-information",
  title: "Emergency Information",
  description: "Manage critical emergency information.",
  icon: <AlertOutlined />,
  path: "/admin/content/emergency-information",
},
];

const ContentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot =
    location.pathname === "/admin/content";

  return (
    <div>

      <div style={{ marginBottom: 24 }}>
        <Title
          level={3}
          style={{ marginBottom: 4 }}
        >
          Content Management
        </Title>

        <Text type="secondary">
          Manage all information displayed on the
          public FloodGuard website.
        </Text>
      </div>

      {isRoot ? (
        <Row gutter={[16, 16]}>
          {sections.map((section) => (
            <Col
              key={section.key}
              xs={24}
              sm={12}
              lg={8}
              xl={6}
            >
              <Card
                hoverable
                style={{
                  height: "100%",
                }}
                onClick={() =>
                  navigate(section.path)
                }
              >
                <Space
                  direction="vertical"
                  size={12}
                >
                  <div
                    style={{
                      fontSize: 28,
                    }}
                  >
                    {section.icon}
                  </div>

                  <Title
                    level={4}
                    style={{ margin: 0 }}
                  >
                    {section.title}
                  </Title>

                  <Text type="secondary">
                    {section.description}
                  </Text>

                  <Button
                    type="link"
                    style={{
                      padding: 0,
                    }}
                  >
                    Manage →
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Outlet />
      )}

    </div>
  );
};

export default ContentManagement;