import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from 'cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-secondary/80 hover:border-primary/45 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  icon?: React.ReactNode
  wrapperClassName?: string
}

interface ParsedOption {
  value: string
  label: string
  disabled?: boolean
}

function extractOptionsFromChildren(
  children: React.ReactNode,
): ParsedOption[] {
  const options: ParsedOption[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === React.Fragment) {
      options.push(
        ...extractOptionsFromChildren(
          (child.props as { children?: React.ReactNode }).children,
        ),
      )
      return
    }
    if (child.type === 'option') {
      const props = child.props as {
        value?: string | number
        children?: React.ReactNode
        disabled?: boolean
      }
      const rawText = React.Children.toArray(props.children)
        .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
        .join('')
        .trim()
      const val =
        props.value !== undefined ? String(props.value) : rawText
      options.push({
        value: val,
        label: rawText || val,
        disabled: props.disabled,
      })
    }
  })
  return options
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      label,
      icon,
      wrapperClassName,
      children,
      id,
      value,
      defaultValue,
      onChange,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId
    const containerRef = React.useRef<HTMLDivElement>(null)
    const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null)

    const options = React.useMemo(
      () => extractOptionsFromChildren(children),
      [children],
    )

    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<string>(() => {
      if (value !== undefined) return String(value)
      if (defaultValue !== undefined) return String(defaultValue)
      return options[0]?.value ?? ''
    })

    const currentValue = isControlled ? String(value) : internalValue
    const [isOpen, setIsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1)

    const selectedOption = React.useMemo(
      () =>
        options.find((opt) => opt.value === currentValue) ??
        options[0] ?? { value: '', label: 'Select option' },
      [options, currentValue],
    )

    // Close custom menu when clicking outside
    React.useEffect(() => {
      if (!isOpen) return
      const handlePointerDown = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handlePointerDown)
      return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen])

    const triggerSelection = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: nextValue, name: props.name ?? '' },
          currentTarget: { value: nextValue, name: props.name ?? '' },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }
      setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!isOpen) {
          const currentIdx = options.findIndex(
            (o) => o.value === currentValue,
          )
          setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0)
          setIsOpen(true)
        } else if (
          highlightedIndex >= 0 &&
          highlightedIndex < options.length &&
          !options[highlightedIndex].disabled
        ) {
          triggerSelection(options[highlightedIndex].value)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen) {
          const currentIdx = options.findIndex(
            (o) => o.value === currentValue,
          )
          setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0)
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) =>
            prev + 1 < options.length ? prev + 1 : 0,
          )
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) =>
            prev - 1 >= 0 ? prev - 1 : options.length - 1,
          )
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    return (
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-1.5 relative', wrapperClassName)}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-mono uppercase tracking-wider font-bold text-foreground/90 select-none flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {label}
          </label>
        )}

        {/* Hidden native select for form/ref compatibility */}
        <select
          ref={(node) => {
            nativeSelectRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          value={currentValue}
          onChange={(e) => triggerSelection(e.target.value)}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none"
          {...props}
        >
          {children}
        </select>

        {/* Custom Tactile Dropdown Trigger */}
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            if (disabled) return
            const currentIdx = options.findIndex(
              (o) => o.value === currentValue,
            )
            setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0)
            setIsOpen((prev) => !prev)
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'group relative h-11 w-full rounded-xl border bg-card py-2 pr-10 text-left text-sm font-semibold text-foreground shadow-sm transition-all outline-none cursor-pointer flex items-center justify-between gap-2',
            isOpen
              ? 'border-primary ring-2 ring-primary/20 bg-accent/25'
              : 'border-border hover:border-primary/50 hover:bg-stone/40',
            icon ? 'pl-10' : 'pl-3.5',
            disabled && 'pointer-events-none opacity-50',
            className,
          )}
        >
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 text-primary flex items-center"
            >
              {icon}
            </span>
          )}

          <span className="truncate text-foreground font-medium">
            {selectedOption.label}
          </span>

          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute right-2.5 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-200',
              isOpen
                ? 'bg-primary text-primary-foreground rotate-180'
                : 'bg-stone text-secondary group-hover:text-primary',
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </button>

        {/* Animated Custom Dropdown Menu Listbox */}
        <AnimatePresence>
          {isOpen && options.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              role="listbox"
              aria-labelledby={selectId}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-dropdown rounded-2xl border border-border bg-card p-1.5 shadow-card-hover max-h-68 overflow-y-auto space-y-0.5 ring-1 ring-primary/15"
            >
              <div className="px-2.5 py-1.5 border-b border-border/70 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-secondary">
                <span className="inline-flex items-center gap-1 text-primary font-bold">
                  <Sparkles className="h-3 w-3" />
                  Select Option
                </span>
                <span>{options.length} choices</span>
              </div>

              {options.map((opt, idx) => {
                const isSelected = opt.value === currentValue
                const isHighlighted = idx === highlightedIndex
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => triggerSelection(opt.value)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2.5 cursor-pointer',
                      isSelected
                        ? 'bg-accent text-accent-foreground font-bold border border-primary/30 shadow-2xs'
                        : isHighlighted
                          ? 'bg-stone text-foreground font-medium'
                          : 'text-foreground/90 hover:bg-stone/70 hover:text-foreground',
                      opt.disabled && 'opacity-40 pointer-events-none',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full shrink-0 transition-colors',
                          isSelected
                            ? 'bg-primary'
                            : isHighlighted
                              ? 'bg-gold'
                              : 'bg-border',
                        )}
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary text-primary-foreground shrink-0">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
SelectField.displayName = 'SelectField'

export { Input, SelectField }
