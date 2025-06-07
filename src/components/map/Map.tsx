import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Position } from "../../types/global";
import { base64Icons, hourglass } from "../../assets/base64icons/icons";

interface MapChartProps {
  temp: number | undefined;
  cityName: string | undefined;
  coords: Position | undefined;
  currentIconName: string | undefined;
  onMapClick?: (position: Position) => void;
}

// Function to calculate centroid of a polygon
function calculateCentroid(geometry: any, stateName: string) {
  // Use predefined coordinates for Alaska and Hawaii to ensure we get land points
  if (stateName === 'Alaska') {
    // Anchorage coordinates
    return [-149.9003, 61.2181];
  }
  if (stateName === 'Hawaii') {
    // Honolulu coordinates
    return [-157.8583, 21.3069];
  }

  if (!geometry || !geometry.coordinates) {
    console.error('Invalid geometry:', geometry);
    return [0, 0];
  }

  console.log('Processing geometry:', {
    type: geometry.type,
    coordinates: geometry.coordinates
  });

  let x = 0;
  let y = 0;
  let totalPoints = 0;

  try {
    // For Polygon, coordinates is an array of rings
    // For MultiPolygon, coordinates is an array of polygons
    const polygons = geometry.type === 'MultiPolygon' 
      ? geometry.coordinates 
      : [geometry.coordinates];

    for (const polygon of polygons) {
      // First ring is the outer boundary
      const outerRing = polygon[0];
      
      for (const point of outerRing) {
        if (Array.isArray(point) && point.length >= 2) {
          x += point[0];
          y += point[1];
          totalPoints++;
        }
      }
    }

    if (totalPoints === 0) {
      console.error('No valid points found in geometry');
      return [0, 0];
    }

    const centroid = [x / totalPoints, y / totalPoints];
    console.log('Calculated centroid:', centroid);
    return centroid;
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return [0, 0];
  }
}

export default function MapChart({
  temp,
  cityName,
  coords,
  currentIconName,
  onMapClick,
}: MapChartProps) {


  return (
    <ComposableMap
      projection="geoAlbersUsa"
      projectionConfig={{
        scale: 1000,
        center: [-95, 40]
      }}
      width={1000}
      height={650}
      style={{
        width: "100%",
        height: "auto",
      }}
    >
      <Geographies geography="/usa.json">
        {({ geographies  }) =>
          geographies.map((geo) => {
            const centroid = calculateCentroid(geo.geometry, geo.properties.name);
            
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#828081"
                stroke="#000000"
                strokeWidth={1}
                style={{
                  default: {
                    outline: 'none',
                    userSelect: 'none',
                  },
                  hover: {
                    outline: 'none',
                    fill: '#9c9c9c',
                    cursor: 'pointer',
                  },
                  pressed: {
                    outline: 'none',
                    fill: '#6e6e6e',
                  }
                }}
                onClick={() => {
                  console.log('Geography clicked:', {
                    name: geo.properties.name,
                    type: geo.geometry.type,
                    centroid: centroid
                  });
                  if (onMapClick) {
                    onMapClick({
                      latitude: Number(centroid[1]),
                      longitude: Number(centroid[0])
                    });
                  }
                }}
              />
            );
          })
        }
      </Geographies>
      {coords?.longitude && coords?.latitude && (
        <Geographies geography="/usa.json">
          {({ projection }) => {
            const projectedCoords = projection([coords.longitude, coords.latitude]);
            if (!projectedCoords) return null;
            const [x, y] = projectedCoords;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  y={-55}
                  fontWeight="bold"
                  fontSize="40px"
                  fill="#f3f5b7"
                  textAnchor="middle"
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
                    base64Icons[currentIconName as keyof object] || hourglass
                  }`}
                ></image>
                <text
                  y={90}
                  fontWeight="bold"
                  fontSize="40px"
                  fill="#f3f5b7"
                  textAnchor="middle"
                  style={{
                    fontSize: "45px",
                    maxWidth: "350px",
                    wordWrap: "break-word",
                    textShadow: "1px 1px 2px black",
                  }}
                >
                  {cityName}
                </text>
              </g>
            );
          }}
        </Geographies>
      )}
    </ComposableMap>
  );
}
