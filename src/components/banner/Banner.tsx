import { Hourglass } from "react95";
import { useGlobalContext } from "../../hooks/GlobalHooks";
import { getIcon } from "../../helpers/global";
import { WeatherForecastHourly } from "../../types/global";
import CitySelector from "../CitySelector";
import MapChart from "../map/Map";

export default function Banner({
  hourlyForecastData,
}: {
  hourlyForecastData: WeatherForecastHourly;
}) {
  const {
    positionError,
    specificCity,
    loaded,
    lastQueryTime,
    hourlyFetching,
    refresh,
    useCurrentLocation,
    onCurrentLocationSelect,
    position,
  } = useGlobalContext();
  return (
    <div className="banner">
      {loaded ? (
        <div className="child-div">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4
              style={{
                marginTop: 15,
                marginBottom: 0,
              }}
            >
              {specificCity}
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                columnGap: "5%",
                width: "50%",
                justifyContent: "center",
              }}
            >
              <div className="grandchild-div">
                <div>
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                      fontSize: "33px",
                    }}
                  >
                    {hourlyForecastData?.properties?.periods[0]?.temperature}°
                  </h4>
                </div>
              </div>
              <div className="grandchild-div">
                <img
                  style={{ height: "70px", maxWidth: "110px" }}
                  src={`/${getIcon(
                    hourlyForecastData?.properties?.periods[0]?.isDaytime,
                    hourlyForecastData?.properties?.periods[0]?.shortForecast
                  )}.gif`}
                />
              </div>
            </div>

            <div className="short-description">
              <p style={{ marginBottom: 0, marginTop: 0 }}>
                {hourlyForecastData?.properties?.periods[0]?.shortForecast}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "33%",
            height: "100%",
            minHeight: "150px",
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            margin: "8px",
          }}
        >
          <Hourglass size={50} style={{ margin: 20 }} />
        </div>
      )}

      <div className="child-div">
        <div
          style={{
            display: "flex",
            alignContent: "space-between",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <button
            style={{
              marginBottom: "4px",
              fontSize: "16px",
              height: "30px",
              width: "100%",
              cursor: "pointer",
            }}
            onClick={() => refresh()}
          >
            Refresh ({" "}
            {`Refreshed at: ${lastQueryTime} ${
              hourlyFetching ? "Refreshing ..." : ""
            }`}
            )
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              columnGap: "2%",
              width: "100%",
            }}
          >
            <div
              style={{
                textAlign: "center",
                display: "flex",
                alignContent: "end",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                disabled={useCurrentLocation}
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => onCurrentLocationSelect()}
              >
                {positionError ? positionError : "Use Current Location"}
              </button>
            </div>
            <div className="window">
              <CitySelector />
            </div>
          </div>
        </div>
      </div>

      <div className="child-div">
        <div className="window-body">
          {position.latitude && position.longitude ? (
            <MapChart
              cityName={specificCity}
              coords={position}
              temp={hourlyForecastData?.properties?.periods[0]?.temperature}
              currentIconName={getIcon(
                hourlyForecastData?.properties?.periods[0]?.isDaytime,
                hourlyForecastData?.properties?.periods[0]?.shortForecast
              )}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
