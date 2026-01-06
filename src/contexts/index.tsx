import React, {
  createContext,
  type PropsWithChildren,
  useContext,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  DarkThemeWithResponsiveFontSizes as DarkTheme,
  LightThemeWithResponsiveFontSizes as LightTheme,
} from "../theme";

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <ColorModeContext.Provider
      value={{
        setMode: () => { },
        mode: "light",
      }}
    >
      <ThemeProvider theme={LightTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorModeContext = () => {
  const context = useContext(ColorModeContext);

  if (context === undefined) {
    throw new Error("useColorModeContext must be used within a ConfigProvider");
  }

  return context;
};
