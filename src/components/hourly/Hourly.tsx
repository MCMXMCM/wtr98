import HourlyRowIcon from "./HourlyRowIcon";
import { useWeather } from "../../hooks/use-points";
import { Hourglass } from "react95";

export default function HourlyForecast() {
  const { status, hourly } = useWeather();

  return (
    <div className="hourly-forecast">
      <div className="title-bar">
        <div className="title-bar-text">
          {status !== "success" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              Hourly Forecast <Hourglass size={20} />
            </div>
          ) : (
            "Hourly Forecast"
          )}
        </div>
      </div>

      <>
        <div className="window-body">
          <div
            className="field-row"
            style={{
              height: "145px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {hourly?.properties?.periods.map((period) => (
              <div
                key={period.number}
                className="status-bar-field"
                style={{
                  width: "90px",
                  height: "100px",
                }}
              >
                <HourlyRowIcon period={period} />
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}
