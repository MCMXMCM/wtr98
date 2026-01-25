import { getIcon } from "../helpers/global";
import { useWeather } from "../hooks/use-points";
import { useState } from "react";
import Modal from "./Modal";
import "./ForecastPreview.css";

export default function ForecastPreview() {
  const { weekly, status } = useWeather();
  const firstThreePeriods = weekly?.properties?.periods?.slice(0, 3) || [];
  const isLoading = status !== "success";
  const [openModalPeriod, setOpenModalPeriod] = useState<number | null>(null);

  return (
    <div className="forecast-preview">
      {isLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="forecast-preview-row">
              <div className="forecast-preview-temp-icon">
                <span className="forecast-preview-temp" style={{ visibility: "hidden" }}>0°</span>
                <div className="forecast-preview-icon forecast-preview-icon-placeholder" />
              </div>
              <div className="forecast-preview-name" style={{ visibility: "hidden" }}>Day</div>
            </div>
          ))}
        </>
      ) : (
        <>
          {firstThreePeriods.map((period) => {
            const icon = getIcon(period.isDaytime, period.shortForecast);
            return (
              <div
                key={period.number}
                className="forecast-preview-row"
                onClick={() => setOpenModalPeriod(period.number)}
              >
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
          {openModalPeriod !== null && (
            <Modal
              isOpen={true}
              onClose={() => setOpenModalPeriod(null)}
              forecast={firstThreePeriods.find(p => p.number === openModalPeriod) || null}
            />
          )}
        </>
      )}
    </div>
  );
}
