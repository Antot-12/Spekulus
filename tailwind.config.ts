import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-space-grotesk)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in-up': {
            '0%': {
              opacity: '0',
              transform: 'translateY(1rem)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0)',
            },
        },
        'slide-in-from-left': { '0%': { transform: 'translateX(-2rem)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        'slide-in-from-right': { '0%': { transform: 'translateX(2rem)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 60s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-from-left': 'slide-in-from-left 0.6s ease-out forwards',
        'slide-in-from-right': 'slide-in-from-right 0.6s ease-out forwards',
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground) / 0.9)',
            '--tw-prose-headings': 'hsl(var(--primary))',
            '--tw-prose-lead': 'hsl(var(--foreground) / 0.8)',
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--primary) / 0.7)',
            '--tw-prose-bullets': 'hsl(var(--primary))',
            '--tw-prose-hr': 'hsl(var(--border) / 0.5)',
            '--tw-prose-quotes': 'hsl(var(--foreground) / 0.8)',
            '--tw-prose-quote-borders': 'hsl(var(--primary))',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--primary))',
            '--tw-prose-pre-code': 'hsl(var(--foreground) / 0.9)',
            '--tw-prose-pre-bg': 'hsl(var(--muted) / 0.5)',
            '--tw-prose-th-borders': 'hsl(var(--border))',
            '--tw-prose-td-borders': 'hsl(var(--border))',
            '--tw-prose-invert-body': 'hsl(var(--foreground) / 0.9)',
            '--tw-prose-invert-headings': 'hsl(var(--primary))',
            '--tw-prose-invert-lead': 'hsl(var(--foreground) / 0.8)',
            '--tw-prose-invert-links': 'hsl(var(--primary))',
            '--tw-prose-invert-bold': 'hsl(var(--foreground))',
            '--tw-prose-invert-counters': 'hsl(var(--primary) / 0.7)',
            '--tw-prose-invert-bullets': 'hsl(var(--primary))',
            '--tw-prose-invert-hr': 'hsl(var(--border) / 0.5)',
            '--tw-prose-invert-quotes': 'hsl(var(--foreground) / 0.8)',
            '--tw-prose-invert-quote-borders': 'hsl(var(--primary))',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-invert-code': 'hsl(var(--primary))',
            '--tw-prose-invert-pre-code': 'hsl(var(--foreground) / 0.9)',
            '--tw-prose-invert-pre-bg': 'hsl(var(--muted) / 0.5)',
            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
            '--tw-prose-invert-td-borders': 'hsl(var(--border))',
            h1: { fontFamily: theme('fontFamily.headline'), fontWeight: '700', textShadow: '0 0 15px hsl(var(--primary) / 0.5)' },
            h2: { fontFamily: theme('fontFamily.headline'), fontWeight: '700', borderBottomWidth: '1px', borderBottomColor: 'hsl(var(--border) / 0.5)', paddingBottom: theme('spacing.2') },
            h3: { fontFamily: theme('fontFamily.headline'), fontWeight: '600' },
            blockquote: { paddingLeft: theme('spacing.4'), borderLeftWidth: '4px', fontStyle: 'italic', backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: `0 ${theme('borderRadius.lg')} ${theme('borderRadius.lg')} 0` },
            a: { textDecoration: 'none', transition: 'all 0.2s ease-in-out', '&:hover': { textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))' } },
            'ul > li::marker': { color: 'hsl(var(--primary))' },
            'ol > li::marker': { color: 'hsl(var(--primary))' },
            code: { backgroundColor: 'hsl(var(--muted))', padding: '0.2em 0.4em', margin: '0', fontSize: '85%', borderRadius: '6px', fontFamily: theme('fontFamily.code') },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { border: '1px solid hsl(var(--border) / 0.5)' },
            hr: { borderStyle: 'dotted' },
          },
        },
      }),
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
