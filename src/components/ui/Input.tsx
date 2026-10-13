import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2
            bg-white border rounded-lg
            text-slate-900 placeholder:text-slate-400
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-slate-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }