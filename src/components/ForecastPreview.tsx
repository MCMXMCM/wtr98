import { getIcon } from "../helpers/global";
import { useWeather } from "../hooks/use-points";
import "./ForecastPreview.css";

export default function ForecastPreview() {
  const { weekly } = useWeather();
  const firstThreePeriods = weekly?.properties?.periods?.slice(0, 3) || [];

  return (
    <div className="forecast-preview">
      {firstThreePeriods.map((period) => {
        const icon = getIcon(period.isDaytime, period.shortForecast);
        return (
          <div key={period.number} className="forecast-preview-row">
            <div className="forecast-preview-temp-icon">
              <span className="forecast-preview-temp">{period.temperature}°</span>
              <img 
                className="forecast-preview-icon" 
                src={`/${icon}.gif`} 
                alt={period.shortForecast}
              />
            </div>
            <div className="forecast-preview-name">{period.name}</div>
          </div>
        );
      })}
    </div>
  );
}
