import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(-5%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        "spin-slow": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        },
        "fade-in-slide": {
          "0%": {
            opacity: "0",
            transform: "translateY(4px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-out": {
          "0%": {
            opacity: "1"
          },
          "100%": {
            opacity: "0"
          }
        },
        "slide-in-from-bottom": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1"
          }
        },
        "slide-in-from-left": {
          "0%": {
            transform: "translateX(-20px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "slide-in-from-right": {
          "0%": {
            transform: "translateX(20px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.9)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "scale-out": {
          "0%": {
            transform: "scale(1)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(0.95)",
            opacity: "0"
          }
        },
        "shake": {
          "10%, 90%": {
            transform: "translateX(-1px)"
          },
          "20%, 80%": {
            transform: "translateX(2px)"
          },
          "30%, 50%, 70%": {
            transform: "translateX(-4px)"
          },
          "40%, 60%": {
            transform: "translateX(4px)"
          }
        },
        "ping-slow": {
          "75%, 100%": {
            transform: "scale(1.1)",
            opacity: "0"
          }
        },
        "pulse-ring": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0.5"
          },
          "50%": {
            transform: "scale(1)",
            opacity: "0.3"
          },
          "100%": {
            transform: "scale(1.3)",
            opacity: "0"
          }
        },
        "shimmer": {
          "100%": {
            transform: "translateX(100%)"
          }
        },
        "orbit": {
          "0%": {
            transform: "rotate(0deg) translateX(10px) rotate(0deg)"
          },
          "100%": {
            transform: "rotate(360deg) translateX(10px) rotate(-360deg)"
          }
        },
        "orbit-reverse": {
          "0%": {
            transform: "rotate(0deg) translateX(12px) rotate(0deg)"
          },
          "100%": {
            transform: "rotate(-360deg) translateX(12px) rotate(360deg)"
          }
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-8px)",
          }
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 100%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 100%",
            "background-position": "right center"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-slow": "bounce-slow 3s infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
        "fade-in-slide": "fade-in-slide 0.3s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.4s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.4s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-out": "scale-out 0.3s ease-in",
        "shake": "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
        "ping-slow": "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite",
        "shimmer": "shimmer 1.5s infinite",
        "orbit": "orbit 12s linear infinite",
        "orbit-reverse": "orbit-reverse 10s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
} satisfies Config;
