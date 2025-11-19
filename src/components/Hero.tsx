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
    <section className="hero-section relative overflow-hidden bg-secondary text-white pt-26 md:pt-40 pb-18 md:pb-24">
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
      <div className="container relative z-2 py-[25px] text-center">
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

        {/* Title + Subtitle wrapper */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mt-4! mb-4! text-4xl md:text-5xl font-extrabold">
          {(() => {
            const highlightPhrases = [
              "SEO Tools",
              "Business Growth and Visibility",
              "Robots.txt File in Seconds",
              "Robots.txt Validator",
              "Meta Tag Generator",
              "Robots.txt Generator",
              "LLMs.txt Generator",
            ]
            const match = highlightPhrases.find((phrase) =>
              title.toLowerCase().includes(phrase.toLowerCase())
            )
            if (match) {
              const parts = title.split(new RegExp(match, "i"))
              return (
                <>
                  <span className="text-white">{parts[0]}</span>
                  <span className="text-primary">{match}</span>
                  <span className="text-white">{parts[1]}</span>
                </>
              )
            }
            return <span className="text-white">{title}</span>
          })()}
          </h1>

          {/* Subtitle */}
          <p className="my-[18px] text-lg text-white! px-4">{subtitle}</p>
        </div>
        </div>
    </section>
  )
}