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
import Compass from "./components/Compass";
import Attributions from "./components/Attributions";
import { Hourglass } from "react95";

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
    isPending: pointsIsPending,
    isFetching: pointsFetching,
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
    queryKey: ["hourlyForecastData", pointsRefetch],
    enabled: !!points.forecastHourlyUrl,
    queryFn: () =>
      fetch(points.forecastHourlyUrl).then((res) => {
        setLastQueryTime(dayjs().format("hh:mm a"));
        return res.json();
      }),
  });

  const {
    // isPending: forecastPending,
    // error: forecastError,
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
        specificCity: points.city,
        pointsIsPending,
        pointsFetching,
      }}
    >
      <>
        {hourlyPending ? (
          <SplashPage onCurrentLocationSelect={onCurrentLocationSelect} />
        ) : (
          <div>
            <div
              className="window"
              style={{
                width: "100%",
              }}
            >
              <div className="banner">
                {points.city || !pointsIsPending || !pointsFetching ? (
                  <div
                    className="child-div"
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignContent: "center",
                      alignItems: "center",
                      columnGap: "2%",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          columnGap: "5%",
                          width: "50%",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "49%",
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              alignContent: "center",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <h4
                              style={{
                                marginTop: 0,
                                marginBottom: 0,
                                minWidth: "100px",
                              }}
                            >
                              {points.city}
                            </h4>
                            <div>
                              <h4
                                style={{
                                  marginTop: 0,
                                  marginBottom: 0,
                                  fontSize: "33px",
                                }}
                              >
                                {
                                  hourlyForecastData?.properties?.periods[0]
                                    ?.temperature
                                }
                                °
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            width: "49%",
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
                              hourlyForecastData?.properties?.periods[0]
                                ?.isDaytime,
                              hourlyForecastData?.properties?.periods[0]
                                ?.shortForecast
                            )}.gif`}
                          />
                          <div></div>
                        </div>
                      </div>
                      <p
                        style={{
                          marginTop: 0,
                          marginBottom: 0,
                          fontSize: "22px",
                          padding: "8px",
                          maxHeight: "130px",
                          overflowY: "auto",
                        }}
                      >
                        {forecastData?.properties?.periods[0]?.detailedForecast}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "33%",
                      height: "100%",
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
                  <div>
                    <div
                      className="field-column"
                      style={{
                        width: "98%",
                        margin: "2%",
                        marginLeft: "1%",
                        marginRight: "1%",
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
                        }}
                        onClick={refresh}
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
                          className="window"
                          style={{
                            width: "48%",
                            textAlign: "center",
                            display: "flex",
                            alignContent: "end",
                            justifyContent: "center",
                            alignItems: "center",
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
                                height: "100%",
                                fontSize: "16px",
                              }}
                              onClick={() => onCurrentLocationSelect()}
                            >
                              Use Current Location
                            </button>
                          )}
                        </div>
                        <div className="window" style={{ width: "48%" }}>
                          <CitySelector />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="child-div">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ height: "100%" }}>
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
              </div>
            </div>
            <HourlyForecast data={hourlyForecastData} />
            <div className="grid-container">
              <div>
                <OneWeekForecast forecastData={forecastData} />
              </div>
              <div>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div className="window" style={{ height: "100%" }}>
                    <div className="title-bar" style={{ height: "5%" }}>
                      <div className="title-bar-text">Wind</div>
                    </div>

                    {points.city || !pointsIsPending || !pointsFetching ? (
                      <div
                        className="window-body"
                        style={{
                          height: "88%",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <div
                              className="status-bar-field"
                              style={{
                                textAlign: "center",
                                width: "100%",
                                height: "200px",
                              }}
                            >
                              <p style={{ fontSize: "22px" }}>Wind Speed</p>
                              <p
                                style={{ fontSize: "22px", fontWeight: "bold" }}
                              >
                                {
                                  forecastData?.properties?.periods[0]
                                    ?.windSpeed
                                }
                              </p>
                            </div>

                            <div
                              className="status-bar-field"
                              style={{
                                textAlign: "center",
                                width: "100%",
                                height: "200px",
                              }}
                            >
                              <Compass
                                cardinalDirection={
                                  forecastData?.properties?.periods[0]
                                    ?.windDirection
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Hourglass size={50} style={{ margin: 20 }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="window">
                {points.city || !pointsIsPending || !pointsFetching ? (
                  <div
                    style={{
                      width: "98%",
                      height: "98%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                      padding: "2%",
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
                          <div className="title-bar-text">
                            Relative Humidity
                          </div>
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
                                ?.relativeHumidity?.value
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
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Hourglass size={50} style={{ margin: 20 }} />
                  </div>
                )}
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
