import dayjs from "dayjs";
import { getIcon } from "../../helpers/global";
import { WeatherForecast } from "../../types/global";

export default function HourlyRowIcon({ period }: { period: WeatherForecast }) {
  const icon = getIcon(period.isDaytime, period.shortForecast);

  return (
    <div
      className="field-column"
      style={{
        height: "90px",
        width: "90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <p>{dayjs(period.startTime).format("h a")}</p>
      <div style={{ height: "35%" }}>
        <img style={{ height: "40px", width: "40px" }} src={`/${icon}.gif`} />
      </div>
      <p style={{ fontSize: "12px" }}>{period.temperature}°</p>
    </div>
  );
}
