"use client";

import { useId, type ReactNode } from "react";

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {hint && <p className="field-hint mt-1">{hint}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  dir?: "ltr" | "rtl";
  required?: boolean;
}

export function TextField({ label, value, onChange, max, placeholder, hint, multiline, rows = 3, dir, required }: TextFieldProps) {
  const id = useId();
  const near = value.length > max * 0.8;
  const props = {
    id,
    value,
    maxLength: max,
    placeholder,
    dir,
    required,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    className: "input",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        <span>{label}</span>
        {near && <small>{value.length}/{max}</small>}
      </label>
      {multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p id={id} className="text-sm font-semibold">{label}</p>
        {hint && <p className="field-hint mt-0.5">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="switch mt-0.5" onClick={() => onChange(!checked)} />
    </div>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string; lang?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" lang={o.lang} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
