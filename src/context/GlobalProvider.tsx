import { createContext, SetStateAction, Dispatch } from "react";
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
