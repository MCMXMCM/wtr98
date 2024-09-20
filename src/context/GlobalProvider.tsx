import {
  createContext,
  useState,
  FC,
  ReactNode,
  SetStateAction,
  Dispatch,
  useContext,
} from "react";
import { Position } from "../types/global";

interface GlobalContextType {
  lastQueryTime: string;
  setLastQueryTime: (time: string) => void;
  useCurrentLocation: boolean;
  setUseCurrentLocation: Dispatch<SetStateAction<boolean>>;
  selectedCity: string;
  setSelectedCity: Dispatch<SetStateAction<string>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  position: Position;
  positionError: string | null;
  setPositionError: Dispatch<SetStateAction<string | null>>;
  specificCity: string;
  pointsIsPending: boolean;
  pointsFetching: boolean;
  hourlyFetching: boolean;
  refresh: CallableFunction;
  onCurrentLocationSelect: CallableFunction;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

export const GlobalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lastQueryTime, setLastQueryTime] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [position, setPosition] = useState<Position>({
    latitude: 0,
    longitude: 0,
  });

  const [positionError, setPositionError] = useState<string | null>(null);
  if (positionError) {
    console.log(positionError);
  }

  return (
    <GlobalContext.Provider
      value={{
        lastQueryTime,
        setLastQueryTime,
        useCurrentLocation,
        setUseCurrentLocation,
        selectedCity,
        setSelectedCity,
        setPosition,
        position,
        setPositionError,
        positionError,
        specificCity: "",
        pointsIsPending: true,
        pointsFetching: true,
        hourlyFetching: false,
        refresh: () => {},
        onCurrentLocationSelect: () => {},
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
