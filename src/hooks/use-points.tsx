import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../services/fetch-weather";

export const useWeather = () => {
  const latitude = localStorage.getItem("latitude");
  const longitude = localStorage.getItem("longitude");
  const {
    status,
    error,
    data: forecast,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: fetchWeather,
  });

  return { ...forecast, dataUpdatedAt, status, error };
};
