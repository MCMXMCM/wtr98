import { WeatherForecastHourly } from "../../types/global";
import HourlyRowIcon from "./HourlyRowIcon";

export default function HourlyForecast({
  data,
  currentDetailed,
}: {
  data: WeatherForecastHourly;
  currentDetailed: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        maxHeight: "250px",
      }}
      className="window"
    >
      <div className="title-bar">
        <div className="title-bar-text">{currentDetailed}</div>
      </div>

      <div className="window-body">
        <div
          className="field-row"
          style={{
            height: "130px",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {data.properties.periods.map((period) => (
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
    </div>
  );
}
