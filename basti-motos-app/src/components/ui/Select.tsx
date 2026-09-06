import { forwardRef, type SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, id, className = "", children, ...props },
  ref
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-field">
          {label}
        </label>
      )}
      <select ref={ref} id={id} className={`input-field ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1.5 text-sm text-racing-red">{error}</p>}
    </div>
  );
});
