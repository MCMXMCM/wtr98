import { Dispatch, SetStateAction, useState } from "react";

import "./App.css";
import "98.css";
import { Position } from "./types/global";
import OneWeekForecast from "./components/oneweek/OneWeek";
import HourlyForecast from "./components/hourly/Hourly";
import Wind from "./components/wind/Wind";
import Additional from "./components/additional/Additional";
import Banner from "./components/banner/Banner";
import InfiniteMarquee from "./components/Marquee";

function App() {
  const [currentLocation, setCurrentLocation] = useState<boolean>(false);
  const lat = localStorage.getItem("latitude");
  const long = localStorage.getItem("longitude");
  // default to chicago unless localStorage has a position
  const start: Position =
    lat && long
      ? { latitude: Number(lat), longitude: Number(long) }
      : { latitude: 41.8781136, longitude: -87.6297982 };

  if (!lat && !long) {
    localStorage.setItem("latitude", String(start.latitude));
    localStorage.setItem("longitude", String(start.longitude));
  }

  const [position, setPosition] = useState<Position>(start);

  const [positionError, setPositionError] = useState<string | null>(null);
  if (positionError) {
    console.log(positionError);
  }

  function getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          localStorage.setItem("latitude", String(latitude));
          localStorage.setItem("longitude", String(longitude));
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
    setCurrentLocation(true);
    getCurrentPosition();
  }

  function refresh() {
    if (currentLocation) {
      getCurrentPosition();
    }
  }

  return (
    <div
      className="main-app-div"
      style={{
        overflowX: "hidden",
      }}
    >
      <div className="marquee">
        <InfiniteMarquee />
      </div>
      <WeatherPanelsLayout
        currentLocation={currentLocation}
        setCurrentLocation={setCurrentLocation}
        setPosition={setPosition}
        position={position}
        setPositionError={setPositionError}
        positionError={positionError}
        refresh={refresh}
        onCurrentLocationSelect={onCurrentLocationSelect}
      />
    </div>
  );
}

interface WeatherPanelsProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  position: Position;
  positionError: string | null;
  setPositionError: Dispatch<SetStateAction<string | null>>;
  refresh: CallableFunction;
  onCurrentLocationSelect: CallableFunction;
}

function WeatherPanelsLayout({
  currentLocation,
  setCurrentLocation,
  setPosition,
  position,
  setPositionError,
  positionError,
  refresh,
  onCurrentLocationSelect,
}: WeatherPanelsProps) {
  return (
    <div style={{ width: "100%", paddingTop: "8px" }}>
      <div className="window" style={{ padding: "5px", marginBottom: "8px", marginTop: "25px" }}>
        <Banner
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
          setPosition={setPosition}
          position={position}
          setPositionError={setPositionError}
          positionError={positionError}
          refresh={refresh}
          onCurrentLocationSelect={onCurrentLocationSelect}
        />
      </div>
      <div className="window">
        <HourlyForecast />
      </div>
      <div className="grid-container ">
        <OneWeekForecast />

        <Wind />

        <Additional />
      </div>
    </div>
  );
}

export default App;
