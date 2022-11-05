import { createTheme } from "@nextui-org/react";

const theme = createTheme({
  type: "light",
  theme: {
    colors: {
      default: "#2E74ED",

      primary: "#2E74ED",
      secondary: "#EFEFEF",
      secondaryText: "#333",

      gradient: "linear-gradient(to right, #f7b733, #fc4a1a);",
      link: "#333",
      text: "#333",
    },
    space: {},
    fonts: {
      sans: "'Inter', sans-serif;",
    },
  },
});

export default theme;
