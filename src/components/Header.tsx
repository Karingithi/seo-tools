// ==============================
// Optimized Header.tsx
// Smooth hover animation + color control + DRY principles
// ==============================

import { Link, useLocation } from "react-router-dom"
import { useState, useEffect, useRef, useCallback } from "react"
import MobileMenu from "./MobileMenu"

// -------------------------------------------------
// Type Definitions
// -------------------------------------------------
interface MenuItem {
  label: string
  href?: string
}

interface MenuData {
  label: string
  items: MenuItem[]
}

// -------------------------------------------------
// Menu Data Configuration
// -------------------------------------------------
const MENU_DATA: Record<string, MenuData> = {
  services: {
    label: "Services",
    items: [
      { label: "SEO" },
      { label: "Web Design" },
      { label: "Marketing" },
    ],
  },
  portfolio: {
    label: "Portfolio",
    items: [
      { label: "Case Studies" },
      { label: "Featured" },
      { label: "All Projects" },
    ],
  },
  resources: {
    label: "Resources",
    items: [
      { label: "Blog", href: "https://cralite.com/blog/" },
      { label: "Free SEO Tools" },
    ],
  },
}

// -------------------------------------------------
// HoverLabel – Slide-up animation with optional fixed hover color
// -------------------------------------------------
function HoverLabel({
  label,
  color = "text-white",
  hoverColor,
}: {
  label: string
  color?: string
  hoverColor?: string
}) {
  return (
    <span className="group relative inline-block overflow-hidden h-[1.2em] leading-none">
      {/* Top label */}
      <span className="block transition-transform duration-300 ease-[cubic-bezier(.25,1,.25,1)] group-hover:-translate-y-full">
        <span className={`${color} block transition-all duration-300`}>
          {label}
        </span>
        {/* Bottom (ghost) label */}
        <span
          className={`
            block absolute left-0 top-full 
            ${hoverColor || color}
          `}
        >
          {label}
        </span>
      </span>
    </span>
  )
}

// -------------------------------------------------
// A reusable dropdown link item
// Keeps animation + color logic consistent
// -------------------------------------------------
function DropdownItem({
  label,
  href,
  firstRef,
}: {
  label: string
  href?: string
  firstRef?: React.RefObject<HTMLAnchorElement>
}) {
  // If no href provided, render as a span (non-clickable)
  if (!href) {
    return (
      <span
        ref={firstRef as any}
        className="nav-dropdown-item group"
      >
        <HoverLabel label={label} color="text-[#070026]" hoverColor="text-[#070026]" />
      </span>
    )
  }

  return (
    <a
      ref={firstRef}
      href={href}
      className="nav-dropdown-item group"
    >
      <HoverLabel label={label} color="text-[#070026]" hoverColor="text-[#070026]" />
    </a>
  )
}

// -------------------------------------------------
// MAIN HEADER
// -------------------------------------------------
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [animateMenu, setAnimateMenu] = useState<string | null>(null)

  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null)
  const headerRef = useRef<HTMLHeadingElement | null>(null)
  // refs for keyboard accessibility
  const servicesFirstRef = useRef<HTMLAnchorElement | null>(null)
  const portfolioFirstRef = useRef<HTMLAnchorElement | null>(null)
  const resourcesFirstRef = useRef<HTMLAnchorElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const location = useLocation()
  const [isMobileView, setIsMobileView] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

  // Combined event listeners for better performance
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
        setOpenMenu(null)
        setMenuOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    const handleResize = () => setIsMobileView(window.innerWidth < 1024)
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Autofocus first item
  useEffect(() => {
    if (openMenu === "services") {
      setTimeout(() => {
        if (servicesFirstRef.current) servicesFirstRef.current.focus()
      }, 0)
    }

    if (openMenu === "portfolio") {
      setTimeout(() => {
        if (portfolioFirstRef.current) portfolioFirstRef.current.focus()
      }, 0)
    }

    if (openMenu === "resources") {
      setTimeout(() => {
        if (resourcesFirstRef.current) resourcesFirstRef.current.focus()
      }, 0)
    }
  }, [openMenu])

  // Memoized handlers for better performance
  const toggleMenu = useCallback((name: string) => {
    setOpenMenu(prev => (prev === name ? null : name))
    setAnimateMenu(name)
  }, [])

  const handleMouseEnter = useCallback((name: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setOpenMenu(name)
    setAnimateMenu(name)
  }, [])

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu(null)
      setAnimateMenu(null)
    }, 200)
  }, [])

  // Local MenuButton component (used) — renders a single menu dropdown
  function MenuButton({ menuKey }: { menuKey: string }) {
    const menu = MENU_DATA[menuKey]
    const isOpen = openMenu === menuKey
    const firstRef = menuKey === "services" ? servicesFirstRef : menuKey === "portfolio" ? portfolioFirstRef : resourcesFirstRef

    return (
      <div
        className="nav-dropdown-wrapper"
        onMouseEnter={() => handleMouseEnter(menuKey)}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={`nav-dropdown-button ${isOpen ? "text-primary" : ""}`}
          onClick={() => toggleMenu(menuKey)}
        >
          <HoverLabel
            label={menu.label}
            color={isOpen ? "text-primary" : "text-white"}
            hoverColor="text-primary"
          />
          <svg className={`nav-dropdown-chevron ${isOpen ? "text-primary" : ""}`} viewBox="0 0 20 20">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>

        {isOpen && (
          <div className={`nav-dropdown-panel ${animateMenu === menuKey ? "animate" : ""}`}>
            {menu.items.map((item, idx) => (
              <DropdownItem
                key={item.label}
                label={item.label}
                href={item.href}
                firstRef={idx === 0 ? firstRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Contact nav link
  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={`nav-dropdown-button ${location.pathname === path ? "text-primary!" : ""}`}
      onClick={() => setMenuOpen(false)}
    >
      <HoverLabel label={label} hoverColor="text-primary" />
    </Link>
  )
  return (
    <header
      ref={headerRef as any}
      className={`site-header fixed top-0 left-0 w-full transition-all duration-300 
      ${isScrolled ? "scrolled bg-secondary shadow-md z-999999" : "bg-transparent z-50"}
      ${menuOpen ? "menu-open" : ""} text-white`}
    >
      <div className="container flex items-center justify-between py-3.5 lg:py-[25px]">
        
        {/* LOGO */}
        <a href="https://cralite.com/" className="flex items-center">
          <img
            src="https://cralite.com/wp-content/uploads/2023/12/Cralite_Light-Logo.svg"
            className="h-10 lg:h-[50px]"
          />
        </a>

        {/* MOBILE BURGER */}
        <button className="text-white lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-6">
          {Object.keys(MENU_DATA).map((menuKey) => (
            <MenuButton key={menuKey} menuKey={menuKey} />
          ))}

          {navLink("/contact", "Contact")}
        </nav>

        {/* DESKTOP CTA (hidden on mobile/hamburger) */}
        {!isMobileView && (
          <a
            href="https://cralite.com/contact/"
            className="hidden lg:inline-flex btn btn-primary text-secondary hover:btn-primary-dark leading-none"
          >
            Get Started
          </a>
        )}
      </div>

      {/* MOBILE MENU */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        mobileSubmenu={mobileSubmenu}
        onSubmenuChange={setMobileSubmenu}
      />

    </header>
  )
}
