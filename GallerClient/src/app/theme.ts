import { extendTheme } from "@mui/joy";

declare module "@mui/joy/Button" {
  interface ButtonPropsSizeOverrides {
    xs: true;
    xxs: true;
  }
}

declare module "@mui/joy/styles" {
  interface PaletteBackground {
    headerBackground: string;
    armBackground: string;
    logo: string;
    armTree: string;
    toCardBackground: string;
    shiftOperationDropCell: string;
  }

  interface Palette {
    background: PaletteBackground;
  }
}

const theme = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.size === "xs" && {
            "--Icon-fontSize": "1rem",
            "--Button-gap": "0.25rem",
            "--CircularProgress-size": "1rem", 
            minHeight: "var(--Button-minHeight, 1.75rem)",
            fontSize: theme.vars.fontSize.xs,
            paddingBlock: "2px",
            paddingInline: "0.5rem",
          }),
          ...(ownerState.size === "xxs" && {
            "--Icon-fontSize": "0.75rem",
            "--Button-gap": "0.20rem",
            "--CircularProgress-size": "0.75rem", 
            minHeight: "var(--Button-minHeight, 1rem)",
            fontSize: theme.vars.fontSize.xs,
            paddingBlock: "1px",
            paddingInline: "0.25rem",
          }),
        }),
      },
    },
  },

  colorSchemes: {
    light: {
      palette: {
        background: {
          headerBackground: "#efeeee",
          armBackground: "#f4f4f4",
          logo: "#efeeee",
          armTree: "#fcfcfc",
          toCardBackground: "#12e0c5",
          shiftOperationDropCell: "#a6f3b7",
        },
      },
    },
    dark: {
      palette: {
        background: {
          headerBackground: "#191922b0",
          armBackground: "#151515",
          logo: "#355233eb",
          armTree: "#191922b0",
          toCardBackground: "#0c423b",
          shiftOperationDropCell: "#2b8940",
        },
      },
    },
  },
});

export default theme;
