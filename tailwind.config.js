/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-main': 'var(--accent-main)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-rose': 'var(--accent-rose)',
        'glass-border': 'var(--glass-border)',
      },
      backgroundColor: {
        'glass': 'var(--glass-bg)',
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
      },
      boxShadow: {
        'glow': '0 0 15px var(--accent-glow)',
        'glow-lg': '0 0 30px var(--accent-glow)',
        'glow-rose': '0 0 15px rgba(255, 42, 109, 0.4)',
        'glow-cyan': '0 0 15px rgba(0, 217, 245, 0.4)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 0.15s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px var(--accent-glow)' },
          '50%': { boxShadow: '0 0 20px var(--accent-glow), 0 0 30px var(--accent-glow)' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '5%, 10%': { opacity: '0.7' },
          '15%': { opacity: '1' },
        },
      },
      maxWidth: {
        'ultra': '1600px',
      },
      fontSize: {
        'hud': ['48px', { fontFamily: 'Orbitron' }],
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}