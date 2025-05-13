import { getIcon } from "../../helpers/global";
import CitySelector from "../CitySelector";
import MapChart from "../map/Map";
import { useQueryClient } from "@tanstack/react-query";
import { useWeather } from "../../hooks/use-points";
import dayjs from "dayjs";
import { Hourly } from "../../types/hourly";
import { Points, Position } from "../../types/global";
import { Hourglass } from "react95";
import { Dispatch, SetStateAction } from "react";

interface BannerProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  position: Position;
  positionError: string | null;
  setPositionError: Dispatch<SetStateAction<string | null>>;
  refresh: CallableFunction;
  onCurrentLocationSelect: CallableFunction;
}

export default function Banner({
  positionError,
  refresh,
  currentLocation,
  onCurrentLocationSelect,
  position,
  setCurrentLocation,
  setPosition,
}: BannerProps) {
  const queryClient = useQueryClient();

  const { status, points, hourly, dataUpdatedAt } = useWeather();

  return (
    <div className="banner">
      <NameIconAndTemp
        isFetching={status !== "success"}
        points={points}
        hourly={hourly}
      />

      <div className="child-div">
        <div
          style={{
            display: "flex",
            alignContent: "space-between",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
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
            }}
          >
            <div
              style={{
                textAlign: "center",
                display: "flex",
                alignContent: "end",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                disabled={currentLocation}
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => onCurrentLocationSelect()}
              >
                {positionError ? positionError : "Use Current Location"}
              </button>
            </div>
            <div className="window">
              <CitySelector
                currentLocation={currentLocation}
                setCurrentLocation={setCurrentLocation}
                setPosition={setPosition}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="child-div">
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
          />
        </div>
      </div>
    </div>
  );
}

function NameIconAndTemp({
  isFetching,
  hourly,
  points,
}: {
  isFetching: boolean;
  hourly: Hourly | undefined;
  points: Points | undefined;
}) {
  return (
    <div className="child-div">
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
            {isFetching ? (
              <h4
                style={{
                  fontSize: "33px",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                  width: "150px",
                  marginTop: 0,
                }}
              >
                {"- - °"}
              </h4>
            ) : (
              <h4
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: "33px",
                }}
              >
                {hourly?.properties?.periods[0]?.temperature}°
              </h4>
            )}
          </div>
          <div className="grandchild-div">
            {hourly?.properties?.periods[0] ? (
              <img
                style={{ height: "70px", maxWidth: "110px" }}
                src={`/${getIcon(
                  hourly?.properties?.periods[0]?.isDaytime,
                  hourly?.properties?.periods[0]?.shortForecast
                )}.gif`}
              />
            ) : (
              <div style={{ height: "70px", width: "110px" }} />
            )}
          </div>
        </div>

        <div className="short-description">
          <p style={{ marginBottom: 0, marginTop: 0 }}>
            {hourly?.properties?.periods[0]?.shortForecast}
          </p>
        </div>
      </div>
    </div>
  );
}
