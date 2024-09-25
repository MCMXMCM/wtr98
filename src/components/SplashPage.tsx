import CitySelector from "./CitySelector";
import { Tile } from "./ProgressBar";
import { useGlobalContext } from "../hooks/GlobalHooks";

export default function SplashPage({
  onCurrentLocationSelect,
}: {
  onCurrentLocationSelect: CallableFunction;
}) {
  const { positionError, loaded } = useGlobalContext();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "95vh",
        width: "95vw",
        flexDirection: "column",
      }}
    >
      <div className="window">
        <div
          className="title-bar"
          style={{
            marginBottom: "18px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="title-bar-text">
            <h4 style={{ letterSpacing: 1.4, textAlign: "center" }}>
              WEATHER 98 - v1.0.1
            </h4>
          </div>
        </div>
        {loaded ? <></> : <Tile />}

        {positionError ? (
          <div
            className="window"
            style={{
              marginTop: "18px",
              marginBottom: "8px",
              marginRight: "8px",
              marginLeft: "8px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                textAlign: "center",
                fontWeight: "bold",
                padding: "4px",
              }}
            >
              {`${positionError} -- if you're on mobile, make sure your current browser
         has permission to use location services while in use.`}
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: "18px",
              marginBottom: "8px",
              marginRight: "8px",
              marginLeft: "8px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "18px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px",
                }}
              >
                {loaded ? (
                  <>Waiting on your selection...</>
                ) : (
                  <>Loading weather data...</>
                )}
              </p>
              <p
                style={{
                  fontSize: "18px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px",
                }}
              >
                Make a selection below to view weather for your location or the
                selected city...
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                columnGap: "2%",
                width: "100%",
              }}
            >
              <div
                className="window"
                style={{
                  width: "48%",
                  textAlign: "center",
                  display: "flex",
                  alignContent: "end",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    fontSize: "16px",
                  }}
                  onClick={() => onCurrentLocationSelect()}
                >
                  Use Current Location
                </button>
              </div>
              <div className="window" style={{ width: "48%" }}>
                <CitySelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
