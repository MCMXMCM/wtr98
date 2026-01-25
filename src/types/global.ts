export interface Position {
  latitude: number;
  longitude: number;
}

export interface Points {
  forecastUrl: string;
  forecastHourlyUrl: string;
  forecastGridDataUrl: string;
  city: string;
  state: string;
  /** Zone ID for alerts API (e.g. MOC510, MOZ064). From county or forecastZone URL. */
  zoneId?: string;
}

export interface WeatherForecastHourly {
  properties: {
    updated: string; // ISO 8601 timestamp of when the forecast was last updated
    units: {
      temperature: string; // e.g. "F" for Fahrenheit
      speed: string; // e.g. "mph" for miles per hour
      precipitation: string; // e.g. "in" for inches
    };
    forecastGenerator: string; // e.g. "NWS Forecast API"
    generatedAt: string; // ISO 8601 timestamp of when the forecast was generated
    updateTime: string; // ISO 8601 timestamp of when the forecast was last updated
    validTimes: string; // ISO 8601 time range for the forecast
    elevation: number; // Elevation of the forecast location in meters
    periods: WeatherForecast[];
  };
}

export interface WeatherForecast {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string;
  probabilityOfPrecipitation: {
    unitCode: string;
    value: number;
  };
  dewpoint: {
    unitCode: string;
    value: number;
  };
  relativeHumidity: {
    unitCode: string;
    value: number;
  };
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}
