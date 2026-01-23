import OneWeekRow from "./OneWeekRow";
import { useWeather } from "../../hooks/use-points";

export default function OneWeekForecast() {
  const { weekly } = useWeather();

  // Calculate min and max temperatures from all periods
  const periods = weekly?.properties?.periods || [];
  const temperatures = periods.map(p => p.temperature);
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 100;

  return (
    <div className="window">
      <div className="one-week-window ">
        <div className="title-bar">
          <div className="title-bar-text">One-Week Forecast</div>
        </div>

        <div className="window-body ">
          <div className="field-column one-week-forecast-list">
            {periods.map((period, index) => (
              <div
                key={period.number}
                className="status-bar-field "
                style={{
                  width: "100%",
                  height: "50px",
                }}
              >
                <OneWeekRow 
                  period={period} 
                  minTemp={minTemp} 
                  maxTemp={maxTemp}
                  previousTemp={index > 0 ? periods[index - 1].temperature : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
