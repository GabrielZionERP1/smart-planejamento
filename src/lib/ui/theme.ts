/**
 * Design System - Theme Tokens
 * Tokens de design centralizados para o sistema SMART
 */

export const theme = {
  colors: {
    primary: {
      50: 'hsl(221, 83%, 97%)',
      100: 'hsl(221, 83%, 93%)',
      200: 'hsl(221, 83%, 85%)',
      300: 'hsl(221, 83%, 73%)',
      400: 'hsl(221, 83%, 62%)',
      500: 'hsl(221, 83%, 53%)', // main
      600: 'hsl(221, 83%, 45%)',
      700: 'hsl(221, 83%, 37%)',
      800: 'hsl(221, 83%, 29%)',
      900: 'hsl(221, 83%, 21%)',
      950: 'hsl(221, 83%, 13%)',
    },
    secondary: {
      50: 'hsl(262, 52%, 97%)',
      100: 'hsl(262, 52%, 93%)',
      200: 'hsl(262, 52%, 85%)',
      300: 'hsl(262, 52%, 73%)',
      400: 'hsl(262, 52%, 62%)',
      500: 'hsl(262, 52%, 53%)', // main
      600: 'hsl(262, 52%, 45%)',
      700: 'hsl(262, 52%, 37%)',
      800: 'hsl(262, 52%, 29%)',
      900: 'hsl(262, 52%, 21%)',
      950: 'hsl(262, 52%, 13%)',
    },
    success: {
      50: 'hsl(142, 76%, 97%)',
      100: 'hsl(142, 76%, 92%)',
      500: 'hsl(142, 76%, 36%)',
      600: 'hsl(142, 76%, 30%)',
      700: 'hsl(142, 76%, 24%)',
    },
    warning: {
      50: 'hsl(38, 92%, 95%)',
      100: 'hsl(38, 92%, 88%)',
      500: 'hsl(38, 92%, 50%)',
      600: 'hsl(38, 92%, 42%)',
      700: 'hsl(38, 92%, 34%)',
    },
    danger: {
      50: 'hsl(0, 86%, 97%)',
      100: 'hsl(0, 86%, 93%)',
      500: 'hsl(0, 86%, 59%)',
      600: 'hsl(0, 86%, 51%)',
      700: 'hsl(0, 86%, 43%)',
    },
    info: {
      50: 'hsl(199, 89%, 96%)',
      100: 'hsl(199, 89%, 90%)',
      500: 'hsl(199, 89%, 48%)',
      600: 'hsl(199, 89%, 40%)',
      700: 'hsl(199, 89%, 32%)',
    },
    neutral: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 96%)',
      200: 'hsl(0, 0%, 90%)',
      300: 'hsl(0, 0%, 83%)',
      400: 'hsl(0, 0%, 64%)',
      500: 'hsl(0, 0%, 45%)',
      600: 'hsl(0, 0%, 32%)',
      700: 'hsl(0, 0%, 25%)',
      800: 'hsl(0, 0%, 15%)',
      900: 'hsl(0, 0%, 9%)',
      950: 'hsl(0, 0%, 4%)',
    },
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem', // 48px
    '4xl': '4rem', // 64px
    '5xl': '5rem', // 80px
    '6xl': '6rem', // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Theme = typeof theme;
