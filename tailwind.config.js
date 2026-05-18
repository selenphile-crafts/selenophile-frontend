/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#e0bfbd",
        "surface-container-low": "#d7faff",
        "on-primary-container": "#ff918f",
        "on-tertiary-fixed": "#3c031f",
        "tertiary-fixed-dim": "#ffb0cb",
        "inverse-surface": "#133539",
        "outline": "#8c706f",
        "primary-container": "#880d1e",
        "tertiary-fixed": "#ffd9e3",
        "surface-bright": "#ebfdff",
        "on-primary-fixed": "#410007",
        "on-error-container": "#93000a",
        "surface-container": "#d1f4f9",
        "secondary-fixed": "#ffdada",
        "surface-variant": "#c6e9ee",
        "on-secondary-fixed": "#40000b",
        "on-secondary-container": "#fffbff",
        "error": "#ba1a1a",
        "inverse-on-surface": "#d4f7fc",
        "primary": "#620010",
        "primary-fixed-dim": "#ffb3b1",
        "on-tertiary-container": "#ed96b5",
        "on-tertiary": "#ffffff",
        "on-surface-variant": "#594140",
        "background": "#ebfdff",
        "surface-container-high": "#cbeef3",
        "on-surface": "#001f23",
        "on-primary-fixed-variant": "#8d1221",
        "surface-container-lowest": "#ffffff",
        "secondary": "#b90734",
        "surface-dim": "#bee0e5",
        "surface": "#ebfdff",
        "on-secondary": "#ffffff",
        "secondary-container": "#dc2c4a",
        "on-background": "#001f23",
        "inverse-primary": "#ffb3b1",
        "tertiary-container": "#6e2c47",
        "tertiary": "#521631",
        "surface-tint": "#af2d36",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#ffb3b5",
        "surface-container-highest": "#c6e9ee",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "primary-fixed": "#ffdad8",
        "on-secondary-fixed-variant": "#920026",
        "on-tertiary-fixed-variant": "#73304b"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        base: "8px",
        "margin-mobile": "16px",
        gutter: "24px",
        "margin-desktop": "64px",
        "container-max": "1200px",
        "section-gap": "80px"
      },
      fontFamily: {
        caption: ["Hanken Grotesk"],
        "body-lg": ["Hanken Grotesk"],
        "headline-xl": ["Source Serif 4"],
        "label-md": ["Hanken Grotesk"],
        "headline-lg": ["Source Serif 4"],
        "headline-md": ["Source Serif 4"],
        "headline-lg-mobile": ["Source Serif 4"],
        "body-md": ["Hanken Grotesk"]
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: []
}