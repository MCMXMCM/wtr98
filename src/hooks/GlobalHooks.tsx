import { useContext } from "react";
import { GlobalContext } from "../context/GlobalProvider";

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
