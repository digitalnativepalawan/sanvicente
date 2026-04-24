import { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface Props {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

/** Wraps a child in a staggered fade-up reveal triggered on scroll. */
export const RevealCard = ({ children, delayMs = 0, className = "" }: Props) => {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delayMs}ms`,
        transitionProperty: "opacity, transform",
        transitionDuration: "700ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`${revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
};
