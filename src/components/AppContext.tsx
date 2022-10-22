import { createContext, useContext } from "react";
import { MainViewModel } from "../models";

export type AppContextType = {
  mainViewModel: MainViewModel;
  setMainViewModel: (c: MainViewModel) => void;
};

export const AppContext = createContext<AppContextType>({
  mainViewModel: new MainViewModel(2020, 4),
  setMainViewModel: () => {},
});

export const useAppContext = () => useContext(AppContext);

