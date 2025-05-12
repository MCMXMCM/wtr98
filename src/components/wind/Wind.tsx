import Compass from "../Compass";
import { useWeather } from "../../hooks/use-points";

export default function Wind() {
  const { weekly } = useWeather();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div className="window" style={{ height: "100%" }}>
        <div className="title-bar">
          <div className="title-bar-text">Wind</div>
        </div>

        <div className="window-body" style={{ height: "80%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              className="status-bar-field"
              style={{
                textAlign: "center",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p style={{ fontSize: "22px" }}>Wind Speed</p>
              <p style={{ fontSize: "22px", fontWeight: "bold" }}>
                {weekly?.properties?.periods[0]?.windSpeed}
              </p>
            </div>

            <div
              className="status-bar-field"
              style={{
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Compass
                cardinalDirection={
                  weekly?.properties?.periods[0]?.windDirection
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
