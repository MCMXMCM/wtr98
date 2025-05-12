import Attributions from "../Attributions";
import { useWeather } from "../../hooks/use-points";

export default function Additional() {
  const { weekly, hourly } = useWeather();

  return (
    <div style={{ height: "102%" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            className="window"
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              width: "48%",
            }}
          >
            <div className="title-bar">
              <div className="title-bar-text">Chance of Precipitation</div>
            </div>
            <div
              style={{
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {weekly?.properties?.periods[0]?.probabilityOfPrecipitation
                  ?.value
                  ? `${weekly?.properties?.periods[0]?.probabilityOfPrecipitation?.value}%
                    `
                  : "0%"}
              </p>
            </div>
          </div>

          <div
            className="window"
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              width: "48%",
            }}
          >
            <div className="title-bar">
              <div className="title-bar-text">Relative Humidity</div>
            </div>
            <div
              style={{
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {hourly?.properties?.periods[0]?.relativeHumidity?.value
                  ? `${hourly?.properties?.periods[0]?.relativeHumidity?.value}%
                    `
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
        <Attributions />
      </div>
    </div>
  );
}
