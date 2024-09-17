import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "./App.css";
import "98.css";
import { Position } from "./types/global";
import OneWeekForecast from "./components/oneweek/OneWeek";
import HourlyForecast from "./components/hourly/Hourly";
import MapChart from "./components/map/Map";
import { getIcon } from "./helpers/global";
import Player from "./components/AudioPlayer";
import CitySelector from "./components/CitySelector";
import SplashPage from "./components/SplashPage";
import { GlobalContext } from "./context/GlobalProvider";

interface Points {
  forecastUrl: string;
  forecastHourlyUrl: string;
  forecastGridDataUrl: string;
  city: string;
  state: string;
}

function App() {
  const [lastQueryTime, setLastQueryTime] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const [position, setPosition] = useState<Position>({
    latitude: 0,
    longitude: 0,
  });

  const [positionError, setPositionError] = useState<string | null>(null);
  if (positionError) {
    console.log(positionError);
  }

  const {
    // isPending: pointsIsPending,
    error: pointsError,
    data: pointsData,
    refetch: pointsRefetch,
  } = useQuery({
    queryKey: ["getPoints", position, selectedCity],
    enabled: !!position.latitude && !!position.longitude,
    queryFn: () =>
      fetch(
        `https://api.weather.gov/points/${position.latitude},${position.longitude}`
      ).then((res) => {
        setLastQueryTime(dayjs().format("hh:mm a"));
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
    // refetch: hourlyRefetch,
  } = useQuery({
    queryKey: ["hourlyForecastData"],
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
    // refetch: dailyRefetch,
  } = useQuery({
    queryKey: ["dailyForecast"],
    enabled: !!points.forecastUrl,
    queryFn: () => fetch(points.forecastUrl).then((res) => res.json()),
  });

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

  function onCurrentLocationSelect() {
    setUseCurrentLocation(true);
    getCurrentPosition();
  }

  if (hourlyError) alert("An error has occurred: " + hourlyError.message);

  if (pointsError) alert("An error has occurred: " + pointsError.message);

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
    if (useCurrentLocation) {
      updatePosition();
    }
    pointsRefetch();
  }

  return (
    <GlobalContext.Provider
      value={{
        lastQueryTime,
        setLastQueryTime,
        useCurrentLocation,
        setUseCurrentLocation,
        selectedCity,
        setSelectedCity,
        setPosition,
        position,
        setPositionError,
        positionError,
      }}
    >
      <>
        {hourlyPending ? (
          <SplashPage onCurrentLocationSelect={onCurrentLocationSelect} />
        ) : (
          <div
            style={
              {
                // display: "flex",
                // justifyContent: "center",
                // alignItems: "center",
                // height: "100vh",
                // width: "100%",
                // margin: "18px",
                // flexDirection: "column",
              }
            }
          >
            <div
              className="window"
              style={{
                width: "100%",
                // maxWidth: "1200px",
              }}
            >
              <div
                className="field-column"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignContent: "center",
                    alignItems: "center",
                    columnGap: "2%",
                    width: "100%",
                    maxWidth: "400px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "48%",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      padding: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: 0 }}>{points.city}</h4>
                    <h4 style={{ marginTop: 0, marginBottom: 0 }}>
                      {hourlyForecastData?.properties?.periods[0]?.temperature}°
                    </h4>
                  </div>
                  <div
                    style={{
                      width: "48%",
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      style={{ height: "70px", width: "70px" }}
                      src={`/${getIcon(
                        hourlyForecastData?.properties?.periods[0]?.isDaytime,
                        hourlyForecastData?.properties?.periods[0]
                          ?.shortForecast
                      )}.gif`}
                    />
                  </div>
                </div>
                <div>
                  <h4 style={{ marginTop: 0, marginBottom: 0 }}>
                    {hourlyForecastData?.properties?.periods[0]?.shortForecast}
                  </h4>
                </div>

                {/* <h4 style={{ marginTop: 0, marginBottom: 0 }}>H:94° L:74°</h4> */}
                <div className="window-body">
                  <div
                    className="field-column"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignContent: "space-between",
                      justifyContent: "center",
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                  >
                    <button
                      style={{
                        width: "100%",
                        marginBottom: "4px",
                        fontSize: "16px",
                        height: "30px",
                      }}
                      onClick={refresh}
                    >
                      Refresh
                    </button>
                    <label
                      style={{
                        width: "100%",
                        fontSize: "16px",
                        margin: 0,
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {`Refreshed at: ${lastQueryTime} ${
                        hourlyFetching ? "Refreshing ..." : ""
                      }`}
                    </label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      columnGap: "2%",
                      width: "100%",
                    }}
                  >
                    <div
                      className="window"
                      style={{
                        width: "48%",
                        textAlign: "center",
                        display: "flex",
                        alignContent: "end",
                      }}
                    >
                      {useCurrentLocation ? (
                        <div
                          className="field-column"
                          style={{
                            fontSize: "16px",
                            marginBottom: "8px",
                            marginTop: 0,
                            textAlign: "center",
                          }}
                        >
                          using current location*
                        </div>
                      ) : (
                        <button
                          style={{
                            width: "100%",
                            // height: "30px",
                            fontSize: "16px",
                            // marginTop: "8px",
                          }}
                          onClick={() => onCurrentLocationSelect()}
                        >
                          Use Current Location
                        </button>
                      )}
                    </div>
                    <div className="window" style={{ width: "48%" }}>
                      <CitySelector
                        setPosition={setPosition}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        setUseCurrentLocation={setUseCurrentLocation}
                      />
                    </div>
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
            <HourlyForecast
              data={hourlyForecastData}
              currentDetailed={
                forecastData?.properties?.periods[0]?.detailedForecast
              }
            />
            <div className="grid-container">
              <div>
                <OneWeekForecast
                  forecastPending={forecastPending}
                  forecastError={forecastError}
                  forecastData={forecastData}
                />
              </div>
              <div>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
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
                            hourlyForecastData?.properties?.periods[0]
                              ?.isDaytime,
                            hourlyForecastData?.properties?.periods[0]
                              ?.shortForecast
                          )}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="window" style={{ height: "50%" }}>
                    <div className="title-bar">
                      <div className="title-bar-text">Wind</div>
                    </div>
                    <div
                      className="window-body"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="field-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                          alignContent: "center",
                          width: "80%",
                        }}
                      >
                        <div
                          className="status-bar-field"
                          style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            alignItems: "center",
                          }}
                        >
                          <p style={{ fontSize: "22px" }}>
                            {forecastData?.properties?.periods[0]?.windSpeed}
                          </p>
                          <p style={{ fontSize: "22px" }}>
                            {
                              forecastData?.properties?.periods[0]
                                ?.windDirection
                            }
                          </p>
                        </div>
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
                    <div
                      className="window"
                      style={{ width: "45%", height: "100%" }}
                    >
                      <div className="title-bar">
                        <div className="title-bar-text">Chance of Rain</div>
                      </div>
                      <div className="window-body" style={{ height: "100%" }}>
                        <div
                          className="status-bar-field"
                          style={{
                            fontSize: "14px",
                            display: "flex",
                            justifyContent: "center",
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
                    </div>
                    <div
                      className="window"
                      style={{ width: "45%", height: "100%" }}
                    >
                      <div className="title-bar">
                        <div className="title-bar-text">Relative Humidity</div>
                      </div>
                      <div className="window-body">
                        <div
                          className="status-bar-field"
                          style={{
                            fontSize: "14px",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <p style={{ fontWeight: "bold" }}>
                            {
                              hourlyForecastData?.properties?.periods[0]
                                ?.relativeHumidity?.value
                            }
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="window"
              style={{ position: "sticky", bottom: 0, left: 0 }}
            >
              <Player />
            </div>
          </div>
        )}
      </>
    </GlobalContext.Provider>
  );
}

export default App;
