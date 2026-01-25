import { getIcon } from "../../helpers/global";
import CitySelector from "../CitySelector";
import MapChart from "../map/Map";
import { useQueryClient } from "@tanstack/react-query";
import { useWeather } from "../../hooks/use-points";
import { useFavicon } from "../../hooks/use-favicon";
import dayjs from "dayjs";
import { Hourly } from "../../types/hourly";
import { Points, Position } from "../../types/global";
import { Hourglass } from "react95";
import { Dispatch, SetStateAction, useState } from "react";
import AudioPlayer from "../AudioPlayer";
import ForecastPreview from "../ForecastPreview";
import Modal from "../Modal";
import type { WeatherAlertFeature } from "../../types/alerts";
import AlertModal from "../AlertModal";

interface BannerProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  position: Position;
  positionError: string | null;
  setPositionError: Dispatch<SetStateAction<string | null>>;
  refresh: CallableFunction;
  onCurrentLocationSelect: CallableFunction;
  automaticMode: boolean;
  setAutomaticMode: Dispatch<SetStateAction<boolean>>;
}

export default function Banner({
  positionError,
  refresh,
  currentLocation,
  onCurrentLocationSelect,
  position,
  setCurrentLocation,
  setPosition,
  automaticMode,
  setAutomaticMode,
}: BannerProps) {
  const queryClient = useQueryClient();

  const { status, points, hourly, dataUpdatedAt } = useWeather();
  const isFetching = status !== "success";

  // Update favicon based on current weather and city name
  useFavicon(hourly, points);

  return (
    <div className="banner">
      <div className="child-div banner-map-section">
        <div className="window-body">
          <MapChart
            cityName={points?.city}
            coords={position}
            temp={hourly?.properties?.periods[0]?.temperature}
            currentIconName={
              hourly?.properties?.periods[0]
                ? getIcon(
                  hourly?.properties?.periods[0]?.isDaytime,
                  hourly?.properties?.periods[0]?.shortForecast
                )
                : "???"
            }
            onMapClick={(newPosition) => {
              setPosition(newPosition);
              setCurrentLocation(false);
              // Turn off automatic mode when user clicks map
              setAutomaticMode(false);
              localStorage.setItem("wtr98-automatic-mode", "false");
              localStorage.setItem("wtr98-user-has-selected", "true");
              localStorage.setItem("latitude", newPosition.latitude.toString());
              localStorage.setItem("longitude", newPosition.longitude.toString());
              queryClient.refetchQueries({
                queryKey: ["weather", newPosition.latitude, newPosition.longitude],
              });
            }}
          />
        </div>
      </div>

      <div className="name-forecast-container">
        <NameIconAndTempWithForecast
          isFetching={isFetching}
          points={points}
          hourly={hourly}
        />
      </div>

      <div className="child-div banner-controls-section">
        <div
          className="banner-controls-inner"
          style={{
            display: "flex",
            alignContent: "space-between",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            width: "100%",
          }}
        >
          <button
            style={{
              marginBottom: "4px",
              fontSize: "16px",
              height: "30px",
              width: "100%",
              cursor: "pointer",
            }}
            onClick={() => {
              queryClient.refetchQueries({
                queryKey: ["weather", position.latitude, position.longitude],
              });
              refresh();
            }}
          >
            Refresh (
            {status === "success"
              ? `Refreshed at: ${dayjs(new Date(dataUpdatedAt)).format(
                "hh:mm a"
              )}`
              : "loading"}
            )
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              columnGap: "2%",
              width: "100%",
              minWidth: 0,
            }}
          >
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignContent: "end",
                justifyContent: "center",
                alignItems: "center",
                rowGap: "4px",
                flex: "1",
              }}
            >
              <button
                disabled={automaticMode}
                style={{
                  width: "100%",
                  fontSize: "16px",
                  marginBottom: "4px",
                  ...(automaticMode && {
                    border: "2px inset #c0c0c0",
                  }),
                }}
                onClick={() => setAutomaticMode(!automaticMode)}
              >
                Automatic
              </button>
              <button
                disabled={currentLocation}
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: "16px",
                  ...(currentLocation && {
                    border: "2px inset #c0c0c0",
                  }),
                }}
                onClick={() => onCurrentLocationSelect()}
              >
                {positionError ? positionError : "Current Location"}
              </button>
            </div>
            <div className="window banner-controls-window">
              <CitySelector
                currentLocation={currentLocation}
                setCurrentLocation={setCurrentLocation}
                setPosition={setPosition}
                automaticMode={automaticMode}
                setAutomaticMode={setAutomaticMode}
              />
            </div>
          </div>
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
}

export function NameIconAndTemp({
  isFetching,
  hourly,
  points,
}: {
  isFetching: boolean;
  hourly: Hourly | null | undefined;
  points: Points | undefined;
}) {
  const currentPeriod = hourly?.properties?.periods?.[0];
  const isHourlyAvailable = !!currentPeriod;

  return (
    <div className="child-div banner-name-section">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            marginTop: 15,
            marginBottom: 0,
          }}
        >
          {isFetching ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              loading <Hourglass />
            </div>
          ) : (
            points?.city
          )}
        </h4>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            columnGap: "5%",
            width: "50%",
            justifyContent: "center",
          }}
        >
          <div className="grandchild-div">
            <h4
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: "33px",
              }}
            >
              {isFetching
                ? ""
                : isHourlyAvailable
                  ? `${currentPeriod.temperature}°`
                  : "N/A"}
            </h4>
          </div>
          <div className="grandchild-div">
            {isHourlyAvailable ? (
              <img
                style={{ height: "70px", maxWidth: "110px" }}
                src={`/${getIcon(
                  currentPeriod.isDaytime,
                  currentPeriod.shortForecast
                )}.gif`}
              />
            ) : (
              <div style={{ height: "90px", width: "50px" }} />
            )}
          </div>
        </div>

        <div className="short-description">
          <p style={{ marginBottom: 0, marginTop: 0 }}>
            {isFetching ? "" : isHourlyAvailable ? currentPeriod.shortForecast : "Hourly forecast not available"}
          </p>
        </div>
      </div>
    </div>
  );
}

function NameIconAndTempWithForecast({
  isFetching,
  hourly,
  points,
}: {
  isFetching: boolean;
  hourly: Hourly | null | undefined;
  points: Points | undefined;
}) {
  const { weekly, alerts } = useWeather();
  const currentPeriod = hourly?.properties?.periods?.[0];
  const isHourlyAvailable = !!currentPeriod;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlertFeature | null>(null);

  // Get the first period from weekly forecast (same as marquee uses)
  const weeklyFirstPeriod = weekly?.properties?.periods?.[0];

  // Get active alerts (status === "Actual")
  const activeAlerts = (alerts?.features ?? []).filter(
    (f) => f.properties.status === "Actual"
  );
  const firstActiveAlert = activeAlerts.length > 0 ? activeAlerts[0] : null;

  // Find today's high (first daytime period) and low (first nighttime period)
  const todayHigh = weekly?.properties?.periods?.find(p => p.isDaytime);
  const todayLow = weekly?.properties?.periods?.find(p => !p.isDaytime);

  return (
    <div className="name-temp-with-forecast">
      <div className="name-temp-content">
        <div className="temp-icon-row ">
          <div
            className="temp-icon-left"
           
          >
            <h4 className="city-name">
              {isFetching ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  loading <Hourglass />
                </div>
              ) : (
                points?.city
              )}
            </h4>
            <div 
             onClick={() => {
              if (weeklyFirstPeriod) {
                setIsModalOpen(true);
              }
            }}
            className="temp-icon-top-row">
              <div className="temp-value">
                <h4>
                  {isFetching
                    ? <span style={{ visibility: "hidden" }}>00°</span>
                    : isHourlyAvailable
                      ? `${currentPeriod.temperature}°`
                      : "N/A"}
                </h4>
                {isFetching ? (
                  <div className="high-low-temps" style={{ visibility: "hidden" }}>
                    <span className="high-temp">00°</span>
                    <span className="temp-separator"> / </span>
                    <span className="low-temp">00°</span>
                  </div>
                ) : (
                  todayHigh && todayLow && (
                    <div className="high-low-temps">
                      <span className="high-temp">{todayHigh.temperature}°</span>
                      <span className="temp-separator"> / </span>
                      <span className="low-temp">{todayLow.temperature}°</span>
                    </div>
                  )
                )}
              </div>
              {isFetching ? (
                <div className="weather-icon-placeholder" />
              ) : isHourlyAvailable ? (
                <img
                  className="main-weather-icon"
                  src={`/${getIcon(
                    currentPeriod.isDaytime,
                    currentPeriod.shortForecast
                  )}.gif`}
                  alt={currentPeriod.shortForecast}
                />
              ) : (
                <div style={{ height: "70px", width: "50px" }} />
              )}
            </div>
            <div className={`short-description ${firstActiveAlert ? "short-description--alert" : ""}`}>
              {isFetching ? (
                <h4>
                  <span style={{ visibility: "hidden" }}>Placeholder text for height</span>
                </h4>
              ) : firstActiveAlert ? (
                <div 
                  style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
                  onClick={() => {
                    setSelectedAlert(firstActiveAlert);
                    setIsAlertModalOpen(true);
                  }}
                >
                  <h4 style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    cursor: "pointer",

                  }}>{`⚠ ${firstActiveAlert.properties.event}`}</h4>
               
           
                </div>
              ) : isHourlyAvailable ? (
                <h4>{currentPeriod.shortForecast}</h4>
              ) : (
                <h4>Hourly forecast not available</h4>
              )}
            </div>
          </div>
          <div className="forecast-preview-column">
            <ForecastPreview />
          </div>
          
        </div>
        {firstActiveAlert ? (
                <div 
                  style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "100%" }}
                  onClick={() => {
                    setSelectedAlert(firstActiveAlert);
                    setIsAlertModalOpen(true);
                  }}
                >
                 
                  <p
                    style={{
                      fontSize: "1rem",
                      cursor: "pointer",
                      margin: 0,
                      textAlign: "start",
                    }}
                  
                  >
                    <>
                      {(() => {
                        const endsDate = firstActiveAlert.properties.ends 
                          ? dayjs(firstActiveAlert.properties.ends) 
                          : null;
                        const isValidEnds = endsDate && endsDate.isValid();
                        const additionalAlertsText = activeAlerts.length > 1 
                          ? ` Additional Alerts: ${activeAlerts.slice(1).map((a) => a.properties.event).join(", ")}`
                          : "";
                        
                        if (isValidEnds) {
                          return `Expected to last until ${endsDate.format("h:mm a, dddd, MMMM D")}.${additionalAlertsText}`;
                        } else {
                          return additionalAlertsText ? additionalAlertsText.substring(1) : "";
                        }
                      })()}
                    </>
                  </p>
           
                </div>): null}
                
      </div>
      {weeklyFirstPeriod && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          forecast={weeklyFirstPeriod}
        />
      )}
      {selectedAlert && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => {
            setIsAlertModalOpen(false);
            setSelectedAlert(null);
          }}
          alert={selectedAlert}
          additionalAlerts={activeAlerts.filter(a => a.id !== selectedAlert.id)}
        />
      )}
    </div>
  );
}
