import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faXTwitter, faLinkedin, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 p-4 pt-10 lg:pt-16 lg:pb-2.5 relative overflow-x-hidden">
      {/* Background overlay (match hero style) */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-80 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp')",
          backgroundSize: "42% auto",
          backgroundPosition: "80% 0",
        }}
      ></div>

      <div className="max-w-[1240px] mx-auto relative z-10 flex flex-col gap-8">

        {/* First vertical container: grid of four columns (responsive) */}
        <div className="grid grid-cols-1 gap-[30px] md:gap-5 md:grid-cols-[33%_17%_17%_33%] w-full">
            {/* Logo + Intro (stacked) */}
            <div className="flex flex-col gap-4 justify-center">
              <img
                src="https://cralite.com/wp-content/uploads/2023/12/Cralite_Light-Logo.svg"
                alt="Cralite"
                className="w-[140px] h-auto"
              />
              <p className="text-white text-lg leading-relaxed w-[86%] mb-0">
                We create digital experiences that engage and convert.
              </p>
            </div>

        {/* Company */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-2.5 text-2xl">Company</h3>
          <ul className="space-y-2 text-lg">
            <li><a href="#" className="text-white hover:text-primary">About us</a></li>
            <li><a href="#" className="text-white hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" className="text-white hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Rich Media */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-4 text-2xl">Rich Media</h3>
          <ul className="space-y-2 text-lg text-white hover:text-primary">
            <li><a href="#" className="text-white hover:text-primary">Layouts</a></li>
            <li><a href="#" className="text-white hover:text-primary">Ad Gallery</a></li>
            <li><a href="#" className="text-white hover:text-primary">Features</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col justify-start">
          <h3 className="text-white font-bold mb-4 text-2xl">Contact Us</h3>
            <a href="mailto:hello@cralite.com" className="text-lg text-white hover:underline">
            hello@cralite.com
          </a>
            <div className="mt-4 social-list">
              {/* Social icons (use centralized classes) */}
              <a href="#" aria-label="Facebook" className="social-link">
                <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <FontAwesomeIcon icon={faInstagram} className="social-icon" />
              </a>
              <a href="#" aria-label="X" className="social-link">
                <FontAwesomeIcon icon={faXTwitter} className="social-icon" />
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <FontAwesomeIcon icon={faLinkedin} className="social-icon" />
              </a>
              <a href="#" aria-label="YouTube" className="social-link">
                <FontAwesomeIcon icon={faYoutube} className="social-icon" />
              </a>
              <a href="#" aria-label="WhatsApp" className="social-link">
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