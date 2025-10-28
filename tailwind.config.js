/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       animation: {
        'spin-slow': 'spin 4s linear infinite',  // slower (4s per rotation)
        'spin-slower': 'spin 8s linear infinite', // even slower (8s per rotation)
      },
    },
  },
  plugins: [],
};
