import { useEffect, useRef, type KeyboardEvent } from "react";

export function EditableText({
  value,
  label,
  placeholder,
  className = "",
  onChange,
}: {
  value: string;
  label: string;
  placeholder: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (spanRef.current && !isFocusedRef.current) {
      if (spanRef.current.textContent !== value) {
        spanRef.current.textContent = value;
      }
    }
  }, [value]);

  return (
    <span
      ref={(el) => {
        spanRef.current = el;
        if (el && !isFocusedRef.current && el.textContent !== value) {
          el.textContent = value;
        }
      }}
      className={`editable-text ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={label}
      data-placeholder={placeholder}
      title="Нажмите, чтобы изменить"
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onBlur={(event) => {
        isFocusedRef.current = false;
        const newText = event.currentTarget.textContent?.replace(/[\n\r]/g, " ") ?? "";
        onChange(newText);
      }}
      onInput={(event) => {
        const newText = event.currentTarget.textContent?.replace(/[\n\r]/g, " ") ?? "";
        onChange(newText);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
