import { Dispatch, SetStateAction, useState, memo } from "react";
import { cityOptions } from "../assets/majorCityPositions";
import { useQueryClient } from "@tanstack/react-query";
import { Position } from "../types/global";

interface CitySelectorProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
}
function CitySelector({
  setPosition,
  setCurrentLocation,
  currentLocation,
}: CitySelectorProps) {
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState("make a selection");
  const [isFocused, setIsFocused] = useState(false);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = event.target.value;
    setSelected(selectedCity);
    setCurrentLocation(false);
    const { latitude, longitude } = cityOptions[selectedCity];
    localStorage.setItem("latitude", String(latitude));
    localStorage.setItem("longitude", String(longitude));
    queryClient.prefetchQuery({
      queryKey: ["weather", latitude, longitude],
    });
    setPosition({ latitude, longitude });
  };

  return (
    <div>
      <label style={{ fontSize: "16px" }} htmlFor="city-select">
        Select a city:
      </label>
      <select
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          fontSize: "16px",
          color: isFocused ? "white" : "black",
          width: "100%",
          cursor: "pointer",
        }}
        id="city-select"
        onChange={handleCityChange}
        value={currentLocation ? "make a selction" : selected}
      >
        <option>make a selection</option>
        {Object.keys(cityOptions).map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
}

export default memo(CitySelector);
