import OneWeekRow from "./OneWeekRow";
import { WeatherForecast } from "../../types/global";
import { useGlobalContext } from "../../hooks/GlobalHooks";
import { Hourglass } from "react95";

export default function OneWeekForecast({
  forecastData,
}: {
  forecastData: { properties: { periods: WeatherForecast[] } };
}) {
  const { loaded } = useGlobalContext();

  return (
    <div className="window one-week-window">
      <div className="title-bar">
        <div className="title-bar-text">One-Week Forecast</div>
      </div>
      {loaded ? (
        <div className="window-body">
          <div className="field-column" style={{ height: "40px" }}>
            {forecastData?.properties?.periods.map(
              (period: WeatherForecast) => (
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
              )
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            minHeight: "350px",
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
