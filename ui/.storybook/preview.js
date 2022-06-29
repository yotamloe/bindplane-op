import { MockedProvider } from "@apollo/client/testing";
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material";
import { theme } from "../src/theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "centered",
  apolloClient: {
    MockedProvider,
  },
};

import { ThemeProvider as Emotion10ThemeProvider } from "emotion-theming";
import { MemoryRouter } from "react-router-dom";

const defaultTheme = createTheme();

// This is a workaround to style storybook with MUI v5
const withThemeProvider = (Story, context) => {
  return (
    <MemoryRouter>
      <Emotion10ThemeProvider theme={defaultTheme}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Story {...context} />
          </ThemeProvider>
        </StyledEngineProvider>
      </Emotion10ThemeProvider>
    </MemoryRouter>
  );
};

export const decorators = [withThemeProvider];
