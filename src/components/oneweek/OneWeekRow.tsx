import { getIcon } from "../../helpers/global";
import { WeatherForecast } from "../../types/global";

export default function OneWeekRow({ period }: { period: WeatherForecast }) {
  const icon = getIcon(period.isDaytime, period.shortForecast);
  return (
    <div
      className="field-row"
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div style={{ width: "20%", textAlign: "center" }}>{period.name}</div>
      <img style={{ height: "33px", width: "33px" }} src={`${icon}.gif`} />
      <div style={{ width: "53%" }}>
        <hr
          style={{
            height: "3px",
            opacity: 0.5,
            background:
              "linear-gradient(to right, blue 60%, green 60%, green 80%, yellow 80%, yellow 90%, red 90%, red 100%)",
          }}
        />
        <div style={{ marginLeft: `${period.temperature}%` }}>
          <div className="example">{period.temperature}°</div>
        </div>
      </div>
    </div>
  );
}
