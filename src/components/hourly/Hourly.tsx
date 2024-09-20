import { useGlobalContext } from "../../hooks/GlobalHooks";
import { WeatherForecastHourly } from "../../types/global";
import { Tile } from "../ProgressBar";
import HourlyRowIcon from "./HourlyRowIcon";

export default function HourlyForecast({
  data,
}: {
  data: WeatherForecastHourly;
}) {
  const { specificCity, pointsIsPending, pointsFetching } = useGlobalContext();

  return (
    <div className="window hourly-forecast">
      <div className="title-bar">
        <div className="title-bar-text">Hourly Forecast</div>
      </div>

      {specificCity || !pointsIsPending || !pointsFetching ? (
        <>
          {" "}
          <div className="window-body">
            <div
              className="field-row"
              style={{
                height: "145px",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {data?.properties?.periods.map((period) => (
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
      ) : (
        <div
          style={{
            height: "145px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Tile />
          <p style={{ fontSize: "16px" }}>Loading hourly forecast... </p>
        </div>
      )}
    </div>
  );
}
