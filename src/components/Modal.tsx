import { WeatherForecast } from "../types/global";
import { WeatherPeriod } from "../types/forecast";
import dayjs from "dayjs";
import { getIcon } from "../helpers/global";
import './Modal.css';
import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: WeatherForecast | WeatherPeriod | null;
}

const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export default function Modal({ isOpen, onClose, forecast }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !forecast) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isOpen, forecast]);

  if (!isOpen || !forecast) return null;

  const icon = getIcon(forecast.isDaytime, forecast.shortForecast);
  const hasDetailedInfo = 'dewpoint' in forecast;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div ref={modalRef} className="window" style={{ width: "500px", maxWidth: "90vw" }}>
        <div className="title-bar">
          <div className="title-bar-text">
            Detailed Forecast - {dayjs(forecast.startTime).format("dddd, MMMM D, YYYY h:mm A")}
          </div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              onClick={onClose}
             
            />
          </div>
        </div>
        <div className="window-body" style={{ padding: "16px" }}>
          <div className="modal-flex-row" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "5%", width: "50%", justifyContent: "center" }}>
                <div>
                  <p style={{ fontSize: "33px", margin: 0, fontWeight: "bold" }}>
                    {forecast.temperature}°{forecast.temperatureUnit}
                  </p>
                </div>
                <div>
                  <img
                    style={{ height: "70px", maxWidth: "110px" }}
                    src={`/${icon}.gif`}
                    alt={forecast.shortForecast}
                  />
                </div>
              </div>
              <div style={{ width: "100%", overflow: "hidden", minWidth: 0, textAlign: "center" }}>
                <h4 style={{ margin: "8px 0", 
                    wordWrap: "break-word", 
                    overflowWrap: "break-word", 
                    wordBreak: "break-word", 
                    maxWidth: "100%", 
                    whiteSpace: "normal" }}>{forecast.shortForecast}</h4>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Detailed Forecast</h4>
            <p style={{ margin: 0, fontSize: "16px" }}>{forecast.detailedForecast}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>Wind</h4>
              <p style={{ margin: 0, fontSize: "16px" }}>{forecast.windSpeed} {forecast.windDirection}</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>Precipitation</h4>
              <p style={{ margin: 0, fontSize: "16px" }}>{forecast.probabilityOfPrecipitation.value}% chance</p>
            </div>
            {hasDetailedInfo && (
              <>
                <div>
                  <h4 style={{ margin: "0 0 8px 0" }}>Humidity</h4>
                  <p style={{ margin: 0, fontSize: "16px" }}>{forecast.relativeHumidity.value}%</p>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 8px 0" }}>Dew Point</h4>
                  <p style={{ margin: 0, fontSize: "16px" }}>{Math.round(celsiusToFahrenheit(forecast.dewpoint.value))}°</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 