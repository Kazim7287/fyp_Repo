import { useState } from "react";

import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Modal,
  Divider,
  Empty,
} from "antd";

import {
  HistoryOutlined,
  EnvironmentOutlined,
  CloudOutlined,
  RiseOutlined,
  FileTextOutlined,
  PictureOutlined,
  GlobalOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// =========================================================
// SAMPLE HISTORICAL DATA
// =========================================================

const historicalEvents = [
  {
    id: 1,
    year: 2022,
    title: "2022 Flood Event",
    location: "Nowshera & Kabul River Basin",
    severity: "Critical",
    severityColor: "red",

    maximumWaterLevel: "17.4 m",
    rainfall: "Heavy rainfall recorded",
    affectedAreas: [
      "Nowshera",
      "Kabul River Basin",
      "Low-lying communities",
    ],

    description:
      "A major flooding event affected several areas within the Kabul River basin. High river levels and intense rainfall contributed to significant flood risk in vulnerable areas.",

    research:
      "Historical flood records, satellite observations, rainfall datasets, and hydrological measurements can be used to study this event and improve future flood prediction.",

    image:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 2,
    year: 2010,
    title: "2010 Flood Event",
    location: "Khyber Pakhtunkhwa & Indus Basin",
    severity: "Critical",
    severityColor: "red",

    maximumWaterLevel: "Historical record",
    rainfall: "Exceptional rainfall",
    affectedAreas: [
      "Khyber Pakhtunkhwa",
      "Indus Basin",
      "Riverine communities",
    ],

    description:
      "The 2010 floods were among the most significant flood disasters in Pakistan's recent history, affecting extensive areas and communities across the country.",

    research:
      "The event provides an important historical reference for flood hazard assessment, rainfall analysis, river response, and disaster preparedness.",

    image:
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80",
  },
];

// =========================================================
// COMPONENT
// =========================================================

const HistoricalFloods = () => {
  const [selectedEvent, setSelectedEvent] =
    useState(null);

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100%",
        background: "#f5f7fa",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          marginBottom: 24,
        }}
      >
        <Space align="start" size={14}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#e6f4ff",
              color: "#1677ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 23,
            }}
          >
            <HistoryOutlined />
          </div>

          <div>
            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              Historical Floods
            </Title>

            <Text type="secondary">
              Explore previous flood events and learn
              how major flooding affected different
              regions.
            </Text>
          </div>
        </Space>
      </Card>

      {/* =====================================================
          EVENT CARDS
      ===================================================== */}

      <Row gutter={[20, 20]}>
        {historicalEvents.map((event) => (
          <Col
            xs={24}
            lg={12}
            key={event.id}
          >
            <Card
              variant="borderless"
              style={{
                borderRadius: 14,
                overflow: "hidden",
                height: "100%",
              }}
              styles={{
                body: {
                  padding: 0,
                },
              }}
            >
              {/* IMAGE */}

              <div
                style={{
                  height: 210,
                  backgroundImage: `url(${event.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* CONTENT */}

              <div
                style={{
                  padding: 22,
                }}
              >
                <Space
                  direction="vertical"
                  size={12}
                  style={{
                    width: "100%",
                  }}
                >
                  {/* TITLE */}

                  <Space
                    align="center"
                    style={{
                      justifyContent:
                        "space-between",
                      width: "100%",
                    }}
                  >
                    <Space>
                      <CalendarOutlined />

                      <Title
                        level={4}
                        style={{
                          margin: 0,
                        }}
                      >
                        {event.year}
                      </Title>
                    </Space>

                    <Tag
                      color={
                        event.severityColor
                      }
                    >
                      {event.severity}
                    </Tag>
                  </Space>

                  {/* LOCATION */}

                  <Space>
                    <EnvironmentOutlined
                      style={{
                        color: "#1677ff",
                      }}
                    />

                    <Text>
                      {event.location}
                    </Text>
                  </Space>

                  {/* DESCRIPTION */}

                  <Paragraph
                    type="secondary"
                    ellipsis={{
                      rows: 3,
                    }}
                    style={{
                      marginBottom: 4,
                    }}
                  >
                    {event.description}
                  </Paragraph>

                  {/* SUMMARY */}

                  <Row gutter={[12, 12]}>
                    <Col span={12}>
                      <Card
                        size="small"
                        style={{
                          background: "#fafafa",
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          Maximum Water Level
                        </Text>

                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: 4,
                          }}
                        >
                          <RiseOutlined />{" "}
                          {event.maximumWaterLevel}
                        </div>
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card
                        size="small"
                        style={{
                          background: "#fafafa",
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          Rainfall
                        </Text>

                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: 4,
                          }}
                        >
                          <CloudOutlined />{" "}
                          {event.rainfall}
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* BUTTON */}

                  <Button
                    type="primary"
                    block
                    icon={<FileTextOutlined />}
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    View Flood Event
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* =====================================================
          EVENT DETAILS MODAL
      ===================================================== */}

      <Modal
        open={Boolean(selectedEvent)}
        onCancel={() =>
          setSelectedEvent(null)
        }
        footer={null}
        width={850}
        title={
          selectedEvent
            ? `${selectedEvent.year} Flood Event`
            : "Historical Flood"
        }
      >
        {selectedEvent && (
          <Space
            direction="vertical"
            size={20}
            style={{
              width: "100%",
            }}
          >
            {/* EVENT IMAGE */}

            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                borderRadius: 10,
              }}
            />

            {/* BASIC INFORMATION */}

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">
                  Year
                </Text>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {selectedEvent.year}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Text type="secondary">
                  Location
                </Text>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {selectedEvent.location}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Text type="secondary">
                  Flood Severity
                </Text>

                <div>
                  <Tag
                    color={
                      selectedEvent.severityColor
                    }
                    style={{
                      marginTop: 5,
                    }}
                  >
                    {selectedEvent.severity}
                  </Tag>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Text type="secondary">
                  Maximum Water Level
                </Text>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {selectedEvent.maximumWaterLevel}
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Text type="secondary">
                  Rainfall
                </Text>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {selectedEvent.rainfall}
                </div>
              </Col>
            </Row>

            <Divider />

            {/* AFFECTED AREAS */}

            <div>
              <Title
                level={5}
                style={{
                  marginBottom: 10,
                }}
              >
                Affected Areas
              </Title>

              <Space wrap>
                {selectedEvent.affectedAreas.map(
                  (area) => (
                    <Tag
                      key={area}
                      icon={
                        <EnvironmentOutlined />
                      }
                    >
                      {area}
                    </Tag>
                  )
                )}
              </Space>
            </div>

            {/* DESCRIPTION */}

            <div>
              <Title
                level={5}
                style={{
                  marginBottom: 8,
                }}
              >
                About This Flood
              </Title>

              <Paragraph>
                {selectedEvent.description}
              </Paragraph>
            </div>

            {/* FLOOD MAP PLACEHOLDER */}

            <div>
              <Title
                level={5}
                style={{
                  marginBottom: 10,
                }}
              >
                Flood Map
              </Title>

              <div
                style={{
                  height: 240,
                  borderRadius: 10,
                  background: "#eef2f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#8c8c8c",
                }}
              >
                <GlobalOutlined
                  style={{
                    fontSize: 34,
                    marginBottom: 8,
                  }}
                />

                <Text type="secondary">
                  Historical flood extent map
                </Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  Map data will be connected later
                </Text>
              </div>
            </div>

            {/* RESEARCH */}

            <div>
              <Title
                level={5}
                style={{
                  marginBottom: 8,
                }}
              >
                Research / Information
              </Title>

              <Paragraph>
                {selectedEvent.research}
              </Paragraph>

              <Button
                icon={<FileTextOutlined />}
              >
                View Research Information
              </Button>
            </div>

            {/* IMAGES */}

            <div>
              <Title
                level={5}
                style={{
                  marginBottom: 10,
                }}
              >
                Images
              </Title>

              <Button
                icon={<PictureOutlined />}
              >
                View Event Images
              </Button>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default HistoricalFloods;