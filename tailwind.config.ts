import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/*.tsx",
    "./src/components/admin/**/*.{ts,tsx}",
    "./src/components/ads/**/*.{ts,tsx}",
    "./src/components/public/**/*.{ts,tsx}",
    "./src/components/salon/**/*.{ts,tsx}",
    // Only include UI components that are actually imported in the project
    "./src/components/ui/accordion.tsx",
    "./src/components/ui/alert-dialog.tsx",
    "./src/components/ui/alert.tsx",
    "./src/components/ui/aspect-ratio.tsx",
    "./src/components/ui/avatar.tsx",
    "./src/components/ui/badge.tsx",
    "./src/components/ui/button.tsx",
    "./src/components/ui/card.tsx",
    "./src/components/ui/carousel.tsx",
    "./src/components/ui/checkbox.tsx",
    "./src/components/ui/collapsible.tsx",
    "./src/components/ui/dialog.tsx",
    "./src/components/ui/drawer.tsx",
    "./src/components/ui/dropdown-menu.tsx",
    "./src/components/ui/form.tsx",
    "./src/components/ui/icons.tsx",
    "./src/components/ui/input.tsx",
    "./src/components/ui/label.tsx",
    "./src/components/ui/pagination.tsx",
    "./src/components/ui/popover.tsx",
    "./src/components/ui/progress.tsx",
    "./src/components/ui/radio-group.tsx",
    "./src/components/ui/scroll-area.tsx",
    "./src/components/ui/select.tsx",
    "./src/components/ui/separator.tsx",
    "./src/components/ui/sheet.tsx",
    "./src/components/ui/skeleton.tsx",
    "./src/components/ui/slider.tsx",
    "./src/components/ui/switch.tsx",
    "./src/components/ui/table.tsx",
    "./src/components/ui/tabs.tsx",
    "./src/components/ui/textarea.tsx",
    "./src/components/ui/toast.tsx",
    "./src/components/ui/toaster.tsx",
    "./src/components/ui/toggle.tsx",
    "./src/components/ui/tooltip.tsx",
    "./src/lib/**/*.{ts,tsx}",
    "./src/data/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "var(--font-noto-sans-tc)",
          "Noto Sans TC",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")({
      // Only generate the prose modifiers that are actually used in the project
      className: 'prose',
    }),
  ],
} satisfies Config;

export default config;
