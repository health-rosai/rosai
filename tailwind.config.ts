import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        phase: {
          1: "hsl(var(--phase-1))",
          "1-light": "hsl(var(--phase-1-light))",
          "1-dark": "hsl(var(--phase-1-dark))",
          "1-foreground": "hsl(var(--phase-1-foreground))",
          2: "hsl(var(--phase-2))",
          "2-light": "hsl(var(--phase-2-light))",
          "2-dark": "hsl(var(--phase-2-dark))",
          "2-foreground": "hsl(var(--phase-2-foreground))",
          3: "hsl(var(--phase-3))",
          "3-light": "hsl(var(--phase-3-light))",
          "3-dark": "hsl(var(--phase-3-dark))",
          "3-foreground": "hsl(var(--phase-3-foreground))",
          4: "hsl(var(--phase-4))",
          "4-light": "hsl(var(--phase-4-light))",
          "4-dark": "hsl(var(--phase-4-dark))",
          "4-foreground": "hsl(var(--phase-4-foreground))",
          5: "hsl(var(--phase-5))",
          "5-light": "hsl(var(--phase-5-light))",
          "5-dark": "hsl(var(--phase-5-dark))",
          "5-foreground": "hsl(var(--phase-5-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderColor: {
        DEFAULT: "hsl(var(--border))",
        border: "hsl(var(--border))",
      },
    },
  },
  plugins: [],
} satisfies Config;