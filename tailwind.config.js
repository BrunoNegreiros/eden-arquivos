/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eden: {
          950: '#010101',
          900: '#111113', 
          800: '#1A1D21', 
          700: '#2B2D31', 
          600: '#3F4147', 
          100: '#F2F3F5', 
          1: '#fab005', 
          2: '#ff4800', 
        },
        // Cores de Elementos Refinadas (Com variantes de brilho e interação)
        sangue: {
          DEFAULT: '#991b1b',
          light: '#ef4444', // Para efeitos de hover e textos de alerta
          dark: '#7f1d1d',  // Para bordas e detalhes profundos
        },
        morte: {
          DEFAULT: '#1e1e24',
          light: '#3f3f46',
          dark: '#09090b',
        },
        conhecimento: {
          DEFAULT: '#d97706',
          light: '#fbbf24', // Usado nos botões de "Adicionar" do ConditionsCard
          dark: '#92400e',
        },
        energia: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa', // Usado para destacar o NEX e bônus ativos
          dark: '#5b21b6',
        },
        medo: {
          DEFAULT: '#f8fafc',
          light: '#ffffff',
          dark: '#cbd5e1',
        },
      },
    },
  },
  plugins: [],
}