import { createTheme } from "@nextui-org/react";

const theme = createTheme({
  type: "light",
  theme: {
    colors: {
      background: "#F7F7F7",
      default: "#2E74ED",

      primary: "#2E74ED",
      secondary: "#FFF",
      secondaryText: "#0F172A",
      secondarySolidContrast: "#0F172A",

      success: "#2fb380",
      error: "#da292e",
      warning: "#f4bd61",
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
