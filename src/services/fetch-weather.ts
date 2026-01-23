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

  if (!latitude || !longitude) {
    throw new Error("No coordinates found in localStorage");
  }

  try {
    // First get the points data to get the correct grid point identifiers
    const pt = await axios.get(
      `https://api.weather.gov/points/${latitude},${longitude}`
    );
    const pointData: WeatherGovPoint = pt.data;
    
    console.log('Points API response:', {
      gridId: pointData?.properties?.gridId,
      gridX: pointData?.properties?.gridX,
      gridY: pointData?.properties?.gridY,
      forecastUrl: pointData?.properties?.forecast,
      forecastHourlyUrl: pointData?.properties?.forecastHourly
    });

    // Store the coordinates after getting valid points data
    localStorage.setItem("latitude", latitude);
    localStorage.setItem("longitude", longitude);

    const points: Points = {
      forecastUrl: pointData?.properties?.forecast,
      forecastHourlyUrl: pointData?.properties?.forecastHourly,
      forecastGridDataUrl: pointData?.properties?.forecastGridData,
      city: pointData?.properties?.relativeLocation?.properties?.city,
      state: pointData?.properties?.relativeLocation?.properties?.state,
    };

    // Get the weekly forecast first
    if (!points.forecastUrl) {
      throw new Error("No forecast URL available from points API");
    }
    const wk = await axios.get(points.forecastUrl);
    const weekly: WeeklyForecast = wk.data;

    // Get hourly forecast using the URL from the points API
    if (!points.forecastHourlyUrl) {
      throw new Error("No hourly forecast URL available from points API");
    }
    const hr = await axios.get(points.forecastHourlyUrl);
    const hourly: Hourly = hr.data;

    return { points, hourly, weekly };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Error Details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.config?.headers
      });
    }
    throw error;
  }
}

export const fetchHourly = async (
  url: string
): Promise<WeatherForecastHourly> => {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch {
    throw new Error("failed to fetch hourly forecast from location url");
  }
};

export const fetchWeeklyForecast = async (
  url: string
): Promise<WeeklyForecast> => {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch {
    throw new Error("failed to fetch hourly forecast from location url");
  }
};
