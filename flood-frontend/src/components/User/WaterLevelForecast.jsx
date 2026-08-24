import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const WaterLevelForecast = () => {
  const forecast = [
    { time: "Now", level: 4.2 },
    { time: "+1h", level: 4.3 },
    { time: "+2h", level: 4.5 },
    { time: "+3h", level: 4.7 },
    { time: "+4h", level: 4.8 },
    { time: "+5h", level: 4.6 },
  ];

  const max = 5.5;

  return (
    <Card
      style={{
        borderRadius: 14,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
          }}
        >
          Water Level Forecast
        </Title>

        <Text type="secondary">
          Predicted water level for the next 5 hours
        </Text>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 18,
          height: 230,
          padding: "20px 10px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {forecast.map((item) => {
          const height = (item.level / max) * 180;

          return (
            <div
              key={item.time}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text
                strong
                style={{
                  marginBottom: 6,
                }}
              >
                {item.level}m
              </Text>

              <div
                style={{
                  width: "60%",
                  maxWidth: 55,
                  height,
                  minHeight: 20,
                  borderRadius: "8px 8px 0 0",
                  background:
                    "linear-gradient(to top, #1677ff, #69b1ff)",
                  transition: "height 0.3s",
                }}
              />

              <Text
                type="secondary"
                style={{
                  marginTop: 8,
                  fontSize: 12,
                }}
              >
                {item.time}
              </Text>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "#f6ffed",
          borderRadius: 8,
        }}
      >
        <Text>
          Expected peak: <strong>4.8 m</strong> in approximately 4 hours.
        </Text>
      </div>
    </Card>
  );
};

export default WaterLevelForecast;