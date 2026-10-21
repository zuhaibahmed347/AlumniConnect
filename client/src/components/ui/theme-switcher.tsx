import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'alumni-connect-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return 'light'
}

function applyThemeToDOM(mode: ThemeMode, withTransition: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (withTransition) {
    root.classList.add('theme-transitioning')
  }

  if (mode === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
    root.style.colorScheme = 'light'
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    applyThemeToDOM(theme, false)
  }, [theme])

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      applyThemeToDOM(nextTheme, true)
      transitionTimeoutRef.current = window.setTimeout(() => {
        root.classList.remove('theme-transitioning')
      }, 450)
    }

    setThemeState(nextTheme)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Ignore storage errors
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
}

export function ThemeSwitcher({
  className,
  showLabel = false,
}: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ y: -1.5, scale: 1.02 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      aria-label={
        isDark ? 'Switch to Warm Alabaster light mode' : 'Switch to Midnight Obsidian dark mode'
      }
      title={
        isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'
      }
      className={cn(
        'relative inline-flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-primary/50 hover:bg-stone/70 transition-colors select-none shrink-0',
        className,
      )}
    >
      {/* Animated Sliding Track Indicator */}
      <span className="relative flex h-6 w-11 items-center rounded-lg bg-stone p-0.5 border border-border/80">
        {/* Background Track Icons */}
        <span className="flex w-full items-center justify-between px-1 text-secondary/60">
          <Sun className="h-3 w-3" aria-hidden="true" />
          <Moon className="h-3 w-3" aria-hidden="true" />
        </span>

        {/* Active Sliding Thumb */}
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 28,
          }}
          className={cn(
            'absolute top-0.5 bottom-0.5 flex w-5 items-center justify-center rounded-md shadow-sm',
            isDark
              ? 'right-0.5 bg-primary text-primary-foreground'
              : 'left-0.5 bg-card text-gold',
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="moon"
                initial={{ rotate: -65, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 65, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center"
              >
                <Moon className="h-3 w-3" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 65, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -65, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center"
              >
                <Sun className="h-3 w-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>

      {showLabel && (
        <span className="hidden sm:inline-block font-mono text-[11px] text-secondary tabular-nums pr-0.5">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </motion.button>
  )
}
