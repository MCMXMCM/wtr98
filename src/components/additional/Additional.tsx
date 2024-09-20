import { Hourglass } from "react95";
import Attributions from "../Attributions";
import { WeatherForecastHourly } from "../../types/global";
import { useGlobalContext } from "../../context/GlobalProvider";

export default function Additional({
  hourlyForecastData,
}: {
  hourlyForecastData: WeatherForecastHourly;
}) {
  const { specificCity, pointsIsPending, pointsFetching } = useGlobalContext();

  return (
    <div>
      {specificCity || !pointsIsPending || !pointsFetching ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              className="window"
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                flexDirection: "column",
                width: "48%",
              }}
            >
              <div className="title-bar">
                <div className="title-bar-text">Chance of Rain</div>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: "bold" }}>
                  {
                    hourlyForecastData?.properties?.periods[0]
                      ?.probabilityOfPrecipitation?.value
                  }
                  %
                </p>
              </div>
            </div>

            <div
              className="window"
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                flexDirection: "column",
                width: "48%",
              }}
            >
              <div className="title-bar">
                <div className="title-bar-text">Relative Humidity</div>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: "bold" }}>
                  {
                    hourlyForecastData?.properties?.periods[0]?.relativeHumidity
                      ?.value
                  }
                  %
                </p>
              </div>
            </div>
          </div>
          <Attributions />
        </div>
      ) : (
        <div
          className="window"
          style={{
            width: "100%",
            height: "350px",
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
