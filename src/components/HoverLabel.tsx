function HoverLabel({
  label,
  color = "text-white",
  hoverColor = color,
}: {
  label: string
  color?: string
  hoverColor?: string
}) {
  return (
    <span
      className="
        relative inline-block overflow-hidden 
        h-[1.1em] leading-none 
        group will-change-transform
      "
      style={{ maskImage: "linear-gradient(black, black)" }} // prevents ghosting
    >
      {/* TOP LAYER — Original Label */}
      <span
        className={`
          absolute inset-0 flex items-center
          transition-all duration-500 ease-[cubic-bezier(.25,1,.25,1)]
          text-[inherit] ${color}

          group-hover:-translate-y-full
          group-hover:opacity-0
          group-hover:scale-[0.98]     /* shrink a bit */
        `}
        style={{ transform: "translateZ(0)" }}
      >
        {label}
      </span>

      {/* BOTTOM LAYER — Hover Label sliding up */}
      <span
        className={`
          absolute inset-0 flex items-center
          translate-y-full opacity-0 
          transition-all duration-500 ease-[cubic-bezier(.25,1,.25,1)]
          text-[inherit] ${hoverColor}

          group-hover:translate-y-0
          group-hover:opacity-100
          group-hover:scale-[1.02]     /* subtle grow */
        `}
        style={{ transform: "translateZ(0)" }}
      >
        {label}
      </span>

      {/* Invisible spacer to prevent layout jitter */}
      <span className="opacity-0">{label}</span>
    </span>
  )
}
