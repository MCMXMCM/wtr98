import OneWeekRow from "./OneWeekRow";
import { WeatherForecast } from "../../types/global";
import { Tile } from "../ProgressBar";
// import { Tile } from "../ProgressBar";

export default function OneWeekForecast({
  forecastPending,
  forecastError,
  forecastData,
}: {
  forecastPending: boolean;
  forecastError: Error | null;
  forecastData: { properties: { periods: WeatherForecast[] } };
}) {
  if (forecastPending)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "95vh",
          width: "95vw",
          flexDirection: "column",
        }}
      >
        <Tile />
      </div>
    );

  if (forecastError) return "An error has occurred: " + forecastError.message;

  return (
    <div className="window one-week-window">
      <div className="title-bar">
        <div className="title-bar-text">One-Week Forecast</div>
      </div>
      <div className="window-body">
        <div className="field-column" style={{ height: "40px" }}>
          {forecastData.properties.periods.map((period: WeatherForecast) => (
            <div
              key={period.number}
              className="status-bar-field"
              style={{
                width: "98%",
                height: "50px",
              }}
            >
              <OneWeekRow period={period} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
