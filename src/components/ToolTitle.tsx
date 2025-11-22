import { ReactNode } from "react";

type Props = {
  children: ReactNode
  className?: string
  as?: "h3" | "h2" | "div"
  /** Accept a Tailwind/class string for font size, e.g. 'text-lg' or 'text-[20px]' */
  size?: string
}

export default function ToolTitle({
  children,
  className = "",
  as = "h3",
  size = "text-[20px]",
}: Props) {
  const Tag = as as any
  return (
    <Tag className={`${size} leading-snug ${className}`.trim()}>{children}</Tag>
  )
}
