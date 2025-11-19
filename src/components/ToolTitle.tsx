import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "h3" | "h2" | "div";
};

export default function ToolTitle({
  children,
  className = "",
  as = "h3",
}: Props) {
  const Tag = as as any;
  return (
    <Tag className={`text-[18px] leading-snug ${className}`}>
      {children}
    </Tag>
  );
}
