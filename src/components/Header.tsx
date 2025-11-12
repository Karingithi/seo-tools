import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Detect scroll to toggle header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={`${
        location.pathname === path
          ? "text-primary"
          : "text-gray-100 hover:text-primary"
      } transition-colors duration-200`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-secondary shadow-md" : "bg-transparent"
      } text-white`}
    >
      <div className="container flex items-center justify-between py-[14px] md:py-[25px]">
        {/* === Logo === */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://cralite.com/wp-content/uploads/2023/12/Cralite_Light-Logo.svg"
            alt="Cralite Logo"
            className="h-[40px] md:h-[50px] w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
          />
        </Link>

        {/* === Desktop Nav === */}
        <nav className="hidden md:flex items-center space-x-10 text-[17px] font-normal">
          {navLink("/", "Home")}
          {navLink("/meta-tag-generator", "Meta Tag Generator")}
          {navLink("/schema-builder", "Schema Builder")}
          <a
            href="https://cralite.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-primary transition"
          >
            Contact
          </a>
        </nav>

        {/* === CTA Button === */}
        <a
          href="https://cralite.com/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-block btn bg-primary text-secondary hover:opacity-90"
        >
          Get Started
        </a>

        {/* === Mobile Menu Button === */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* === Mobile Menu === */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-t border-gray-700">
          <div className="flex flex-col space-y-3 py-4 px-6 text-base">
            {navLink("/", "Home")}
            {navLink("/meta-tag-generator", "Meta Tag Generator")}
            {navLink("/schema-builder", "Schema Builder")}
            <a
              href="https://cralite.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Contact
            </a>
<a
  href="https://cralite.com/contact/"
  target="_blank"
  rel="noopener noreferrer"
  className="hidden md:inline-block btn bg-primary text-secondary"
>
  Get Started
</a>

          </div>
        </div>
      )}
    </header>
  )
}