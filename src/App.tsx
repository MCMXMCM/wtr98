import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "./App.css";
import "98.css";
import { Points, Position } from "./types/global";
import OneWeekForecast from "./components/oneweek/OneWeek";
import HourlyForecast from "./components/hourly/Hourly";
import Player from "./components/AudioPlayer";
import SplashPage from "./components/SplashPage";
import { GlobalContext } from "./context/GlobalProvider";
import InfiniteMarquee from "./components/Marquee";
import Wind from "./components/wind/Wind";
import Additional from "./components/additional/Additional";
import Banner from "./components/banner/Banner";

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
    data: hourlyForecastData,
    refetch: hourlyRefetch,
  } = useQuery({
    queryKey: ["hourlyForecastData", pointsRefetch],
    enabled: !!points.forecastHourlyUrl,
    queryFn: () =>
      fetch(points.forecastHourlyUrl).then((res) => {
        setLastQueryTime(dayjs().format("hh:mm a"));
        return res.json();
      }),
  });

  const { data: forecastData, refetch: dailyRefetch } = useQuery({
    queryKey: ["dailyForecast"],
    enabled: !!points.forecastUrl,
    queryFn: () => fetch(points.forecastUrl).then((res) => res.json()),
  });

  function getCurrentPosition() {
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

  function onCurrentLocationSelect() {
    setUseCurrentLocation(true);
    getCurrentPosition();
  }

  function refresh() {
    if (useCurrentLocation) {
      getCurrentPosition();
    }
    hourlyRefetch();
    dailyRefetch();
  }

  const loaded = !!points.city || !pointsIsPending || !pointsFetching;

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
        hourlyFetching,
        loaded,
        refresh,
        onCurrentLocationSelect,
      }}
    >
      <div className="main-app-div">
        {hourlyPending ? (
          <SplashPage onCurrentLocationSelect={onCurrentLocationSelect} />
        ) : (
          <div
            style={{
              maxWidth: "1200px",
            }}
          >
            <div className="window">
              <InfiniteMarquee
                text={forecastData?.properties?.periods[0]?.detailedForecast}
              />
              <Banner hourlyForecastData={hourlyForecastData} />
            </div>
            <HourlyForecast data={hourlyForecastData} />

            <div className="grid-container">
              <OneWeekForecast forecastData={forecastData} />
              <Wind forecastData={forecastData} />
              <Additional
                forecastData={forecastData}
                hourlyForecastData={hourlyForecastData}
              />
            </div>

            <div
              className="window"
              style={{ position: "sticky", bottom: 0, left: 0 }}
            >
              <Player />
            </div>
          </div>
        )}
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
