/**
 * Design System - UI Styles
 * Classes utilitárias Tailwind padronizadas
 */

export const uiStyles = {
  // Typography
  typography: {
    h1: 'text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50',
    h2: 'text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50',
    h3: 'text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50',
    h4: 'text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50',
    h5: 'text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50',
    h6: 'text-sm md:text-base font-semibold text-gray-900 dark:text-gray-50',
    subtitle: 'text-base md:text-lg text-gray-600 dark:text-gray-400',
    body: 'text-sm md:text-base text-gray-700 dark:text-gray-300',
    bodySmall: 'text-xs md:text-sm text-gray-600 dark:text-gray-400',
    caption: 'text-xs text-gray-500 dark:text-gray-500',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    muted: 'text-sm text-muted-foreground',
  },

  // Containers
  container: {
    page: 'min-h-screen bg-gray-50 dark:bg-gray-950',
    content: 'container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8',
    section: 'space-y-6',
    grid: 'grid gap-4 md:gap-6',
    gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
    gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
  },

  // Cards
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
    hover: 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700',
    interactive: 'cursor-pointer hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 hover:scale-[1.01] transition-all duration-200',
    header: 'flex flex-col space-y-1.5 p-6',
    title: 'text-2xl font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },

  // Buttons (complementar ao shadcn/ui)
  button: {
    group: 'inline-flex items-center gap-2',
    icon: 'inline-flex items-center justify-center',
    loading: 'opacity-50 cursor-not-allowed pointer-events-none',
  },

  // Forms
  form: {
    group: 'space-y-2',
    label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    error: 'text-xs text-destructive mt-1',
    helper: 'text-xs text-muted-foreground mt-1',
  },

  // Status indicators
  status: {
    badge: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    dot: 'inline-block w-2 h-2 rounded-full mr-1.5',
  },

  // Progress
  progress: {
    container: 'w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2',
    bar: 'h-full rounded-full transition-all duration-500 ease-out',
    label: 'flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1',
  },

  // Dividers
  divider: {
    horizontal: 'border-t border-gray-200 dark:border-gray-800',
    vertical: 'border-l border-gray-200 dark:border-gray-800',
    withText: 'relative flex items-center text-xs uppercase text-muted-foreground',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
    skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-800 rounded',
    pulse: 'animate-pulse',
  },

  // Animations
  animation: {
    fadeIn: 'animate-in fade-in duration-200',
    fadeOut: 'animate-out fade-out duration-200',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
    slideOut: 'animate-out slide-out-to-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
    scaleOut: 'animate-out zoom-out-95 duration-200',
  },

  // Spacing utilities
  spacing: {
    section: 'mb-6 md:mb-8',
    sectionLarge: 'mb-8 md:mb-12',
    element: 'mb-4',
    elementSmall: 'mb-2',
  },

  // Borders
  border: {
    base: 'border border-gray-200 dark:border-gray-800',
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    rounded: 'rounded-lg',
    roundedFull: 'rounded-full',
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    hover: 'hover:shadow-lg transition-shadow duration-200',
  },
} as const;

export type UIStyles = typeof uiStyles;
