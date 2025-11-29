// ==============================
// MobileMenu Component
// Extracted for better code organization
// ==============================

import { Link } from "react-router-dom"

// -------------------------------------------------
// HoverLabel (duplicated for now, could be shared)
// -------------------------------------------------
function HoverLabel({
  label,
  color = "text-white",
}: {
  label: string
  color?: string
}) {
  return (
    <span className="group relative inline-block overflow-hidden h-[1.2em] leading-none">
      <span className="block transition-transform duration-300 ease-[cubic-bezier(.25,1,.25,1)] group-hover:-translate-y-full">
        <span className={`${color} block transition-all duration-300`}>
          {label}
        </span>
        <span className={`block absolute left-0 top-full ${color}`}>
          {label}
        </span>
      </span>
    </span>
  )
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  mobileSubmenu: string | null
  onSubmenuChange: (submenu: string | null) => void
}

const MOBILE_MENU_DATA = {
  services: ["SEO", "Web Design", "Marketing"],
  portfolio: ["Case Studies", "Featured", "All Projects"],
  resources: ["Blog", "Guides", "Contact"],
}

export default function MobileMenu({
  isOpen,
  onClose,
  mobileSubmenu,
  onSubmenuChange,
}: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="mobile-menu-overlay fixed inset-0 bg-secondary z-999998">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="container flex items-center justify-between py-3.5 md:py-[25px]">
          <a href="https://cralite.com/">
            <img
              src="https://cralite.com/wp-content/uploads/2023/12/Cralite_Light-Logo.svg"
              className="h-10 md:h-[50px]"
              alt="Cralite Logo"
            />
          </a>
          <button className="text-white" onClick={onClose} aria-label="Close menu">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Main Menu */}
        {!mobileSubmenu ? (
          <div className="flex-1 flex flex-col container pt-6">
            {Object.entries(MOBILE_MENU_DATA).map(([key, _items]) => (
              <div
                key={key}
                className="mobile-menu-item flex justify-between items-center text-white text-[17px] cursor-pointer"
                onClick={() => onSubmenuChange(key)}
              >
                <HoverLabel label={key.charAt(0).toUpperCase() + key.slice(1)} />
                <svg
                  className="w-5 h-5 -translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ))}

            <div className="mobile-menu-item text-white text-[17px]">
              <Link to="/contact" onClick={onClose}>
                <HoverLabel label="Contact" />
              </Link>
            </div>

            {/* CTA below menu */}
              <div className="mt-auto pb-8">
                <a
                  href="https://cralite.com/contact/"
                  onClick={onClose}
                  className="btn btn-primary w-full text-secondary rounded-full text-center shadow-xl"
                >
                  Get Started
                </a>
              </div>
          </div>
        ) : (
          // Submenu
          <div className="flex-1 flex flex-col container pt-6">
            {/* Back Button */}
            <div
              className="mobile-menu-item text-white uppercase text-[12px] cursor-pointer opacity-80"
              onClick={() => onSubmenuChange(null)}
            >
              BACK
            </div>

            {/* Submenu Items */}
            {MOBILE_MENU_DATA[mobileSubmenu as keyof typeof MOBILE_MENU_DATA]?.map((item) => (
              <a key={item} className="mobile-menu-item text-white text-[17px]" href="#">
                <HoverLabel label={item} />
              </a>
            ))}

            {/* CTA below submenu */}
              <div className="mt-auto px-6 pb-2">
                <a
                  href="https://cralite.com/contact/"
                  onClick={onClose}
                  className="btn btn-primary w-full text-secondary rounded-full py-3 text-center shadow-xl"
                >
                  Get Started
                </a>
              </div>
          </div>
        )}
 
      </div>
    </div>
  )
}
