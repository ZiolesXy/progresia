import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    action?: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}
        {...props}
      >
        {(title || action) && (
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
export type { CardProps }