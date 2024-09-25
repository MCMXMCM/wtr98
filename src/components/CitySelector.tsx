import { cityOptions } from "../assets/majorCityPositions";
import { useGlobalContext } from "../hooks/GlobalHooks";

export default function CitySelector() {
  const {
    setPosition,
    setSelectedCity,
    selectedCity,
    setUseCurrentLocation,
    useCurrentLocation,
  } = useGlobalContext();

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = event.target.value;
    setSelectedCity(selectedCity);
    setUseCurrentLocation(false);
    const { latitude, longitude } = cityOptions[selectedCity];
    setPosition({ latitude, longitude });
  };

  return (
    <div>
      <label style={{ fontSize: "16px" }} htmlFor="city-select">
        Select a city:
      </label>
      <select
        style={{ fontSize: "16px", width: "100%", cursor: "pointer" }}
        id="city-select"
        onChange={handleCityChange}
        value={useCurrentLocation ? "make a selection" : selectedCity}
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
