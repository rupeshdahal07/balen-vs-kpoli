/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nc: '#0033A0', // Nepali Congress
        uml: '#E3000F', // CPN UML
        maoist: '#E3000F', // Maoist
        rsp: '#002E5D', // RSP
        rpp: '#0A7A3B', // RPP
        janajmat: '#E92428', // Janamat Party
        jsp: '#ED1B24', // JSP
        nsp: '#16A34A', // arbitrary green
        independent: '#64748B', // gray
        accent: '#3b82f6',
        darkbg: '#0f172a',
        darkcard: '#1e293b'
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
