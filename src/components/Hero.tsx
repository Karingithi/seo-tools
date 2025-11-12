import { Link } from "react-router-dom"

interface HeroProps {
  title?: string
  subtitle?: string
  showBackLink?: boolean
}

export default function Hero({
  title = "Free SEO Tools",
  subtitle = "Discover and use our collection of free SEO utilities designed to help your website rank better and perform faster.",
  showBackLink = true,
}: HeroProps) {
  return (
    <section className="hero-section relative overflow-hidden bg-secondary text-white pt-[6.5rem] md:pt-[10rem] pb-[4.5rem] md:pb-[6rem]">
      {/* === Background Image === */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-70"
        style={{
          backgroundImage:
            "url('https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp')",
          backgroundSize: "60% auto",
          backgroundPosition: "50% 0",
        }}
      ></div>

      {/* === Mobile Background Adjustment === */}
      <style>
        {`
          @media (max-width: 768px) {
            .hero-section > .absolute {
              background-size: 150% auto !important;
              background-position: 10vw 0 !important;
            }
          }
        `}
      </style>

      {/* === Hero Content === */}
      <div className="container relative z-[2] py-[25px] text-center md:text-left">
        {/* Back to Tools Link */}
        {showBackLink && (
          <div className="mb-5 md:mb-0">
            <Link
              to="/"
              className="inline-flex items-center text-primary text-sm font-medium hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Tools
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="mt-8 mb-4 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
          {(() => {
            const highlightPhrases = [
              "SEO Tools",
              "Tag Generator",
              "Schema Markup Generator",
              "Schema Builder",
            ]
            const match = highlightPhrases.find((phrase) =>
              title.toLowerCase().includes(phrase.toLowerCase())
            )
            if (match) {
              const parts = title.split(new RegExp(match, "i"))
              return (
                <>
                  {parts[0]}
                  <span className="text-primary">{match}</span>
                  {parts[1]}
                </>
              )
            }
            return title
          })()}
        </h1>

        {/* Subtitle */}
        <p className="my-[18px] text-lg text-gray-300 max-w-2xl mx-auto md:mx-0">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
