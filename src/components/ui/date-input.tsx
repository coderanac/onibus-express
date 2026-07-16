import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
} from "react";
import { formatIsoToBrDate, maskDateInput, parseBrDateToIso } from "@/domain/date";

export interface DateInputHandle {
  openPicker: () => void;
  focus: () => void;
}

interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  error?: boolean;
  onChange: (value: string) => void;
}

function openNativePicker(input: HTMLInputElement | null) {
  if (!input) return;
  input.focus();
  if ("showPicker" in input) {
    (input as HTMLInputElement & { showPicker: () => void }).showPicker();
  }
}

export const DateInput = forwardRef<DateInputHandle, DateInputProps>(function DateInput(
  { id, value, onChange, error, className = "", ...props },
  ref,
) {
  const textInputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openPicker: () => openNativePicker(nativeInputRef.current),
    focus: () => textInputRef.current?.focus(),
  }));

  return (
    <div className="relative">
      <input
        {...props}
        id={id}
        ref={textInputRef}
        type="text"
        inputMode="numeric"
        placeholder={props.placeholder ?? "DD/MM/AAAA"}
        maxLength={10}
        value={value}
        onChange={(event) => onChange(maskDateInput(event.target.value))}
        aria-invalid={error}
        className={`${className} pr-9`}
      />
      <button
        type="button"
        aria-label="Abrir calendário"
        onClick={() => openNativePicker(nativeInputRef.current)}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-500 hover:text-primary-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z"
          />
        </svg>
      </button>
      <input
        ref={nativeInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={parseBrDateToIso(value) ?? ""}
        onChange={(event) => onChange(formatIsoToBrDate(event.target.value))}
        className="absolute inset-x-0 bottom-0 h-px w-full opacity-0"
      />
    </div>
  );
});
