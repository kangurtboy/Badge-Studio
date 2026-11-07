export function QrMark({ value }: { value?: string }) {
  // If no specific value or for standard crisp QR rendering, use the clean vector mark
  return (
    <svg viewBox="0 0 30 30" className="qr-mark" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5H12.5V12.5H2.5V2.5M5 5V10H10V5H5M17.5 2.5H27.5V12.5H17.5V2.5M20 5V10H25V5H20M2.5 17.5H12.5V27.5H2.5V17.5M5 20V25H10V20H5M22.5 20H25V22.5H22.5V20M17.5 20H20V22.5H17.5V20M22.5 25H25V27.5H22.5V25M17.5 27.5H20V30H17.5V27.5M20 25H22.5V27.5H20V25M17.5 22.5H20V25H17.5V22.5"
        fill="white"
      />
    </svg>
  );
}
