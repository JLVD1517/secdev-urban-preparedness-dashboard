import React from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { lightTheme, darkTheme } from './configuration/theme-color-config';

interface ThemeContainerProps {
  children: React.ReactNode;
  darkThemeEnabled: boolean;
}

const ThemeContainer: React.FC<ThemeContainerProps> = ({
  children,
  darkThemeEnabled,
}) => {
  return (
    <ThemeProvider theme={darkThemeEnabled ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeContainer;
