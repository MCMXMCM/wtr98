import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Position } from "../../types/global";
import { base64Icons } from "../../assets/base64icons/icons";

export default function MapChart({
  temp,
  cityName,
  coords,
  currentIconName,
}: {
  temp: number;
  cityName: string;
  coords: Position;
  currentIconName: string;
}) {
  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={1000}
      height={650}
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
        key={"coords"}
        coordinates={[coords.longitude, coords.latitude]}
        id={"coords"}
      >
        <text
          y={-55}
          // x={-10}
          fontWeight="bold"
          fontSize="40px"
          fill="#f3f5b7"
          // textLength="300"
          // width="300"
          // lengthAdjust="spacingAndGlyphs"
          text-anchor="middle"
          style={{
            fontSize: "45px",
            maxWidth: "350px",
            wordWrap: "break-word",
            textShadow: "1px 1px 2px black",
          }}
        >
          {temp}°
        </text>
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
          y={90}
          // x={-10}
          fontWeight="bold"
          fontSize="40px"
          fill="#f3f5b7"
          // textLength="300"
          // width="300"
          // lengthAdjust="spacingAndGlyphs"
          text-anchor="middle"
          style={{
            fontSize: "45px",
            maxWidth: "350px",
            wordWrap: "break-word",
            textShadow: "1px 1px 2px black",
          }}
        >
          {cityName}
        </text>
      </Marker>
    </ComposableMap>
  );
}
