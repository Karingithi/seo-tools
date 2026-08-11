import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faXTwitter, faLinkedin, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import bgShape from "../assets/images/bg-shape.avif"

export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 p-4 pt-10 lg:pt-16 lg:pb-2.5 relative overflow-x-hidden">
      {/* Background overlay (match hero style) */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-100 pointer-events-none"
        style={{
          backgroundImage: `url(${bgShape})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      ></div>

      <div className="max-w-310 mx-auto relative z-10 flex flex-col gap-8">

        {/* First vertical container: grid of four columns (responsive) */}
        <div className="grid grid-cols-1 gap-7.5 md:gap-5 md:grid-cols-[33%_17%_17%_33%] w-full">
            {/* Logo + Intro (stacked) */}
            <div className="flex flex-col gap-4 justify-center">
              <img
                src="https://cralite.com/storage/settings/cralite-light-logo.svg"
                alt="Cralite"
                className="w-35 h-auto"
                width={140}
                height={43}
                loading="lazy"
              />
              <p className="text-white text-[17px] leading-relaxed w-full lg:w-[86%] mb-0">
                Premium web design, SEO, social media marketing, and branding built to grow your business in Kenya and beyond.
              </p>
            </div>

        {/* Company */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-5 text-xl">Company</h3>
            <ul className="space-y-2.5 text-[17px]">
            <li><a href="https://cralite.com/about/" className="text-white hover:text-primary">About</a></li>
            <li><a href="https://cralite.com/blog/" className="text-white hover:text-primary">Blog</a></li>
            <li><a href="https://cralite.com/contact/" className="text-white hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Rich Media */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-5 text-xl">Our Projects</h3>
            <ul className="space-y-2.5 text-[17px]">
            <li>
              <a href="https://cralite.com/portfolio?category=branding" className="text-white hover:text-primary">Branding</a>
            </li>
            <li>
              <a href="https://cralite.com/portfolio?category=digital-design" className="text-white hover:text-primary">Digital Design</a>
            </li>
            <li>
              <a href="https://cralite.com/portfolio?category=packaging-design" className="text-white hover:text-primary">Packaging Design</a>
            </li>
            <li>
              <a href="https://cralite.com/portfolio?category=website-design" className="text-white hover:text-primary">Web Design</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-5 text-xl">Contact Us</h3>
            <a href="mailto:hello@cralite.com" className="text-[17px] text-white">
            hello@cralite.com
          </a>
            <div className="mt-4 social-list">
              {/* Social icons (use centralized classes) */}
              <a href="https://www.facebook.com/cralite.digital" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
              </a>
              <a href="https://www.instagram.com/cralite.digital/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                <FontAwesomeIcon icon={faInstagram} className="social-icon" />
              </a>
              <a href="https://twitter.com/Cralite_Digital" target="_blank" rel="noopener noreferrer" aria-label="X" className="social-link">
                <FontAwesomeIcon icon={faXTwitter} className="social-icon" />
              </a>
              <a href="https://linkedin.com/compa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link">
                <FontAwesomeIcon icon={faLinkedin} className="social-icon" />
              </a>
              <a href="http://www.youtube.com/@Cralite_Digitalny/cralite-digital" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link">
                <FontAwesomeIcon icon={faYoutube} className="social-icon" />
              </a>
              <a href="https://wa.me/254721379487?text=Hello%2C%20I%20have%20a%20question%20about%20your%20service.%20Can%20you%20please%20help%20me%3F" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-link">
                <FontAwesomeIcon icon={faWhatsapp} className="social-icon" />
              </a>
            </div>
        </div>

      </div>

      {/* Second vertical container: bottom bar */}
          <div className="border-t border-gray-800 pt-6 pb-4 text-xs text-gray-500">
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3">
                <div className="w-full md:w-auto flex items-center justify-center text-center">
                  <p className="text-white text-sm! mb-0!">
                    © {new Date().getFullYear()} ·{' '}
                    <a href="https://cralite.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Cralite Digital</a>
                  </p>
                </div>

              <div className="w-full md:w-auto mt-2 md:mt-0 text-center md:text-right">
                <a href="#" className="text-white hover:text-primary mr-4 text-[14px]">Terms &amp; Conditions</a>
                <a href="#" className="text-white hover:text-primary text-[14px]">Privacy Policy</a>
              </div>
            </div>
          </div>
      </div>
    </footer>
  )
}