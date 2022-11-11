import { createTheme } from "@nextui-org/react";

const theme = createTheme({
  type: "light",
  theme: {
    colors: {
      background: "#F7F7F7",
      default: "#2E74ED",

      primary: "#2E74ED",
      secondary: "#EFEFEF",
      secondaryText: "#333",

      error: "$red600",
      warning: "#ffecb5",
      warningText: "#664d03",
      warningBorder: "#ffecb5",

      link: "#2E74ED",
      text: "#000",

      gray: "#64748B",

      // Special colors
      gold: "#C9B037",
      silver: "#D7D7D7",
      bronze: "#AD8A56",
    },
    space: {},
    fonts: {
      sans: "'Inter', sans-serif;",
    },
    breakpoints: {},
  },
});

export default theme;
