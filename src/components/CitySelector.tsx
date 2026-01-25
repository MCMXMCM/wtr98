import { Dispatch, SetStateAction, useState, memo } from "react";
import { cityOptions } from "../assets/majorCityPositions";
import { useQueryClient } from "@tanstack/react-query";
import { Position } from "../types/global";
import "./CustomSelect.css";

const PLACEHOLDER = "make a selection";
const cityOptionsList = [PLACEHOLDER, ...Object.keys(cityOptions)];

interface CitySelectorProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  automaticMode: boolean;
  setAutomaticMode: Dispatch<SetStateAction<boolean>>;
}

const USER_HAS_SELECTED_KEY = "wtr98-user-has-selected";

function CitySelector({
  setPosition,
  setCurrentLocation,
  currentLocation,
  setAutomaticMode,
}: CitySelectorProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(PLACEHOLDER);

  const handleOptionChange = (value: string) => {
    setSelected(value);
    if (value === PLACEHOLDER) {
      setCurrentLocation(false);
      return;
    }
    setCurrentLocation(false);
    setAutomaticMode(false);
    localStorage.setItem("wtr98-automatic-mode", "false");
    localStorage.setItem(USER_HAS_SELECTED_KEY, "true");
    const { latitude, longitude } = cityOptions[value];
    localStorage.setItem("latitude", String(latitude));
    localStorage.setItem("longitude", String(longitude));
    queryClient.prefetchQuery({
      queryKey: ["weather", latitude, longitude],
    });
    setPosition({ latitude, longitude });
  };

  const displayValue = currentLocation ? PLACEHOLDER : selected;

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <label style={{ fontSize: "16px", textAlign: "start", width: "100%", padding: "0 4px" }} htmlFor="city-select">
        Select a city:
      </label>
      <div className="custom-select">
        <select
          id="city-select"
          value={displayValue}
          onChange={(e) => handleOptionChange(e.target.value)}
        >
          {cityOptionsList.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default memo(CitySelector);
