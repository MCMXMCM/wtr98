import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Position } from "../../types/global";
import { base64Icons } from "../../assets/base64icons/icons";

// const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function MapChart({
  cityName,
  coords,
  currentIconName,
}: {
  cityName: string;
  coords: Position;
  currentIconName: string;
}) {
  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={900}
      height={600}
      style={{
        width: "100%",
        height: "auto",
      }}
    >
      <Geographies geography="/usa.json">
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#828081"
              stroke="#000000"
              strokeWidth={1}
            />
          ))
        }
      </Geographies>
      <Marker
        key={"test"}
        coordinates={[coords.longitude, coords.latitude]}
        id={"test"}
      >
        <image
          x={-60}
          y={-50}
          width={100}
          height={100}
          xlinkHref={`data:image/png;base64, ${
            base64Icons[currentIconName as keyof object]
          }`}
        ></image>
        <text
          y={80}
          x={-80}
          fontWeight="bold"
          fontSize="40px"
          fill="#fafafa"
          stroke="#DFFF00"
          strokeWidth={1}
        >
          {cityName}
        </text>
      </Marker>
    </ComposableMap>
  );
}
