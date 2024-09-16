import dayjs from "dayjs";
import { WeatherForecastHourly } from "../../types/global";
import HourlyRowIcon from "./HourlyRowIcon";

export default function HourlyForecast({
  data,
  currentDetailed,
}: {
  data: WeatherForecastHourly;
  currentDetailed: string;
}) {
  // 2024-09-16T01:00:00-05
  return (
    <div className="window hourly-forecast">
      <div className="title-bar">
        <div className="title-bar-text" style={{ fontSize: "16px" }}>
          {currentDetailed}
        </div>
      </div>

      <div className="window-body">
        <div
          className="field-row"
          style={{
            height: "145px",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {data.properties.periods.map((period) => (
            <div
              className="field-column"
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {dayjs(period.startTime).format("dddd")}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
