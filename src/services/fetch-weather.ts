import axios from "axios";
import { WeeklyForecast } from "../types/forecast";
import { Points, WeatherForecastHourly } from "../types/global";
import { Hourly } from "../types/hourly";
import { WeatherGovPoint } from "../types/points";

export async function fetchWeather(): Promise<{
  points: Points;
  hourly: Hourly;
  weekly: WeeklyForecast;
}> {
  const latitude = localStorage.getItem("latitude");
  const longitude = localStorage.getItem("longitude");
  const pt = await axios.get(
    `https://api.weather.gov/points/${latitude},${longitude}`
  );
  const pointData: WeatherGovPoint = pt.data;
  const points: Points = {
    forecastUrl: pointData?.properties?.forecast,
    forecastHourlyUrl: pointData?.properties?.forecastHourly,
    forecastGridDataUrl: pointData?.properties?.forecastGridData,
    city: pointData?.properties?.relativeLocation?.properties?.city,
    state: pointData?.properties?.relativeLocation?.properties?.state,
  };

  const hr = await axios.get(points.forecastHourlyUrl);
  const hourly: Hourly = hr.data;
  const wk = await axios.get(points.forecastUrl);
  const weekly: WeeklyForecast = wk.data;

  return { points, hourly, weekly };
}

export const fetchHourly = async (
  url: string
): Promise<WeatherForecastHourly> => {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch (err) {
    throw new Error("failed to fetch hourly forecast from location url");
  }
};

export const fetchWeeklyForecast = async (
  url: string
): Promise<WeeklyForecast> => {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch (err) {
    throw new Error("failed to fetch hourly forecast from location url");
  }
};
