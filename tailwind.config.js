/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#bae6fd", // sky-200
        "surface-container-low": "#f0f9ff", // sky-50
        "on-primary-container": "#0369a1", // sky-700
        "on-tertiary-fixed": "#0c4a6e", // sky-900
        "tertiary-fixed-dim": "#7dd3fc", // sky-300
        "inverse-surface": "#0f172a", // slate-900
        "outline": "#7dd3fc", // sky-300
        "primary-container": "#bae6fd", // sky-200
        "tertiary-fixed": "#e0f2fe", // sky-100
        "surface-bright": "#ffffff", // white
        "on-primary-fixed": "#082f49", // sky-900
        "on-error-container": "#991b1b", // red-800
        "surface-container": "#e0f2fe", // sky-100
        "secondary-fixed": "#dbeafe", // blue-100
        "surface-variant": "#e0f2fe", // sky-100
        "on-secondary-fixed": "#1e3a8a", // blue-900
        "on-secondary-container": "#1e40af", // blue-800
        "error": "#ef4444", // red-500
        "inverse-on-surface": "#f8fafc", // slate-50
        "primary": "#0ea5e9", // sky-500
        "primary-fixed-dim": "#38bdf8", // sky-400
        "on-tertiary-container": "#0369a1", // sky-700
        "on-tertiary": "#ffffff", // white
        "on-surface-variant": "#334155", // slate-700
        "background": "#f0f9ff", // sky-50
        "surface-container-high": "#e0f2fe", // sky-100
        "on-surface": "#0f172a", // slate-900
        "on-primary-fixed-variant": "#0284c7", // sky-600
        "surface-container-lowest": "#ffffff", // white
        "secondary": "#3b82f6", // blue-500
        "surface-dim": "#e2e8f0", // slate-200
        "surface": "#ffffff", // white
        "on-secondary": "#ffffff", // white
        "secondary-container": "#bfdbfe", // blue-200
        "on-background": "#0f172a", // slate-900
        "inverse-primary": "#bae6fd", // sky-200
        "tertiary-container": "#bae6fd", // sky-200
        "tertiary": "#0284c7", // sky-600
        "surface-tint": "#0ea5e9", // sky-500
        "error-container": "#fecaca", // red-200
        "secondary-fixed-dim": "#93c5fd", // blue-300
        "surface-container-highest": "#bae6fd", // sky-200
        "on-error": "#ffffff", // white
        "on-primary": "#ffffff", // white
        "primary-fixed": "#e0f2fe", // sky-100
        "on-secondary-fixed-variant": "#2563eb", // blue-600
        "on-tertiary-fixed-variant": "#0ea5e9" // sky-500
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.5rem",
        xl: "1rem",
        full: "9999px"
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
        caption: ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-xl": ["Outfit", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-lg-mobile": ["Outfit", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
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