import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "./App.css";
import "98.css";
import { Position } from "./types/global";
import OneWeekForecast from "./components/oneweek/OneWeek";
import HourlyForecast from "./components/hourly/Hourly";
import { Tile } from "./components/ProgressBar";
import MapChart from "./components/map/Map";
import { getIcon } from "./helpers/global";

interface Points {
  forecastUrl: string;
  forecastHourlyUrl: string;
  forecastGridDataUrl: string;
  city: string;
  state: string;
}

function App() {
  const [lastQueryTime, setLastQueryTime] = useState("");

  const [position, setPosition] = useState<Position>({
    latitude: 0,
    longitude: 0,
  });

  const [positionError, setPositionError] = useState<string | null>(null);
  if (positionError) {
    console.log(positionError);
  }
  const {
    isPending: pointsIsPending,
    error: pointsError,
    data: pointsData,
  } = useQuery({
    staleTime: 5 * 6000,
    queryKey: ["getPoints"],
    enabled: !!position.latitude && !!position.longitude,
    queryFn: () =>
      fetch(
        `https://api.weather.gov/points/${position.latitude},${position.longitude}`
      ).then((res) => {
        return res.json();
      }),
  });

  const points: Points = {
    forecastUrl: pointsData?.properties?.forecast,
    forecastHourlyUrl: pointsData?.properties?.forecastHourly,
    forecastGridDataUrl: pointsData?.properties?.forecastGridData,
    city: pointsData?.properties?.relativeLocation?.properties?.city,
    state: pointsData?.properties?.relativeLocation?.properties?.state,
  };

  const {
    isPending: hourlyPending,
    isFetching: hourlyFetching,
    error: hourlyError,
    data: hourlyForecastData,
    refetch: hourlyRefetch,
  } = useQuery({
    queryKey: ["hourlyForecastData"],
    staleTime: 5 * 6000,
    enabled: !!points.forecastHourlyUrl,
    queryFn: () =>
      fetch(points.forecastHourlyUrl).then((res) => {
        setLastQueryTime(dayjs().format("hh:mm a"));
        return res.json();
      }),
  });

  const {
    isPending: forecastPending,
    error: forecastError,
    data: forecastData,
    refetch: dailyRefetch,
  } = useQuery({
    queryKey: ["dailyForecast"],
    enabled: !!points.forecastUrl,
    staleTime: 5 * 6000,
    queryFn: () => fetch(points.forecastUrl).then((res) => res.json()),
  });

  useEffect(() => {
    const getCurrentPosition = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition({ latitude, longitude });
          },
          (err) => {
            setPositionError(err.message);
          }
        );
      } else {
        setPositionError("Geolocation is not supported by this browser.");
      }
    };

    getCurrentPosition();
  }, []);

  if (hourlyPending || pointsIsPending)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "95vh",
          width: "95vw",
          flexDirection: "column",
        }}
      >
        <div className="window">
          <div className="title-bar" style={{ marginBottom: "18px" }}>
            <div className="title-bar-text">
              <h4 style={{ letterSpacing: 1.4 }}>WEATHER 98 - Version 1</h4>
            </div>
          </div>
          <Tile />
          {positionError ? (
            <div className="field-row" style={{ marginTop: "18px" }}>
              <p
                style={{
                  fontSize: "18px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {`${positionError} -- if you're on mobile, make sure your current browser
             has permission to use location services while in use.`}
              </p>
            </div>
          ) : (
            <div className="field-row" style={{ marginTop: "18px" }}>
              <p
                style={{
                  fontSize: "22px",
                  textAlign: "center",
                  padding: "18px",
                }}
              >
                loading weather for your current location...
              </p>
            </div>
          )}
        </div>
      </div>
    );

  if (hourlyError) return "An error has occurred: " + hourlyError.message;

  if (pointsError) return "An error has occurred: " + pointsError.message;

  function updatePosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ latitude, longitude });
        },
        (err) => {
          setPositionError(err.message);
        }
      );
    } else {
      setPositionError("Geolocation is not supported by this browser.");
    }
  }

  function refresh() {
    hourlyRefetch();
    dailyRefetch();
    updatePosition();
  }

  return (
    <div className="main-container">
      <div style={{ height: "100%" }}>
        <div>
          <div className="window" style={{ width: "99.4%" }}>
            <div
              className="field-column"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <h4 style={{ marginBottom: 0 }}>{points.city}</h4>
              <h4 style={{ marginTop: 0, marginBottom: 0 }}>
                {hourlyForecastData?.properties?.periods[0]?.temperature}°
              </h4>
              <h4 style={{ marginTop: 0, marginBottom: 0 }}>
                {hourlyForecastData?.properties?.periods[0]?.shortForecast}
              </h4>
              {/* <h4 style={{ marginTop: 0, marginBottom: 0 }}>H:94° L:74°</h4> */}
              <div className="window-body">
                <div
                  className="field-column"
                  style={{
                    width: "250px",
                    display: "flex",
                    alignContent: "space-between",
                    justifyContent: "center",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <button style={{ margin: "4px" }} onClick={refresh}>
                    Refresh
                  </button>

                  {`Last refreshed: ${lastQueryTime} ${
                    hourlyFetching ? "refreshing now ..." : ""
                  }`}
                </div>
                {/* <div style={{ width: "250px" }}>
                {positionError ? (
                  <p>Error: {positionError}</p>
                ) : (
                  <p>
                    Latitude: {position.latitude}, Longitude:{" "}
                    {position.longitude}
                  </p>
                )}
              </div> */}
              </div>
            </div>
          </div>
        </div>
        <HourlyForecast
          data={hourlyForecastData}
          currentDetailed={
            forecastData?.properties?.periods[0]?.detailedForecast
          }
        />
        <div className="boxes-container">
          <div className="one-week-forecast">
            <OneWeekForecast
              forecastPending={forecastPending}
              forecastError={forecastError}
              forecastData={forecastData}
            />
            {/* <div
              style={{
                width: "100%",
                height: "19%",
              }}
              className="window"
            >
              <div className="title-bar">
                <div className="title-bar-text">Waning Crescent</div>
              </div>
              <div className="window-body">Moon phase stuff</div>
            </div> */}
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "100%",
              margin: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="window" style={{ height: "100%" }}>
              <div className="title-bar">
                <div className="title-bar-text">Map</div>
              </div>
              <div className="window-body">
                {position.latitude && position.longitude ? (
                  <MapChart
                    cityName={points.city}
                    coords={position}
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

            {/* <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">UV Index</div>
                </div>
                <div className="window-body">UV Stuff</div>
              </div>
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Sunrise</div>
                </div>
                <div className="window-body">Sunrise Stuff</div>
              </div>
            </div> */}
            {/* <div className="window" style={{ height: "20%" }}>
              <div className="title-bar">
                <div className="title-bar-text">Air Quality</div>
              </div>
              <div className="window-body">Air Quality stuff</div>
            </div> */}

            {/* <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                height: "20%",
              }}
            >
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Relative Humidity</div>
                </div>
                <div className="window-body">
                  <p
                    style={{
                      fontSize: "22px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {
                      hourlyForecastData?.properties?.periods[0]
                        ?.relativeHumidity?.value
                    }
                    %
                  </p>
                </div>
              </div>
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Visibility</div>
                </div>
                <div className="window-body">Visibility Stuff</div>
              </div>
            </div> */}
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "100%",
              margin: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="window" style={{ height: "40%" }}>
              <div className="title-bar">
                <div className="title-bar-text">Wind</div>
              </div>
              <div className="window-body">
                <div
                  className="field-row"
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <p style={{ fontSize: "22px" }}>
                    {forecastData?.properties?.periods[0]?.windSpeed}
                  </p>
                  <p style={{ fontSize: "22px" }}>
                    {forecastData?.properties?.periods[0]?.windDirection}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                height: "40%",
              }}
            >
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Chance of Rain</div>
                </div>
                <div className="window-body">
                  <p
                    style={{
                      fontSize: "22px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {
                      hourlyForecastData?.properties?.periods[0]
                        ?.probabilityOfPrecipitation?.value
                    }
                    %
                  </p>
                </div>
              </div>
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Relative Humidity</div>
                </div>
                <div className="window-body">
                  <p
                    style={{
                      fontSize: "22px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {
                      hourlyForecastData?.properties?.periods[0]
                        ?.relativeHumidity?.value
                    }
                    %
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="window" style={{ height: "47%" }}>
              <div className="title-bar">
                <div className="title-bar-text">Map</div>
              </div>
              <div className="window-body">
                {position.latitude && position.longitude ? (
                  <MapChart
                    cityName={points.city}
                    coords={position}
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

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                height: "20%",
              }}
            >
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Feels Like</div>
                </div>
                <div className="window-body">Feels Like Stuff</div>
              </div>
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Chance of Rain</div>
                </div>
                <div className="window-body">
                  <p
                    style={{
                      fontSize: "22px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {
                      hourlyForecastData?.properties?.periods[0]
                        ?.probabilityOfPrecipitation?.value
                    }
                    %
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                height: "20%",
              }}
            >
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Feels Like</div>
                </div>
                <div className="window-body">Feels Like Stuff</div>
              </div>
              <div className="window" style={{ width: "45%" }}>
                <div className="title-bar">
                  <div className="title-bar-text">Averages</div>
                </div>
                <div className="window-body">Averages Stuff</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
