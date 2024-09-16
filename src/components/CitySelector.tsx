import React, { Dispatch, SetStateAction } from "react";
import { Position } from "../types/global";
import { cityOptions } from "../assets/majorCityPositions";

export default function CitySelector({
  setPosition,
  selectedCity,
  setSelectedCity,
  setUseCurrentLocation,
}: {
  setPosition: Dispatch<SetStateAction<Position>>;
  selectedCity: string;
  setSelectedCity: Dispatch<SetStateAction<string>>;
  setUseCurrentLocation: Dispatch<SetStateAction<boolean>>;
}) {
  // const [position, setPosition] = useState<Position>({
  //   latitude: 0,
  //   longitude: 0,
  // });
  // const [selectedCity, setSelectedCity] = useState<string>("");

  // const cityOptions: CityOption = {
  //   "New York, NY": { latitude: 40.7127837, longitude: -74.0059413 },
  //   "Los Angeles, CA": { latitude: 34.0522342, longitude: -118.2436849 },
  //   "Chicago, IL": { latitude: 41.8781136, longitude: -87.6297982 },
  //   "Houston, TX": { latitude: 29.7604267, longitude: -95.3698028 },
  //   "Phoenix, AZ": { latitude: 33.4483771, longitude: -112.0740373 },
  //   "Philadelphia, PA": { latitude: 39.9525839, longitude: -75.1652215 },
  //   "San Antonio, TX": { latitude: 29.4241219, longitude: -98.4936282 },
  //   "San Diego, CA": { latitude: 32.715738, longitude: -117.1610838 },
  //   "Dallas, TX": { latitude: 32.7766642, longitude: -96.7969879 },
  //   "San Jose, CA": { latitude: 37.3382082, longitude: -121.8863286 },
  //   "Austin, TX": { latitude: 30.267153, longitude: -97.7430608 },
  //   "Jacksonville, FL": { latitude: 30.3321838, longitude: -81.655651 },
  //   "Fort Worth, TX": { latitude: 32.7554883, longitude: -97.3307658 },
  //   "Columbus, OH": { latitude: 39.9611755, longitude: -82.9987942 },
  //   "Charlotte, NC": { latitude: 35.2270869, longitude: -80.8431267 },
  //   "Detroit, MI": { latitude: 42.331427, longitude: -83.0457538 },
  //   "El Paso, TX": { latitude: 31.7775757, longitude: -106.4424559 },
  //   "Memphis, TN": { latitude: 35.1495343, longitude: -90.0489801 },
  //   "Denver, CO": { latitude: 39.7392358, longitude: -104.990251 },
  // };

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
        style={{ fontSize: "16px", width: "100%" }}
        id="city-select"
        onChange={handleCityChange}
        value={selectedCity}
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
