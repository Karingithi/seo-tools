export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 pt-16 pb-8 relative">
      {/* Subtle lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,197,12,0.1),transparent_70%)] pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto px-6 relative z-10 grid md:grid-cols-4 gap-10">
        {/* Logo + Intro */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary rounded-full w-9 h-9 flex items-center justify-center font-extrabold text-secondary text-xl">
              C
            </div>
            <span className="text-xl font-semibold text-white">Cralite</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            We create digital experiences that engage and convert.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary">About us</a></li>
            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Rich Media */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Rich Media</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary">Layouts</a></li>
            <li><a href="#" className="hover:text-primary">Ad Gallery</a></li>
            <li><a href="#" className="hover:text-primary">Features</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact Us</h3>
          <a href="mailto:hello@cralite.com" className="text-sm text-primary hover:underline">
            hello@cralite.com
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
        <p>
          © {new Date().getFullYear()} ·{" "}
          <span className="text-primary font-medium">Cralite Digital</span>
        </p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-primary">Terms & Conditions</a>
          <a href="#" className="hover:text-primary">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
