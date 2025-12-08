/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Baseado no tema Dark do Discord + Ordem Paranormal
        eden: {
          900: '#111113', // Fundo Profundo (Main Background)
          800: '#1A1D21', // Cartões / Paineis
          700: '#2B2D31', // Inputs / Elementos Secundários
          600: '#3F4147', // Bordas Sutis
          100: '#F2F3F5', // Texto Principal
        },
        // Cores dos Elementos
        sangue: '#991b1b',
        morte: '#1e1e24',
        conhecimento: '#d97706',
        energia: '#7c3aed',
        medo: '#fffffe',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier Prime', 'monospace'],
      }
    },
  },
  plugins: [],
}