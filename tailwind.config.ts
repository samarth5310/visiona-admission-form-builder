
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Student theme colors
				'student-primary': 'hsl(var(--student-primary))',
				'student-primary-variant': 'hsl(var(--student-primary-variant))',
				'student-secondary': 'hsl(var(--student-secondary))',
				'student-secondary-variant': 'hsl(var(--student-secondary-variant))',
				'student-background': 'hsl(var(--student-background))',
				'student-surface': 'hsl(var(--student-surface))',
				'student-error': 'hsl(var(--student-error))',
				'student-on-primary': 'hsl(var(--student-on-primary))',
				'student-on-secondary': 'hsl(var(--student-on-secondary))',
				'student-on-background': 'hsl(var(--student-on-background))',
				'student-on-surface': 'hsl(var(--student-on-surface))',
				'student-on-error': 'hsl(var(--student-on-error))',
				// Admin theme colors (same as student theme for consistency)
				'admin-primary': 'hsl(var(--admin-primary))',
				'admin-primary-variant': 'hsl(var(--admin-primary-variant))',
				'admin-secondary': 'hsl(var(--admin-secondary))',
				'admin-secondary-variant': 'hsl(var(--admin-secondary-variant))',
				'admin-background': 'hsl(var(--admin-background))',
				'admin-surface': 'hsl(var(--admin-surface))',
				'admin-error': 'hsl(var(--admin-error))',
				'admin-on-primary': 'hsl(var(--admin-on-primary))',
				'admin-on-secondary': 'hsl(var(--admin-on-secondary))',
				'admin-on-background': 'hsl(var(--admin-on-background))',
				'admin-on-surface': 'hsl(var(--admin-on-surface))',
				'admin-on-error': 'hsl(var(--admin-on-error))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				marquee: {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'marquee-slow': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'marquee-fast': {
					'0%': {
						transform: 'translateX(0%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				marquee: 'marquee 40s linear infinite',
				'marquee-slow': 'marquee-slow 60s linear infinite',
				'marquee-fast': 'marquee-fast 30s linear infinite',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
