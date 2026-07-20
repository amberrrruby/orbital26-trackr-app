"use client";

import styles from "./Input.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
};

export function Input({
  label,
  error,
  helper,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={[
          styles.input,
          error ? styles.inputError : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <span className={styles.error}>{error}</span>}
      {!error && helper && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helper?: string;
};

export function Textarea({
  label,
  error,
  helper,
  id,
  className,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        id={inputId}
        className={[
          styles.textarea,
          error ? styles.inputError : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <span className={styles.error}>{error}</span>}
      {!error && helper && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
};

export function Select({
  label,
  error,
  helper,
  id,
  className,
  options,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}

      <select
        {...props}
        id={selectId}
        className={[
          styles.input,
          error ? styles.inputError : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && <span className={styles.error}>{error}</span>}
      {!error && helper && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}
