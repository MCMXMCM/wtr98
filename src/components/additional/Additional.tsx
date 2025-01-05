import { Hourglass } from "react95";
import Attributions from "../Attributions";
import { WeatherForecast, WeatherForecastHourly } from "../../types/global";
import { useGlobalContext } from "../../hooks/GlobalHooks";

export default function Additional({
  forecastData,
  hourlyForecastData,
}: {
  hourlyForecastData: WeatherForecastHourly;
  forecastData: { properties: { periods: WeatherForecast[] } };
}) {
  const { loaded } = useGlobalContext();

  return (
    <div style={{ height: "102%" }}>
      {loaded ? (
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
                  {forecastData?.properties?.periods[0]
                    ?.probabilityOfPrecipitation?.value
                    ? `${forecastData?.properties?.periods[0]?.probabilityOfPrecipitation?.value}%
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
                  {hourlyForecastData?.properties?.periods[0]?.relativeHumidity
                    ?.value
                    ? `${hourlyForecastData?.properties?.periods[0]?.relativeHumidity?.value}%
                    `
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <Attributions />
        </div>
      ) : (
        <div
          className="window"
          style={{
            width: "100%",
            height: "350px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Hourglass size={50} style={{ margin: 20 }} />
        </div>
      )}
    </div>
  );
}
