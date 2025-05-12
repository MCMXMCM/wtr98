// import { createContext, SetStateAction, Dispatch } from "react";
// import { Position } from "../types/global";

// interface GlobalContextType {
//   currentLocation: boolean;
//   setCurrentLocation: Dispatch<SetStateAction<boolean>>;
//   setPosition: Dispatch<SetStateAction<Position>>;
//   position: Position;
//   positionError: string | null;
//   setPositionError: Dispatch<SetStateAction<string | null>>;
//   refresh: CallableFunction;
//   onCurrentLocationSelect: CallableFunction;
// }

// export const GlobalContext = createContext<GlobalContextType>({
//   currentLocation: false,
//   setCurrentLocation: () => {},
//   setPosition: () => {},
//   position: {
//     latitude: 0,
//     longitude: 0,
//   },
//   positionError: null,
//   setPositionError: () => {},
//   refresh: () => {},
//   onCurrentLocationSelect: () => {},
// });
