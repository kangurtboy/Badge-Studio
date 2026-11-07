import type { IconName } from "../../types/badge";

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "minus":
      return <svg {...common}><path d="M5 12h14" /></svg>;
    case "trash":
      return <svg {...common}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>;
    case "rotate":
      return <svg {...common}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.2 9A7 7 0 0 1 18 6.7L20 12M4 12l2 5.3A7 7 0 0 0 17.8 15" /></svg>;
    case "print":
      return <svg {...common}><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v6H7zM17 11h.01" /></svg>;
    case "image":
      return <svg {...common}><rect x="3.5" y="4" width="17" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m5 17 4-4 3 3 3-4 4 5" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "close":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "warning":
      return <svg {...common}><path d="M10.3 4.4 2.8 17.3A1.8 1.8 0 0 0 4.4 20h15.2a1.8 1.8 0 0 0 1.6-2.7L13.7 4.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16.7h.01" /></svg>;
    case "maximize":
      return <svg {...common}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>;
    case "layout":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>;
  }
}
