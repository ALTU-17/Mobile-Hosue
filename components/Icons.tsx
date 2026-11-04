import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.4 11.7a8.3 8.3 0 0 1-12.3 7.4L4 20.2l1.2-3.9a8.3 8.3 0 1 1 15.2-4.6Z" />
      <path d="M8.8 8.2c.3-.1.6 0 .8.3l.7 1.4c.1.3.1.6-.1.8l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.5-.2.8-.1l1.4.7c.3.2.4.5.3.8-.2.8-.9 1.4-1.7 1.5-.8.1-2.7-.5-4.3-2.1-1.6-1.6-2.2-3.5-2.1-4.3.1-.8.7-1.5 1.5-1.7Z" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.8 3.7h3l1.5 4.4-2 1.4a14.8 14.8 0 0 0 5.2 5.2l1.4-2 4.4 1.5v3c0 .9-.7 1.6-1.6 1.6A16.4 16.4 0 0 1 3.2 5.3c0-.9.7-1.6 1.6-1.6h2Z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 10.4c0 5.3-8 11.1-8 11.1s-8-5.8-8-11.1a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.4 7.1 4.7a1.8 1.8 0 0 0 1.8 0L20 7.4" />
    </svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M8 5.5v13l10-6.5L8 5.5Z" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="m12 3.4 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3.4Z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.2 20 6v5.3c0 4.6-3.2 8-8 9.5-4.8-1.5-8-4.9-8-9.5V6l8-2.8Z" />
      <path d="m8.7 12 2.2 2.2 4.4-4.5" />
    </svg>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.5 3.8v17l2.1-1.5 2.2 1.5 2.2-1.5 2.2 1.5 2.2-1.5 2.1 1.5v-17l-2.1 1.4L14.2 4l-2.2 1.3L9.8 4 7.6 5.4 5.5 3.8Z" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" />
    </svg>
  );
}

export function ExchangeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h13m0 0-3-3m3 3-3 3M20 17H7m0 0 3 3m-3-3 3-3" />
    </svg>
  );
}

export function FinanceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18M7 15h3" />
    </svg>
  );
}

export function AccessoryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 13.5v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 12.5h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5ZM20 12.5h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-5Z" />
    </svg>
  );
}

export function ServiceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m14.2 6.3 3.5 3.5m-1.4-6 3.9 3.9a4.3 4.3 0 0 1-5.6 5.6l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a4.3 4.3 0 0 1 5.6-5.6l-2.4 2.4" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.8v5M12 7.8v.1" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2v-13Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 1.8" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.2 4.2L19 6.8" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v18M5.6 6.4l12.8 11.2M18.4 6.4 5.6 17.6M3 12h18" />
    </svg>
  );
}

export function DragIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 11V7.5a1.5 1.5 0 0 1 3 0V10m0-2.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0v4.7c0 3.4-2.4 6.3-5.8 6.3h-.6a6 6 0 0 1-4.2-1.7l-3.1-3.1a1.5 1.5 0 0 1 2.1-2.1L7 14" />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.5 12.2c0 4.7-3.3 8.1-8.2 8.1a8.8 8.8 0 1 1 0-17.6c2.5 0 4.6.9 6.2 2.5l-2.5 2.4a5.1 5.1 0 0 0-3.7-1.4 5.6 5.6 0 0 0 0 11.2c2.9 0 4.8-1.6 5.2-4.1h-5.2v-3h8l.2 1.9Z" />
    </svg>
  );
}
