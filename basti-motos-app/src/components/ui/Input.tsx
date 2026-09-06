import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, id, className = "", ...props },
  ref
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-field">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={`input-field ${className}`} {...props} />
      {error && <p className="mt-1.5 text-sm text-racing-red">{error}</p>}
    </div>
  );
});
