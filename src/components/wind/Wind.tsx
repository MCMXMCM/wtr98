import { Hourglass } from "react95";
import { useGlobalContext } from "../../hooks/GlobalHooks";

import { WeatherForecastHourly } from "../../types/global";
import Compass from "../Compass";

export default function Wind({
  forecastData,
}: {
  forecastData: WeatherForecastHourly;
}) {
  const { specificCity, pointsIsPending, pointsFetching } = useGlobalContext();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div className="window" style={{ height: "100%" }}>
        <div className="title-bar" style={{ height: "5%" }}>
          <div className="title-bar-text">Wind</div>
        </div>

        {specificCity || !pointsIsPending || !pointsFetching ? (
          <div
            className="window-body"
            style={{
              height: "88%",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  className="status-bar-field"
                  style={{
                    textAlign: "center",
                    width: "100%",
                    height: "200px",
                  }}
                >
                  <p style={{ fontSize: "22px" }}>Wind Speed</p>
                  <p style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {forecastData?.properties?.periods[0]?.windSpeed}
                  </p>
                </div>

                <div
                  className="status-bar-field"
                  style={{
                    textAlign: "center",
                    width: "100%",
                    height: "200px",
                  }}
                >
                  <Compass
                    cardinalDirection={
                      forecastData?.properties?.periods[0]?.windDirection
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Hourglass size={50} style={{ margin: 20 }} />
          </div>
        )}
      </div>
    </div>
  );
}
