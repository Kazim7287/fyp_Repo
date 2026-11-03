
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchHomepageHero,
  saveHomepageHero,
  publishHomepageHero,
  selectHomepageHero,
  selectHomepageHeroLoading,
  selectHomepageHeroSaving,
  selectHomepageHeroPublishing,
  selectHomepageHeroError,
} from "../../../store/slices/homepageHeroSlice";

import {
  Card,
  Typography,
  Button,
  Space,
  Form,
  Input,
  Upload,
  Select,
  message,
  Divider,
  Row,
  Col,
  Tag,
  Modal,
} from "antd";

import {
  UploadOutlined,
  SaveOutlined,
  EyeOutlined,
  PictureOutlined,
  FileTextOutlined,
  ReadOutlined,
  NotificationOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* =========================================================
   SAMPLE BLOG DATA
========================================================= */

const blogOptions = [
  { value: 1, label: "Flood Safety" },
  { value: 2, label: "AI Forecasting" },
  { value: 3, label: "2010 Flood Study" },
];

/* =========================================================
   SAMPLE RESEARCH DATA
========================================================= */

const researchOptions = [
  {
    value: 1,
    label: "IoT and AI-Based Flood Early Warning System",
  },
  {
    value: 2,
    label: "Machine Learning Approaches for Flood Risk Classification",
  },
  {
    value: 3,
    label: "LSTM-Based Water Level Forecasting",
  },
];

/* =========================================================
   INITIAL HOME PAGE DATA
========================================================= */

const initialHomeContent = {
  heroHeading: "AI & IoT-Based Flood Early Warning System",

  heroDescription:
    "An intelligent flood monitoring and early-warning platform that combines IoT sensors, environmental data, GIS, and artificial intelligence to provide timely flood risk information.",

  heroImage: null,

  aboutSection:
    "FloodGuard is an intelligent flood monitoring and early-warning platform designed to help communities, authorities, and emergency response teams detect and respond to flood risks using real-time environmental data and AI-powered forecasting.",

  featuredBlog: 1,

  featuredResearch: 1,

  importantAnnouncement:
    "Stay alert during periods of heavy rainfall and follow official flood warnings and evacuation instructions.",
};

/* =========================================================
   COMPONENT
========================================================= */

const HomePage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // REDUX STATE
  const hero = useSelector(selectHomepageHero);
  const heroLoading = useSelector(selectHomepageHeroLoading);
  const heroSaving = useSelector(selectHomepageHeroSaving);
  const heroPublishing = useSelector(selectHomepageHeroPublishing);
  const heroError = useSelector(selectHomepageHeroError);

  // LOCAL STATE
  const [homeContent, setHomeContent] = useState(initialHomeContent);
  const [previewVisible, setPreviewVisible] = useState(false);

  /* =======================================================
     FETCH HERO DATA WHEN PAGE OPENS
  ======================================================= */

  useEffect(() => {
    dispatch(fetchHomepageHero());
  }, [dispatch]);

  /* =======================================================
     LOAD HERO DATA INTO FORM
  ======================================================= */

  useEffect(() => {
    if (hero) {
      const heading = hero.hero_heading || "";
      const description = hero.hero_description || "";

      form.setFieldsValue({
        heroHeading: heading,
        heroDescription: description,
      });

      setHomeContent((previous) => ({
        ...previous,
        heroHeading: heading,
        heroDescription: description,
      }));
    }
  }, [hero, form]);

  /* =======================================================
     SHOW FETCH ERROR
  ======================================================= */

  useEffect(() => {
    if (heroError) {
      message.error(heroError);
    }
  }, [heroError]);

  /* =======================================================
     OPEN PREVIEW
  ======================================================= */

  const handlePreview = () => {
    const values = form.getFieldsValue();

    setHomeContent((previous) => ({
      ...previous,
      ...values,
    }));

    setPreviewVisible(true);
  };

  /* =======================================================
     SAVE HERO SECTION
  ======================================================= */

  const handleSave = async () => {
    try {
      const values = await form.validateFields([
        "heroHeading",
        "heroDescription",
      ]);

      const heroData = {
        hero_heading: values.heroHeading.trim(),
        hero_description: values.heroDescription.trim(),
      };

      await dispatch(saveHomepageHero(heroData)).unwrap();

      setHomeContent((previous) => ({
        ...previous,
        heroHeading: values.heroHeading,
        heroDescription: values.heroDescription,
      }));

      message.success("Homepage hero saved successfully.");
    } catch (error) {
      if (typeof error === "string") {
        message.error(error);
      } else if (error?.message) {
        message.error(error.message);
      }
      // Ant Design validation errors are handled by the form.
    }
  };

  /* =======================================================
     PUBLISH HERO SECTION
  ======================================================= */

  const handlePublish = async () => {
    try {
      await dispatch(publishHomepageHero()).unwrap();

      message.success("Homepage hero published successfully.");
    } catch (error) {
      message.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to publish homepage hero."
      );
    }
  };

  /* =======================================================
     UPLOAD CONFIGURATION
  ======================================================= */

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture-card",
  };

  /* =======================================================
     INITIAL FORM VALUES
  ======================================================= */

  const initialValues = {
    heroHeading: homeContent.heroHeading,
    heroDescription: homeContent.heroDescription,
    aboutSection: homeContent.aboutSection,
    featuredBlog: homeContent.featuredBlog,
    featuredResearch: homeContent.featuredResearch,
    importantAnnouncement: homeContent.importantAnnouncement,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

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
          <Title level={3} style={{ marginBottom: 4 }}>
            Home Page Management
          </Title>

          <Text type="secondary">
            Manage the content displayed on the public FloodGuard home page.
          </Text>
        </div>

        <Space wrap>
          <Button
            icon={<EyeOutlined />}
            onClick={handlePreview}
          >
            Preview
          </Button>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={heroSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>

          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={heroPublishing}
            disabled={!hero}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </Space>
      </div>

      {/* =================================================
          STATUS
      ================================================= */}

      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          {hero?.status === "published" ? (
            <Tag color="success">Published</Tag>
          ) : (
            <Tag color="warning">
              {hero ? "Draft" : "Not Saved"}
            </Tag>
          )}

          <Text type="secondary">
            {heroLoading
              ? "Loading homepage configuration..."
              : hero?.published_at
                ? `Last published: ${new Date(
                    hero.published_at
                  ).toLocaleString()}`
                : "Manage your homepage configuration"}
          </Text>
        </Space>
      </Card>

      {/* =================================================
          MAIN FORM
      ================================================= */}

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        {/* =================================================
            HERO SECTION
        ================================================= */}

        <Card
          title={
            <Space>
              <PictureOutlined />
              <span>Hero Section</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          loading={heroLoading}
        >
          <Row gutter={24}>
            {/* HERO TEXT */}

            <Col xs={24} lg={14}>
              <Form.Item
                label="Hero Heading"
                name="heroHeading"
                rules={[
                  {
                    required: true,
                    message: "Please enter the hero heading.",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter hero heading"
                  maxLength={150}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Hero Description"
                name="heroDescription"
                rules={[
                  {
                    required: true,
                    message: "Please enter the hero description.",
                  },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Enter hero description..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            {/* HERO IMAGE */}

            <Col xs={24} lg={10}>
              <Form.Item
                label="Hero Image"
                name="heroImage"
                valuePropName="fileList"
                getValueFromEvent={(event) => event?.fileList}
              >
                <Upload {...uploadProps}>
                  <div>
                    <PictureOutlined style={{ fontSize: 28 }} />

                    <div style={{ marginTop: 8 }}>
                      Upload Hero Image
                    </div>
                  </div>
                </Upload>
              </Form.Item>

              <Text type="secondary">
                Recommended: high-resolution landscape image suitable
                for the homepage hero section.
              </Text>

              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Image upload will be connected to storage separately.
              </Text>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            ABOUT SECTION
        ================================================= */}

        <Card
          title={
            <Space>
              <ReadOutlined />
              <span>About Section</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            label="About Section"
            name="aboutSection"
            rules={[
              {
                required: true,
                message: "Please enter the about section content.",
              },
            ]}
          >
            <TextArea
              rows={8}
              placeholder="Enter information about FloodGuard..."
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Card>

        {/* =================================================
            FEATURED CONTENT
        ================================================= */}

        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>Featured Content</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={24}>
            {/* FEATURED BLOG */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Featured Blog"
                name="featuredBlog"
                rules={[
                  {
                    required: true,
                    message: "Please select a featured blog.",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select featured blog"
                  options={blogOptions}
                  optionFilterProp="label"
                  showSearch
                />
              </Form.Item>

              <Text type="secondary">
                This blog will be displayed in the featured blog section
                of the homepage.
              </Text>
            </Col>

            {/* FEATURED RESEARCH */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Featured Research"
                name="featuredResearch"
                rules={[
                  {
                    required: true,
                    message: "Please select featured research.",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select featured research"
                  options={researchOptions}
                  optionFilterProp="label"
                  showSearch
                />
              </Form.Item>

              <Text type="secondary">
                This research item will be displayed in the featured
                research section.
              </Text>
            </Col>
          </Row>
        </Card>

        {/* =================================================
            IMPORTANT ANNOUNCEMENT
        ================================================= */}

        <Card
          title={
            <Space>
              <NotificationOutlined />
              <span>Important Announcement</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            label="Important Announcement"
            name="importantAnnouncement"
            rules={[
              {
                required: true,
                message: "Please enter an important announcement.",
              },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="Enter an important announcement for visitors..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              Preview Homepage
            </Button>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={heroSaving}
              onClick={handleSave}
            >
              Save Changes
            </Button>

            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={heroPublishing}
              disabled={!hero}
              onClick={handlePublish}
            >
              Publish Homepage
            </Button>
          </div>
        </Card>
      </Form>

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      <Modal
        title="Homepage Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={
          <Button onClick={() => setPreviewVisible(false)}>
            Close Preview
          </Button>
        }
        width={900}
      >
        {/* HERO PREVIEW */}

        <div
          style={{
            padding: 32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #e6f4ff, #f0f5ff)",
            marginBottom: 24,
          }}
        >
          <Tag color="blue" style={{ marginBottom: 12 }}>
            FloodGuard
          </Tag>

          <Title level={2}>
            {form.getFieldValue("heroHeading") ||
              homeContent.heroHeading}
          </Title>

          <Paragraph>
            {form.getFieldValue("heroDescription") ||
              homeContent.heroDescription}
          </Paragraph>
        </div>

        {/* ABOUT */}

        <Card
          size="small"
          title="About FloodGuard"
          style={{ marginBottom: 16 }}
        >
          <Text>
            {form.getFieldValue("aboutSection") ||
              homeContent.aboutSection}
          </Text>
        </Card>

        {/* FEATURED CONTENT */}

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card size="small" title="Featured Blog">
              <Tag color="blue">Blog</Tag>

              <Title level={4} style={{ marginTop: 12 }}>
                {blogOptions.find(
                  (blog) =>
                    blog.value ===
                    (form.getFieldValue("featuredBlog") ||
                      homeContent.featuredBlog)
                )?.label || "No blog selected"}
              </Title>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card size="small" title="Featured Research">
              <Tag color="purple">Research</Tag>

              <Title level={4} style={{ marginTop: 12 }}>
                {researchOptions.find(
                  (research) =>
                    research.value ===
                    (form.getFieldValue("featuredResearch") ||
                      homeContent.featuredResearch)
                )?.label || "No research selected"}
              </Title>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* ANNOUNCEMENT */}

        <Card
          size="small"
          title={
            <Space>
              <NotificationOutlined />
              Important Announcement
            </Space>
          }
        >
          <Text>
            {form.getFieldValue("importantAnnouncement") ||
              homeContent.importantAnnouncement}
          </Text>
        </Card>
      </Modal>
    </div>
  );
};

export default HomePage;
