import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#4abaeb",
      dark: "#4abaeb",
    },
    secondary: {
      main: "#595a5c",
    },
  },
  typography: {
    allVariants: {
      color: "#2f2f31",
    },
    fontFamily: "'Nunito Sans', sans-serif;",
    fontWeightBold: 600,
    button: {
      fontWeight: 700,
    },
  },

  components: {
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: "none",
          borderRadius: 20,
          boxShadow: "none",
        },
        outlined: {
          textTransform: "none",
          borderRadius: 20,
        },
        text: {
          textTransform: "none",
          borderRadius: 20,
        },
        containedPrimary: {
          color: "#ffffff",
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
