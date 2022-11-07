import { createTheme } from "@nextui-org/react";

const theme = createTheme({
  type: "light",
  theme: {
    colors: {
      default: "#2E74ED",

      primary: "#2E74ED",
      secondary: "#EFEFEF",
      secondaryText: "#333",

      warning: "#ffecb5",
      warningText: "#664d03",
      warningBorder: "#ffecb5",

      link: "#2E74ED",
      text: "#333",
    },
    space: {},
    fonts: {
      sans: "'Inter', sans-serif;",
    },
    breakpoints: {},
  },
});

export default theme;
