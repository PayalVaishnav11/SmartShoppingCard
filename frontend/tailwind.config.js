module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
       colors: {
        primary: "#1368ff",
        accent: "#06b6d4",
        card: "#ffffff",
        page: "#f7fafc",
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
      }
    },
  },
  plugins: [],
}
