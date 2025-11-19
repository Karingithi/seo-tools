export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 pt-16 pb-8 relative">
      {/* Subtle lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,197,12,0.1),transparent_70%)] pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto px-6 relative z-10 grid md:grid-cols-4 gap-10">
        
            {/* Logo + Intro */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://cralite.com/wp-content/uploads/2023/12/Cralite_Light-Logo.svg"
                  alt="Cralite"
                  className="h-9"
                />
              </div>
              <p className="text-white text-lg leading-relaxed">
                We create digital experiences that engage and convert.
              </p>
            </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-bold mb-4 text-2xl">Company</h3>
          <ul className="space-y-2 text-lg">
            <li><a href="#" className="text-white hover:text-primary">About us</a></li>
            <li><a href="#" className="text-white hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" className="text-white hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Rich Media */}
        <div>
          <h3 className="text-white font-bold mb-4 text-2xl">Rich Media</h3>
          <ul className="space-y-2 text-lg text-white hover:text-primary">
            <li><a href="#" className="text-white hover:text-primary">Layouts</a></li>
            <li><a href="#" className="text-white hover:text-primary">Ad Gallery</a></li>
            <li><a href="#" className="text-white hover:text-primary">Features</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white! font-bold mb-4 text-2xl">Contact Us</h3>
            <a href="mailto:hello@cralite.com" className="text-lg text-white hover:underline">
            hello@cralite.com
          </a>
            <div className="mt-4 flex items-center gap-3">
              {/* Social icons (inline SVGs) */}
              <a href="#" aria-label="Facebook" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.09 5.66 21.13 10.44 21.95v-6.99H7.9v-2.8h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54v1.85h2.74l-.44 2.8h-2.3V21.95C18.34 21.13 22 17.09 22 12.07z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zM18.5 6.2a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="X" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 7L7 18M7 7l11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5A2.49 2.49 0 102.5 6a2.49 2.49 0 002.48-2.5zM3 8.9h3.98V21H3V8.9zM9.5 8.9h3.82v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.09V21h-3.98v-5.17c0-1.23 0-2.81-1.71-2.81-1.71 0-1.97 1.33-1.97 2.71V21H9.5V8.9z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 7.2a2.6 2.6 0 00-1.83-1.84C18.85 5 12 5 12 5s-6.85 0-8.17.36A2.6 2.6 0 002 7.2 27 27 0 002 12a27 27 0 000 4.8 2.6 2.6 0 001.83 1.84C5.15 19 12 19 12 19s6.85 0 8.17-.36A2.6 2.6 0 0022 16.8 27 27 0 0022 12a27 27 0 000-4.8zM10 15.5v-7l6 3.5-6 3.5z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" className="text-white hover:text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.5A8.5 8.5 0 1012.5 21L7 22l1.2-5.5A8.5 8.5 0 0021 12.5zM11 8.5c-.5 0-1 .2-1.3.5-.3.3-.6.8-.6 1.3 0 .5.2 1 .5 1.3l.4.4c.3.3.4.4.8.4.2 0 .4 0 .7-.1.3-.1.9-.3 1.1-.4.2-.1.4-.1.6 0 .2.1.6.3.9.5.3.2.7.5.8.7.2.3.1.7 0 1-.1.3-.4.7-.8 1-1 .7-2.8.8-4.1.2-1.3-.6-2.8-2-3.6-3.6-.8-1.6-.6-3.3.2-4.3C9 8.7 10 8.5 11 8.5z" fill="currentColor"/></svg>
              </a>
            </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
        <p>
          © {new Date().getFullYear()} ·{" "}
          <span className="text-primary font-medium">Cralite Digital</span>
        </p>
        <div className="mt-2 space-x-4">
          <a href="#" className="text-white hover:text-primary">Terms & Conditions</a>
          <a href="#" className="text-white hover:text-primary">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
