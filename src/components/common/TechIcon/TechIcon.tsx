import type { SVGProps } from "react";

interface TechIconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

export function TechIcon({ name, className, ...props }: TechIconProps) {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  switch (norm) {
    case "pytorch":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12.7 1.5a.7.7 0 0 0-1 .1L9 4.3a.7.7 0 0 0 0 1l2.4 2.4a.7.7 0 0 0 1 0l2.7-2.7a.7.7 0 0 0 0-1l-2.4-2.5zm-5 6.3a.7.7 0 0 0-1 .1L4 10.6a.7.7 0 0 0 0 1l6.7 6.7a7.5 7.5 0 1 0 1.2-11.7l-1 1a6 6 0 1 1-1 9.4L4.7 11.2l2.3-2.4a.7.7 0 0 0-.3-1z" />
        </svg>
      );

    case "cuda":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12 3a9 9 0 0 0-6.36 15.36l2.12-2.12A6 6 0 1 1 18 12h3a9 9 0 0 0-9-9z" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="2.8" fill="currentColor" />
          <path d="M4.5 12a7.5 7.5 0 0 1 7.5-7.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case "onnx":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8-3.3 1.8-6.8-3.8L12 4.2zm-1 14.8l-5.8-3.2v-6.3l5.8 3.2v6.3zm2 0v-6.3l5.8-3.2v6.3L13 19zm4.3-8.8l-4.3 2.4-4.3-2.4 4.3-2.4 4.3 2.4z" />
        </svg>
      );

    case "reactthreefiber":
    case "react":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      );

    case "webgpu":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.25" />
          <path d="M1 9h3M1 15h3M20 9h3M20 15h3M9 1v3M15 1v3M9 20v3M15 20v3" />
        </svg>
      );

    case "gsap":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M13 2L3 13.5h8l-1.5 8.5 10.5-12h-8.5L13 2z" />
        </svg>
      );

    case "rust":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12 2a10 10 0 0 0-4.5 18.9l.6-1.4A8.5 8.5 0 0 1 12 3.5a8.5 8.5 0 0 1 3.9 16l.6 1.4A10 10 0 0 0 12 2zm-2 5h4a3 3 0 0 1 3 3 3 3 0 0 1-1.8 2.8L17.5 17h-2.3l-2.1-3.8H12V17h-2V7zm2 2v2.5h2a1.25 1.25 0 1 0 0-2.5H12z" />
        </svg>
      );

    case "typescript":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <rect x="2" y="2" width="20" height="20" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.5 8.5h6m-3 0v7.5M13.5 14.5c.5.6 1.2.9 2 .9.9 0 1.5-.4 1.5-1 0-.7-.6-1-1.6-1.3-1.3-.4-1.9-1-1.9-2 0-1.2 1-2 2.3-2 .9 0 1.6.3 2.1.8l-.6 1.1c-.4-.3-1-.5-1.5-.5-.6 0-1 .3-1 .8 0 .5.4.8 1.3 1.1 1.4.5 2.2 1.1 2.2 2.2 0 1.4-1.1 2.2-2.5 2.2-1.1 0-2-.4-2.5-1l.6-1.1z" />
        </svg>
      );

    case "postgres":
    case "postgresql":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <ellipse cx="12" cy="5" rx="8.5" ry="3" />
          <path d="M20.5 12c0 1.66-3.8 3-8.5 3s-8.5-1.34-8.5-3" />
          <path d="M3.5 5v14c0 1.66 3.8 3 8.5 3s8.5-1.34 8.5-3V5" />
          <path d="M12 8.5v3M10.5 10h3" />
        </svg>
      );

    case "pgvector":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M4 20L20 4M20 4H11M20 4V13" />
          <circle cx="4" cy="20" r="2" fill="currentColor" />
          <circle cx="20" cy="4" r="2" fill="currentColor" />
          <path d="M15 15l4 4M19 15v4h-4" />
        </svg>
      );

    case "kubernetes":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 2.3L5.34 8.1v7.8L12 19.7l6.66-3.8V8.1L12 4.3zm0 3.7a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );

    case "triton":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <path d="M12 2l2.5 7h-5L12 2zm-6 4l4 5-3.5 1-4-5 3.5-1zm12 0l3.5 1-4 5-3.5-1 4-5zM11 11h2v11h-2V11zm-5 3h3v2H6v-2zm9 0h3v2h-3v-2z" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}
