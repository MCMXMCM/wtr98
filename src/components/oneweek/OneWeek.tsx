import OneWeekRow from "./OneWeekRow";
import { useWeather } from "../../hooks/use-points";

export default function OneWeekForecast() {
  const { weekly } = useWeather();

  return (
    <div className="window">
      <div className="one-week-window ">
        <div className="title-bar">
          <div className="title-bar-text">One-Week Forecast</div>
        </div>

        <div className="window-body ">
          <div className="field-column one-week-forecast-list">
            {weekly?.properties?.periods.map((period) => (
              <div
                key={period.number}
                className="status-bar-field "
                style={{
                  width: "100%",
                  height: "50px",
                }}
              >
                <OneWeekRow period={period} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
