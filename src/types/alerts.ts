/** Weather.gov alerts API (GeoJSON FeatureCollection) */
export interface WeatherAlerts {
  type: "FeatureCollection";
  features: WeatherAlertFeature[];
  title?: string;
  updated?: string;
}

export interface WeatherAlertFeature {
  id: string;
  type: "Feature";
  geometry: null;
  properties: WeatherAlertProperties;
}

export interface WeatherAlertProperties {
  "@id": string;
  "@type": string;
  id: string;
  areaDesc: string;
  sent: string;
  effective: string;
  onset?: string;
  expires: string;
  ends?: string;
  status: string;
  messageType: string;
  category: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  certainty: string;
  urgency: string;
  event: string;
  sender: string;
  senderName?: string;
  headline: string;
  description: string;
  instruction?: string;
  response?: string;
  affectedZones?: string[];
  geocode?: { SAME?: string[]; UGC?: string[] };
  parameters?: { NWSheadline?: string[] };
}
