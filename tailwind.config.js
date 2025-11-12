/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // ✅ includes global CSS files like tools.css
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ffc50c",   // Cralite Yellow
        "primary-dark": "#e6b30b", // Slightly darker hover version
        secondary: "#070026", // Cralite Dark Navy
        "secondary-light": "#11004d",
      },
      fontFamily: {
        sofia: ["Sofia Pro", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 10px rgba(12, 12, 12, 0.04)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
}
