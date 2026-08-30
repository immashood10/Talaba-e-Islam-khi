'use client';

import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/image-assets';

export default function Footer() {
  const footerLinks = {
    Party: [
      { label: 'Our Initiatives', href: '/campaigns' },
      { label: 'Our Vision', href: '/about' },
      { label: 'Leadership', href: '/about#chairman-message' },
    ],
    Support: [
      { label: 'Contact Us', href: '/contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/about#privacy-policy' },
      { label: 'Terms of Service', href: '/about#terms' },
    ],
  };

  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/10">
                <Image
                  src={siteImages.logo}
                  alt="Talaba e Islam Karachi logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-xl font-bold">Talaba e Islam Karachi</span>
            </Link>
            <p className="mt-3 text-sm text-blue-100 max-w-sm">
              A movement dedicated to education, community welfare, and serving the people
              of Karachi with faith, integrity, and action.
            </p>

            <a
              href="https://www.youtube.com/@TalabaeislamKarachiT.I.K"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-2.5 max-w-sm hover:bg-white/15 transition-colors duration-200"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/30">
                <Image src={siteImages.logo} alt="Talaba e Islam Karachi" fill sizes="36px" className="object-cover" />
              </div>
              <span className="text-sm font-medium text-white">
                Subscribe us on YouTube channel for more videos
              </span>
            </a>

            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.56c-.88.39-1.83.65-2.83.77a4.92 4.92 0 002.16-2.72 9.86 9.86 0 01-3.13 1.2c-2.06 0-3.91.56-5.51 1.48a14 14 0 00-6.77 6.32c-1.06-.43-2.2-.7-3.4-.7-2.6 0-4.7 2.1-4.7 4.7 0 .37.04.73.11 1.08-3.92-.2-7.37-2.08-9.71-4.94a4.8 4.8 0 00-.66 2.4c0 1.67.85 3.16 2.14 4.03A4.9 4.9 0 011.64 4.64c1.6.94 3.43 1.49 5.42 1.49 6.5 0 10.03-5.39 10.03-10.03v-.45c.72-.5 1.35-1.14 1.84-1.88z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/18vgWArgbj/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Facebook"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.15 5.96C15.21 5.96 16.12 6.04 16.12 6.04V8.51H15.01C13.76 8.51 13.44 9.28 13.44 10.08V12.06H16.36L15.88 14.96H13.44V21.96C18.22 21.21 21.88 17.06 21.88 12.06C21.88 6.53 17.38 2.04 12 2.04Z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/waleedrazashaheedi?igsh=MWJkbXh4MHdoYmg5aQ=="
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Instagram"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.58.012 4.85.07 1.17.054 1.8.249 2.23.415.56.217.96.477 1.38.896.42.42.68.819.9 1.381.16.422.36 1.057.41 2.227.06 1.266.07 1.646.07 4.85s-.01 3.585-.07 4.85c-.06 1.17-.25 1.805-.42 2.227-.22.562-.48.96-.9 1.382-.42.419-.82.679-1.38.896-.42.164-1.06.36-2.24.413-1.27.057-1.65.07-4.85.07s-3.59-.015-4.86-.074c-1.17-.061-1.82-.256-2.24-.421-.56-.224-.96-.479-1.38-.899-.42-.419-.69-.824-.9-1.38-.16-.42-.36-1.065-.42-2.235-.05-1.26-.06-1.649-.06-4.844 0-3.196.01-3.586.06-4.861.06-1.17.26-1.814.42-2.234.21-.57.48-.96.9-1.381.42-.419.81-.689 1.38-.898.42-.166 1.05-.361 2.22-.421 1.28-.045 1.65-.06 4.86-.06zM12 0C8.74 0 8.33.015 7.05.072 5.78.132 4.9.333 4.14.63c-.79.306-1.46.717-2.13 1.384S.94 3.35.63 4.14C.33 4.905.13 5.775.07 7.053.01 8.333 0 8.74 0 12s.01 3.667.07 4.947c.06 1.277.26 2.148.56 2.913.31.788.72 1.459 1.38 2.126.67.666 1.34 1.079 2.13 1.384.76.296 1.63.499 2.91.558C8.33 23.988 8.74 24 12 24s3.67-.015 4.95-.072c1.28-.06 2.15-.262 2.91-.558.79-.306 1.46-.718 2.13-1.384.66-.667 1.08-1.335 1.38-2.126.3-.765.5-1.636.56-2.913.06-1.28.07-1.687.07-4.947s-.01-3.667-.07-4.947c-.06-1.277-.26-2.149-.56-2.913-.31-.789-.72-1.459-1.38-2.126C21.32 1.347 20.65.935 19.86.63c-.76-.297-1.63-.499-2.91-.558C15.67.012 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm7.85-10.405a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@TalabaeislamKarachiT.I.K"
                target="_blank"
                rel="noreferrer"
                aria-label="Subscribe to our YouTube channel"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Sections - always 3-across in a single row, even on mobile */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:col-span-3 lg:gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="min-w-0">
                <h3 className="font-semibold text-white mb-2 text-sm sm:mb-3 sm:text-base">{title}</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block text-xs text-blue-100 hover:text-primary-light transition-colors duration-200 sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-400/30 mt-6 pt-5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-xs">
            © 2024 Talaba e Islam Karachi (TIK). All rights reserved.
          </p>
          <p className="text-blue-200 text-xs mt-2 md:mt-0">
            Made with ❤️ for a better world
          </p>
        </div>
      </div>
    </footer>
  );
}
