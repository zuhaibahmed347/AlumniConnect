import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { ChevronDown } from 'lucide-react'
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

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, icon, wrapperClassName, children, id, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold tracking-wide text-foreground/90 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 text-primary flex items-center"
            >
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border border-border bg-card py-2 pr-10 text-sm font-medium text-foreground shadow-sm transition-colors outline-none cursor-pointer hover:border-primary/45 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 [&>option]:bg-card [&>option]:text-foreground [&>option]:py-2',
              icon ? 'pl-10' : 'pl-3.5',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 h-4 w-4 text-secondary transition-transform duration-200"
          />
        </div>
      </div>
    )
  },
)
SelectField.displayName = 'SelectField'

export { Input, SelectField }
