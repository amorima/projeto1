tailwind.config = {
  theme: {
    extend: {
      colors: {
        "Main-Primary": "#1B9AAA", // cor primária
        "Main-Secondary": "#126B76",
        "brand-secondary": "#126B76", // cor secundária
        "Button-Main": "#126B76", // cor secundária
        "Background-Card-Bg-Gami": "#F7F7F7",
        "Text-Subtitles": "#808080",
        "Components-Limit-Color":"",//Gradiente
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          "Space Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
    },
  },
};