import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kanal ko'rinishida beriladi — aks holda `bg-primary/10` kabi
        // shaffoflik modifikatorlari hech qanday CSS hosil qilmaydi.
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        line: "var(--line)",
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        tertiary: "rgb(var(--tertiary-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        "danger-deep": "rgb(var(--danger-deep-rgb) / <alpha-value>)",

        "primary-accent": "rgb(var(--primary-accent-rgb) / <alpha-value>)",
        "foreground-accent": "var(--foreground-accent)",
        "hero-background": "var(--hero-background)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(to right, var(--primary), var(--secondary))',
      },
      // Barcha soyalar binafsha/ko'k tusda — sof qora soya ishlatilmaydi.
      boxShadow: {
        glow: '0 0 20px -5px rgba(103, 80, 164, 0.5)',
        'glow-lg': '0 0 30px -5px rgba(48, 79, 255, 0.55)',
        'glow-card': '0 0 30px -10px rgba(103, 80, 164, 0.35)',
        'glow-soft': '0 0 50px -10px rgba(103, 80, 164, 0.18)',
        'glow-cream': '0 0 20px rgba(253, 224, 150, 0.6)',
        'input-focus': '0 10px 20px -10px rgba(103, 80, 164, 0.3)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
        'spin-slower': 'spin 15s linear infinite reverse',
        'caret-blink': 'caret-blink 1s step-end infinite',
        marquee: 'marquee 60s linear infinite',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
