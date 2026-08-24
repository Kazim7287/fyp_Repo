import { useMemo, useState } from "react";

import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Upload,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Empty,
  Tooltip,
  Popconfirm,
  Image,
  Divider,
  Statistic,
  Badge,
} from "antd";

import {
  UploadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileOutlined,
  PictureOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/* =========================================================
   PROTOTYPE MEDIA DATA
========================================================= */

const initialMedia = [
  {
    id: 1,
    name: "flood-safety-banner.jpg",
    title: "Flood Safety Banner",
    type: "Image",
    category: "Awareness Graphics",
    size: 2.4,
    extension: "JPG",
    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5",
    date: "2026-08-18",
  },

  {
    id: 2,
    name: "flood-monitoring-map.jpg",
    title: "Flood Monitoring Map",
    type: "Image",
    category: "Maps",
    size: 3.8,
    extension: "JPG",
    url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
    date: "2026-08-16",
  },

  {
    id: 3,
    name: "flood-research-2026.pdf",
    title: "Flood Research 2026",
    type: "PDF",
    category: "Research",
    size: 4.7,
    extension: "PDF",
    url: "",
    date: "2026-08-15",
  },

  {
    id: 4,
    name: "community-awareness.png",
    title: "Community Flood Awareness",
    type: "Image",
    category: "Awareness Graphics",
    size: 1.8,
    extension: "PNG",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    date: "2026-08-12",
  },

  {
    id: 5,
    name: "hydrology-study.pdf",
    title: "Hydrology Study",
    type: "PDF",
    category: "Research",
    size: 6.2,
    extension: "PDF",
    url: "",
    date: "2026-08-10",
  },
];

/* =========================================================
   FILE ICON
========================================================= */

const getFileIcon = (type) => {
  if (type === "Image") {
    return <FileImageOutlined />;
  }

  if (type === "PDF") {
    return <FilePdfOutlined />;
  }

  if (type === "Document") {
    return <FileTextOutlined />;
  }

  return <FileOutlined />;
};

/* =========================================================
   FILE TYPE
========================================================= */

const detectFileType = (file) => {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      extension
    )
  ) {
    return "Image";
  }

  if (extension === "pdf") {
    return "PDF";
  }

  if (
    ["doc", "docx", "txt"].includes(
      extension
    )
  ) {
    return "Document";
  }

  return "Other";
};

/* =========================================================
   COMPONENT
========================================================= */

const MediaLibrary = () => {
  const [media, setMedia] =
    useState(initialMedia);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [previewMedia, setPreviewMedia] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalFiles = media.length;

  const imageFiles = media.filter(
    (item) =>
      item.type === "Image"
  ).length;

  const pdfFiles = media.filter(
    (item) =>
      item.type === "PDF"
  ).length;

  const totalStorage = media.reduce(
    (total, item) =>
      total + Number(item.size || 0),
    0
  );

  /* =======================================================
     FILTER MEDIA
  ======================================================= */

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const query =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(query) ||
        item.title
          .toLowerCase()
          .includes(query) ||
        item.category
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        item.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        item.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    media,
    search,
    typeFilter,
    categoryFilter,
  ]);

  /* =======================================================
     UPLOAD
  ======================================================= */

  const handleUpload = ({
    fileList,
  }) => {
    if (!fileList?.length) {
      return;
    }

    setUploading(true);

    setTimeout(() => {
      const uploadedFiles =
        fileList.map((item) => {
          const file =
            item.originFileObj;

          const type =
            detectFileType(file);

          const size =
            file.size /
            1024 /
            1024;

          const url =
            type === "Image"
              ? URL.createObjectURL(file)
              : "";

          return {
            id:
              Date.now() +
              Math.random(),

            name: file.name,

            title:
              file.name.replace(
                /\.[^/.]+$/,
                ""
              ),

            type,

            category:
              type === "PDF"
                ? "Research"
                : type === "Image"
                ? "Awareness Graphics"
                : "Other",

            size:
              Number(size.toFixed(2)),

            extension:
              file.name
                .split(".")
                .pop()
                .toUpperCase(),

            url,

            file,

            date:
              new Date()
                .toISOString()
                .split("T")[0],
          };
        });

      setMedia((previous) => [
        ...uploadedFiles,
        ...previous,
      ]);

      setUploading(false);

      message.success(
        `${uploadedFiles.length} file${
          uploadedFiles.length > 1
            ? "s"
            : ""
        } uploaded successfully.`
      );
    }, 700);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {
    setMedia((previous) =>
      previous.filter(
        (item) =>
          item.id !== id
      )
    );

    message.success(
      "Media deleted successfully."
    );
  };

  /* =======================================================
     COPY URL
  ======================================================= */

  const handleCopyUrl = async (
    url
  ) => {
    if (!url) {
      message.warning(
        "This file does not have a public URL yet."
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(
        url
      );

      message.success(
        "Media URL copied."
      );
    } catch {
      message.error(
        "Unable to copy URL."
      );
    }
  };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const handleDownload = (
    item
  ) => {
    if (!item.url) {
      message.warning(
        "Download URL is not available yet."
      );

      return;
    }

    const link =
      document.createElement(
        "a"
      );

    link.href = item.url;
    link.download = item.name;
    link.target = "_blank";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  };

  /* =======================================================
     UPLOAD PROPS
  ======================================================= */

  const uploadProps = {
    multiple: true,

    showUploadList: false,

    beforeUpload: () => false,

    accept:
      "image/*,.pdf,.doc,.docx,.txt",

    onChange:
      handleUpload,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >

        <div>
          <Title
            level={3}
            style={{
              marginBottom: 4,
            }}
          >
            Media Library
          </Title>

          <Text type="secondary">
            Manage images, research PDFs,
            maps, awareness graphics, and
            other website media.
          </Text>
        </div>

        <Upload
          {...uploadProps}
        >
          <Button
            type="primary"
            size="large"
            icon={
              <CloudUploadOutlined />
            }
            loading={uploading}
          >
            Upload Media
          </Button>
        </Upload>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

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
              title="Total Files"
              value={totalFiles}
              prefix={
                <DatabaseOutlined />
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
              title="Images"
              value={imageFiles}
              prefix={
                <PictureOutlined />
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
              title="PDF Documents"
              value={pdfFiles}
              prefix={
                <FilePdfOutlined />
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
              title="Storage Used"
              value={totalStorage.toFixed(
                1
              )}
              suffix="MB"
              prefix={
                <DatabaseOutlined />
              }
            />
          </Card>
        </Col>

      </Row>

      {/* =================================================
          MEDIA LIBRARY
      ================================================= */}

      <Card
        title={
          <Space>
            <Badge status="processing" />

            <span>
              Media Files
            </span>

            <Tag>
              {filteredMedia.length}
            </Tag>
          </Space>
        }
      >

        {/* FILTERS */}

        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 24,
          }}
        >

          <Col
            xs={24}
            md={10}
            lg={12}
          >
            <Input
              size="large"
              allowClear
              prefix={
                <SearchOutlined />
              }
              placeholder="Search media..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Select
              size="large"
              style={{
                width: "100%",
              }}
              value={typeFilter}
              onChange={
                setTypeFilter
              }
              options={[
                {
                  value: "all",
                  label:
                    "All File Types",
                },
                {
                  value: "Image",
                  label:
                    "Images",
                },
                {
                  value: "PDF",
                  label:
                    "PDF Documents",
                },
                {
                  value: "Document",
                  label:
                    "Documents",
                },
                {
                  value: "Other",
                  label:
                    "Other",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Select
              size="large"
              style={{
                width: "100%",
              }}
              value={
                categoryFilter
              }
              onChange={
                setCategoryFilter
              }
              options={[
                {
                  value: "all",
                  label:
                    "All Categories",
                },
                {
                  value:
                    "Research",
                  label:
                    "Research",
                },
                {
                  value:
                    "Awareness Graphics",
                  label:
                    "Awareness Graphics",
                },
                {
                  value: "Maps",
                  label:
                    "Maps",
                },
                {
                  value: "Other",
                  label:
                    "Other",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            md={4}
          >
            <Button
              block
              size="large"
              onClick={
                resetFilters
              }
            >
              Reset
            </Button>
          </Col>

        </Row>

        {/* =================================================
            GRID
        ================================================= */}

        {filteredMedia.length ===
        0 ? (
          <Empty
            description="No media files found"
          />
        ) : (
          <Row
            gutter={[
              16,
              16,
            ]}
          >

            {filteredMedia.map(
              (item) => (
                <Col
                  key={item.id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  xl={6}
                >

                  <Card
                    hoverable
                    styles={{
                      body: {
                        padding: 14,
                      },
                    }}
                    cover={
                      item.type ===
                      "Image" &&
                      item.url ? (
                        <div
                          style={{
                            height: 180,
                            overflow:
                              "hidden",
                            background:
                              "#f5f5f5",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          <img
                            src={
                              item.url
                            }
                            alt={
                              item.title
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 180,
                            background:
                              "#f5f5f5",
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize: 52,
                          }}
                        >
                          {
                            getFileIcon(
                              item.type
                            )
                          }

                          <Text
                            type="secondary"
                            style={{
                              fontSize: 14,
                              marginTop: 12,
                            }}
                          >
                            {
                              item.extension
                            }
                          </Text>
                        </div>
                      )
                    }
                  >

                    {/* FILE NAME */}

                    <Tooltip
                      title={
                        item.name
                      }
                    >
                      <Text
                        strong
                        ellipsis
                        style={{
                          display:
                            "block",
                        }}
                      >
                        {
                          item.title
                        }
                      </Text>
                    </Tooltip>

                    {/* METADATA */}

                    <Space
                      wrap
                      size={[
                        4,
                        4,
                      ]}
                      style={{
                        marginTop: 8,
                      }}
                    >
                      <Tag>
                        {
                          item.extension
                        }
                      </Tag>

                      <Tag color="blue">
                        {
                          item.category
                        }
                      </Tag>
                    </Space>

                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {
                          item.size
                        }{" "}
                        MB •{" "}
                        {
                          item.date
                        }
                      </Text>
                    </div>

                    <Divider
                      style={{
                        margin:
                          "12px 0",
                      }}
                    />

                    {/* ACTIONS */}

                    <Space
                      size={4}
                      style={{
                        width:
                          "100%",
                        justifyContent:
                          "space-between",
                      }}
                    >

                      <Tooltip title="Preview">
                        <Button
                          type="text"
                          icon={
                            <EyeOutlined />
                          }
                          onClick={() =>
                            setPreviewMedia(
                              item
                            )
                          }
                        />
                      </Tooltip>

                      <Tooltip title="Copy URL">
                        <Button
                          type="text"
                          icon={
                            <CopyOutlined />
                          }
                          onClick={() =>
                            handleCopyUrl(
                              item.url
                            )
                          }
                        />
                      </Tooltip>

                      <Tooltip title="Download">
                        <Button
                          type="text"
                          icon={
                            <DownloadOutlined />
                          }
                          onClick={() =>
                            handleDownload(
                              item
                            )
                          }
                        />
                      </Tooltip>

                      <Popconfirm
                        title="Delete this media?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{
                          danger:
                            true,
                        }}
                        onConfirm={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        <Tooltip title="Delete">
                          <Button
                            danger
                            type="text"
                            icon={
                              <DeleteOutlined />
                            }
                          />
                        </Tooltip>
                      </Popconfirm>

                    </Space>

                  </Card>

                </Col>
              )
            )}

          </Row>
        )}

      </Card>

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      <Modal
        title="Media Preview"
        open={!!previewMedia}
        onCancel={() =>
          setPreviewMedia(null)
        }
        footer={null}
        width={850}
      >

        {previewMedia && (
          <div>

            {/* IMAGE PREVIEW */}

            {previewMedia.type ===
              "Image" &&
              previewMedia.url && (
                <div
                  style={{
                    textAlign:
                      "center",
                    marginBottom: 24,
                  }}
                >
                  <Image
                    src={
                      previewMedia.url
                    }
                    alt={
                      previewMedia.title
                    }
                    style={{
                      maxHeight: 500,
                      maxWidth:
                        "100%",
                      objectFit:
                        "contain",
                    }}
                  />
                </div>
              )}

            {/* DOCUMENT PREVIEW */}

            {previewMedia.type !==
              "Image" && (
              <div
                style={{
                  height: 300,
                  background:
                    "#f5f5f5",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius: 8,
                }}
              >

                <div
                  style={{
                    fontSize: 64,
                  }}
                >
                  {
                    getFileIcon(
                      previewMedia.type
                    )
                  }
                </div>

                <Title
                  level={4}
                >
                  {
                    previewMedia.name
                  }
                </Title>

                <Text type="secondary">
                  {
                    previewMedia.type
                  }{" "}
                  •{" "}
                  {
                    previewMedia.size
                  }{" "}
                  MB
                </Text>

              </div>
            )}

            {/* DETAILS */}

            <Divider />

            <Row
              gutter={[
                16,
                16,
              ]}
            >

              <Col
                xs={24}
                sm={12}
              >
                <Text type="secondary">
                  File Name
                </Text>

                <br />

                <Text strong>
                  {
                    previewMedia.name
                  }
                </Text>
              </Col>

              <Col
                xs={24}
                sm={12}
              >
                <Text type="secondary">
                  File Type
                </Text>

                <br />

                <Tag>
                  {
                    previewMedia.extension
                  }
                </Tag>
              </Col>

              <Col
                xs={24}
                sm={12}
              >
                <Text type="secondary">
                  Category
                </Text>

                <br />

                <Tag color="blue">
                  {
                    previewMedia.category
                  }
                </Tag>
              </Col>

              <Col
                xs={24}
                sm={12}
              >
                <Text type="secondary">
                  Size
                </Text>

                <br />

                <Text strong>
                  {
                    previewMedia.size
                  }{" "}
                  MB
                </Text>
              </Col>

            </Row>

            <Divider />

            <Space>

              <Button
                icon={
                  <DownloadOutlined />
                }
                onClick={() =>
                  handleDownload(
                    previewMedia
                  )
                }
              >
                Download
              </Button>

              <Button
                icon={
                  <CopyOutlined />
                }
                onClick={() =>
                  handleCopyUrl(
                    previewMedia.url
                  )
                }
              >
                Copy URL
              </Button>

            </Space>

          </div>
        )}

      </Modal>

    </div>
  );
};

export default MediaLibrary;