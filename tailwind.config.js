/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { nunito: ['Nunito', 'sans-serif'] },
      colors: {
        duoOrange: '#FF9600',
        duoPurple: '#7828C8',
        duoGreen: '#58CC02',
        duoRed: '#FF4B4B',
        duoYellow: '#FFC800',
      },
    },
  },
  plugins: [],
};
