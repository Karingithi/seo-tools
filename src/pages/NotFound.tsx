import { Helmet } from "react-helmet-async"
import Seo from "../components/Seo"

// external homepage link used for the Back button

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" description="Looks like this page can't be found." url="https://cralite.com/tools/404" />
      <Helmet>
        <meta name="robots" content="noindex,follow" />
        <meta name="googlebot" content="noindex,follow" />
      </Helmet>
      <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "#fff0",
        backgroundImage: "radial-gradient(at top right, #FFF9E7 60%, #FFFFFF 60%)",
      }}
    >
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start max-w-md mx-auto lg:mx-0">
            <h1 className="text-5xl md:text-6xl font-black" style={{ color: "#0c0c0c" }}>
              It's empty here
            </h1>
            <p className="leading-relaxed" style={{ fontSize: "18px", color: "#0c0c0c" }}>
              Looks like this page can't be found.
              <br />
              Maybe it was moved or renamed.
            </p>
            <a
              href="https://cralite.com/"
              className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 hover:text-white text-base font-normal rounded-full transform transition-transform duration-200 ease-out hover:-translate-y-2"
            >
              Back to Homepage
            </a>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Illustration */}
            <img
              src="https://cralite.com/wp-content/uploads/2023/12/404-Error-Page-not-Found-Cralite-Digital.svg"
              alt="404 Page not found illustration"
              className="w-full max-w-2xl h-auto"
            />
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
