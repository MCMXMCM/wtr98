import { Dispatch, SetStateAction, useState, useEffect, useRef, useCallback } from "react";

import "./App.css";
import "98.css";
import { Position } from "./types/global";
import OneWeekForecast from "./components/oneweek/OneWeek";
import HourlyForecast from "./components/hourly/Hourly";
import Wind from "./components/wind/Wind";
import Additional from "./components/additional/Additional";
import Banner from "./components/banner/Banner";
import InfiniteMarquee from "./components/Marquee";
import { cityOptions } from "./assets/majorCityPositions";
import { shuffle } from "./helpers/global";
import { useQueryClient } from "@tanstack/react-query";

const CHICAGO_COORDS = { latitude: 41.8781136, longitude: -87.6297982 };
const AUTOMATIC_MODE_KEY = "wtr98-automatic-mode";
const USER_HAS_SELECTED_KEY = "wtr98-user-has-selected";

function App() {
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<boolean>(false);
  const lat = localStorage.getItem("latitude");
  const long = localStorage.getItem("longitude");
  const userHasSelected = localStorage.getItem(USER_HAS_SELECTED_KEY) === "true";
  
  // Determine if automatic mode should be default
  const shouldDefaultToAutomatic = !userHasSelected && (!lat || !long || 
    (Number(lat) === CHICAGO_COORDS.latitude && Number(long) === CHICAGO_COORDS.longitude));
  
  // Initialize automatic mode from localStorage or default
  const storedAutomaticMode = localStorage.getItem(AUTOMATIC_MODE_KEY);
  const initialAutomaticMode = storedAutomaticMode !== null 
    ? storedAutomaticMode === "true"
    : shouldDefaultToAutomatic;
  
  const [automaticMode, setAutomaticMode] = useState<boolean>(initialAutomaticMode);
  
  // Get all cities except Chicago for shuffling
  const allCities = Object.keys(cityOptions);
  const citiesWithoutChicago = allCities.filter(city => city !== "Chicago, IL");
  
  // Initialize shuffled cities list
  const [automaticCities, setAutomaticCities] = useState<string[]>(() => 
    shuffle([...citiesWithoutChicago])
  );
  const [automaticIndex, setAutomaticIndex] = useState<number>(-1); // -1 means we're at Chicago
  const intervalRef = useRef<number | null>(null);
  
  // default to chicago unless localStorage has a position
  const start: Position =
    lat && long
      ? { latitude: Number(lat), longitude: Number(long) }
      : CHICAGO_COORDS;

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
    // Turn off automatic mode when user selects current location
    setAutomaticMode(false);
    localStorage.setItem(AUTOMATIC_MODE_KEY, "false");
    localStorage.setItem(USER_HAS_SELECTED_KEY, "true");
    getCurrentPosition();
  }

  function refresh() {
    if (currentLocation) {
      getCurrentPosition();
    }
  }

  // Function to switch to next city in automatic mode
  const switchToNextCity = useCallback(() => {
    setAutomaticIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= automaticCities.length) {
        // Reshuffle and reset to first city in new shuffle
        const reshuffled = shuffle([...citiesWithoutChicago]);
        setAutomaticCities(reshuffled);
        const nextCity = reshuffled[0];
        const { latitude, longitude } = cityOptions[nextCity];
        localStorage.setItem("latitude", String(latitude));
        localStorage.setItem("longitude", String(longitude));
        queryClient.prefetchQuery({
          queryKey: ["weather", latitude, longitude],
        });
        setPosition({ latitude, longitude });
        return 0;
      } else {
        // Switch to next city in current shuffle
        const nextCity = automaticCities[nextIndex];
        const { latitude, longitude } = cityOptions[nextCity];
        localStorage.setItem("latitude", String(latitude));
        localStorage.setItem("longitude", String(longitude));
        queryClient.prefetchQuery({
          queryKey: ["weather", latitude, longitude],
        });
        setPosition({ latitude, longitude });
        return nextIndex;
      }
    });
  }, [citiesWithoutChicago, automaticCities, queryClient]);

  // Effect to handle automatic mode cycling
  useEffect(() => {
    if (automaticMode) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start with Chicago if we're at index -1 (initial state or just enabled)
      if (automaticIndex === -1) {
        // Ensure we're at Chicago
        if (position.latitude !== CHICAGO_COORDS.latitude || 
            position.longitude !== CHICAGO_COORDS.longitude) {
          localStorage.setItem("latitude", String(CHICAGO_COORDS.latitude));
          localStorage.setItem("longitude", String(CHICAGO_COORDS.longitude));
          queryClient.prefetchQuery({
            queryKey: ["weather", CHICAGO_COORDS.latitude, CHICAGO_COORDS.longitude],
          });
          setPosition(CHICAGO_COORDS);
        }
      }
      
      // Set up interval to switch cities every 60 seconds
      intervalRef.current = setInterval(() => {
        switchToNextCity();
      }, 60000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval when automatic mode is turned off
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset index so it starts from Chicago next time
      setAutomaticIndex(-1);
    }
  }, [automaticMode, automaticIndex, position.latitude, position.longitude, switchToNextCity, queryClient]);

  // Update localStorage when automatic mode changes
  useEffect(() => {
    localStorage.setItem(AUTOMATIC_MODE_KEY, String(automaticMode));
  }, [automaticMode]);

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
        automaticMode={automaticMode}
        setAutomaticMode={setAutomaticMode}
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
  automaticMode: boolean;
  setAutomaticMode: Dispatch<SetStateAction<boolean>>;
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
  automaticMode,
  setAutomaticMode,
}: WeatherPanelsProps) {
  return (
    <div className="weather-panels-wrapper" style={{ width: "100%" }}>
      <div className="window banner-window" style={{ padding: "5px" }}>
        <Banner
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
          setPosition={setPosition}
          position={position}
          setPositionError={setPositionError}
          positionError={positionError}
          refresh={refresh}
          onCurrentLocationSelect={onCurrentLocationSelect}
          automaticMode={automaticMode}
          setAutomaticMode={setAutomaticMode}
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
