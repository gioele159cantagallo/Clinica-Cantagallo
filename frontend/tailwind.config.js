/** @type {import('tailwindcss').config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#0d47a1',      // Il blu scuro della barra in alto
        'kpi-green': '#2e7d32',       // Verde "% in range"
        'kpi-blue': '#1976d2',        // blu "Pazienti monitorati"
        'kpi-red': '#c62828',         // rosso card "A rischio"
        'sidebar-bg': '#f8f9fa',      // grigio chiarissimo per la sidebar
        'danger': '#d32f2f',          // rosso per bottoni urgenti
      },
      fontFamily: {
        'sans': ['Inter', 'Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}