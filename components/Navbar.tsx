'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/image-assets';
import { useLanguage } from '@/lib/language-context';
import { useMember } from '@/lib/member-context';
import { useCart } from '@/lib/cart-context';
import { useTheme } from '@/lib/theme-context';
import MembershipModal from '@/components/MembershipModal';
import CartModal from '@/components/CartModal';
import StoryViewer from '@/components/StoryViewer';
import { useStoryRing } from '@/lib/use-story-ring';

type IconProps = {
  className?: string;
};

type AboutMenuItem = {
  href: string;
  title: string;
  description: string;
};

const iconClass = 'h-5 w-5 shrink-0';

function MailIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  );
}

function PhoneIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.35 1.9.66 2.8a2 2 0 01-.45 2.11L8.05 9.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0122 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19.5L3 21l1-3.2a9 9 0 111.5 1.7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.8 8.7c.2 3 2.4 5.2 5.5 6.1l1.2-1.2 2.1 1.1c.2.1.3.4.2.7-.4 1-1.2 1.6-2.4 1.6-3.8 0-8.4-4.2-8.4-8.4 0-1.2.6-2 1.6-2.4.3-.1.6 0 .7.2l1.1 2.1-1.2 1.2z" />
    </svg>
  );
}

function GlobeIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.3 2.4 3.5 5.4 3.5 9s-1.2 6.6-3.5 9c-2.3-2.4-3.5-5.4-3.5-9S9.7 5.4 12 3z" />
    </svg>
  );
}

function UserIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HeartIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21s-7-4.35-9.45-8.73C.35 8.34 2.5 4.5 6.4 4.5c2.03 0 3.43 1.04 4.25 2.13.82-1.09 2.22-2.13 4.25-2.13 3.9 0 6.05 3.84 3.85 7.77C16.3 16.65 12 21 12 21z" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CloseIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SunIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function CartIcon({ className = iconClass }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function CartButton({ count, onClick, className }: { count: number; onClick: () => void; className: string }) {
  return (
    <button type="button" onClick={onClick} aria-label="Cart" className={`relative ${className}`}>
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

const NEWS_DISMISSED_KEY = 'tik-news-dismissed';

const text = {
  en: {
    newsBadge: 'News',
    newsLine: 'Registrations for our latest community initiative are now open — get involved today.',
    dismissNews: 'Dismiss announcement',
    seeFullNews: 'See full News...',
    showLessNews: 'Show less',
    navLinks: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us', hasMenu: true },
      { href: '/jama-masjid', label: 'Jama Masjid', sublabel: 'Muslim Town' },
      { href: '/shop', label: 'Shop' },
      { href: '/campaigns', label: 'Initiatives' },
      { href: '/events', label: 'Events' },
      { href: '/live', label: 'Live' },
      { href: '/contact', label: 'Contact Us' },
    ],
    memberButton: 'Become a Member',
    settingsButton: 'Settings',
    logoutButton: 'Log out',
    donateButton: 'Support Uss',
    languageButton: 'English',
    languageMenuLabel: 'Language',
    toggleThemeLabel: 'Toggle dark mode',
    contact: {
      email: 'talabaeislamkarachi@gmail.com',
      phone: '+92 321 9221401',
      whatsapp: '+92 321 9221401',
    },
    aboutMenu: [
      { href: '/about', title: 'Our Vision', description: 'Learn about Talaba e Islam' },
      { href: '/about#chairman-message', title: "Chairman's Message", description: 'Message from the chairman' },
      { href: '/about#newsletter', title: 'Newsletter', description: 'Subscribe to updates' },
      { href: '/about#terms', title: 'Terms & Conditions', description: 'Terms of service' },
      { href: '/about#privacy-policy', title: 'Privacy Policy', description: 'Privacy information' },
    ],
  },
  ur: {
    newsBadge: 'خبر',
    newsLine: 'ہماری تازہ ترین کمیونٹی مہم کی رجسٹریشن جاری ہے — آج ہی شامل ہوں۔',
    dismissNews: 'اعلان بند کریں',
    seeFullNews: 'پوری خبر دیکھیں...',
    showLessNews: 'کم دکھائیں',
    navLinks: [
      { href: '/', label: 'ہوم' },
      { href: '/about', label: 'ہمارے بارے میں', hasMenu: true },
      { href: '/jama-masjid', label: 'جامع مسجد', sublabel: 'مسلم ٹاؤن' },
      { href: '/shop', label: 'دکان' },
      { href: '/campaigns', label: 'اقدامات' },
      { href: '/events', label: 'تقریبات' },
      { href: '/live', label: 'لائیو' },
      { href: '/contact', label: 'رابطہ کریں' },
    ],
    memberButton: 'ممبر بنیں',
    settingsButton: 'ترتیبات',
    logoutButton: 'لاگ آؤٹ',
    donateButton: 'ہماری مدد کریں',
    languageButton: 'اردو',
    languageMenuLabel: 'زبان',
    toggleThemeLabel: 'ڈارک موڈ تبدیل کریں',
    contact: {
      email: 'talabaeislamkarachi@gmail.com',
      phone: '+92 321 9221401',
      whatsapp: '+92 321 9221401',
    },
    aboutMenu: [
      { href: '/about', title: 'ہمارا وژن', description: 'تلبا اسلام کے بارے میں جانیں' },
      { href: '/about#chairman-message', title: "Chairman's Message", description: 'Message from the chairman' },
      { href: '/about#newsletter', title: 'Newsletter', description: 'Subscribe to updates' },
      { href: '/about#terms', title: 'Terms & Conditions', description: 'Terms of service' },
      { href: '/about#privacy-policy', title: 'Privacy Policy', description: 'Privacy information' },
    ],
  },
} as const;

function AboutDropdown({ items }: { items: readonly AboutMenuItem[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-50 w-[min(780px,calc(100vw-2rem))] pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-x-12 gap-y-2 rounded-[22px] bg-white px-8 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:grid-cols-2 dark:bg-slate-900">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-md px-3 py-4 transition-colors hover:bg-amber-50/80 focus:bg-amber-50/80 focus:outline-none dark:hover:bg-slate-800 dark:focus:bg-slate-800"
            >
              <span className="block text-base font-bold leading-tight text-gray-950 2xl:text-lg dark:text-white">
                {item.title}
              </span>
              <span className="mt-1 block text-sm leading-snug text-gray-500 2xl:text-base dark:text-slate-400">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAboutExpanded, setIsMobileAboutExpanded] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNewsVisible, setIsNewsVisible] = useState(true);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage } = useLanguage();
  const { member, logout } = useMember();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const storyRing = useStoryRing();

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (window.sessionStorage.getItem(NEWS_DISMISSED_KEY) === 'true') {
      setIsNewsVisible(false);
    }
  }, []);

  const dismissNews = () => {
    setIsNewsVisible(false);
    window.sessionStorage.setItem(NEWS_DISMISSED_KEY, 'true');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileAboutExpanded(false);
  };

  const currentText = text[language];

  return (
    <>
    <nav className={`sticky top-0 z-50 border-b border-amber-100/80 bg-white/95 backdrop-blur-md transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-950/95 ${isScrolled ? 'shadow-soft' : ''}`}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          {storyRing.hasStories ? (
            <button
              type="button"
              onClick={storyRing.openViewer}
              aria-label="View story"
              className="flex shrink-0 items-center rounded-full transition-transform active:scale-95"
            >
              <div
                className={`rounded-full p-[2.5px] ${
                  storyRing.hasUnseen
                    ? 'bg-gradient-to-tr from-amber-400 via-primary to-pink-500'
                    : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white ring-2 ring-white sm:h-[3.25rem] sm:w-[3.25rem] dark:bg-slate-950 dark:ring-slate-950">
                  <Image
                    src={siteImages.logo}
                    alt="Talba e Islam logo"
                    fill
                    sizes="(max-width: 640px) 44px, 52px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </button>
          ) : (
            <Link href="/" className="flex shrink-0 items-center">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-gray-200 sm:h-14 sm:w-14">
                <Image
                  src={siteImages.logo}
                  alt="Talba e Islam logo"
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          )}

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 xl:flex 2xl:gap-5">
            <a href={`mailto:${currentText.contact.email}`} className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-[11px] font-medium whitespace-nowrap text-gray-600 transition-colors hover:bg-amber-100 hover:text-primary sm:text-xs 2xl:gap-3 2xl:px-4 2xl:py-2.5 2xl:text-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <MailIcon />
              <span className="max-w-[12rem] truncate">{currentText.contact.email}</span>
            </a>
            <a href="https://wa.me/923219221401" className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-[11px] font-medium whitespace-nowrap text-gray-600 transition-colors hover:bg-amber-100 hover:text-primary sm:text-xs 2xl:gap-3 2xl:px-4 2xl:py-2.5 2xl:text-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <WhatsAppIcon />
              <span className="whitespace-nowrap leading-tight">{currentText.contact.whatsapp}</span>
            </a>
            <a href="tel:+923219221401" className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-[11px] font-medium whitespace-nowrap text-gray-600 transition-colors hover:bg-amber-100 hover:text-primary sm:text-xs 2xl:gap-3 2xl:px-4 2xl:py-2.5 2xl:text-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <PhoneIcon />
              <span className="whitespace-nowrap leading-tight">{currentText.contact.phone}</span>
            </a>
            <button
              type="button"
              aria-label={currentText.languageMenuLabel}
              className="flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold tracking-wide text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 2xl:h-10 2xl:px-4 2xl:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={toggleLanguage}
            >
              <GlobeIcon className="h-4 w-4" />
              {currentText.languageButton}
            </button>
            <button
              type="button"
              aria-label={currentText.toggleThemeLabel}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 2xl:h-10 2xl:w-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex 2xl:gap-3">
            <CartButton
              count={totalItems}
              onClick={() => setIsCartOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary 2xl:h-11 2xl:w-11 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            />
            {member ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((v) => !v)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 rounded-full bg-amber-50 px-4 text-sm font-medium whitespace-nowrap text-primary transition-colors hover:bg-amber-100 2xl:h-11 2xl:px-5 2xl:text-base dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <UserIcon className="h-5 w-5" />
                  {member.name.split(' ')[0]}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-soft-lg animate-fade-in dark:border-slate-700 dark:bg-slate-900"
                  >
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-amber-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {currentText.settingsButton}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        logout();
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-amber-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {currentText.logoutButton}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 2xl:h-11 2xl:gap-3 2xl:px-5 2xl:text-base"
              >
                <UserIcon className="h-6 w-6" />
                {currentText.memberButton}
              </button>
            )}
            <Link href="/campaigns" className="flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark 2xl:h-11 2xl:gap-3 2xl:px-5 2xl:text-base">
              {currentText.donateButton}
              <HeartIcon className="h-6 w-6" />
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <CartButton
              count={totalItems}
              onClick={() => setIsCartOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            />
            <button
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden items-center justify-center gap-7 border-t border-gray-100 py-3 lg:flex xl:gap-9 2xl:gap-11 dark:border-slate-800">
          {currentText.navLinks.map((link) => {
            const isAbout = link.href === '/about' && 'hasMenu' in link;

            if (isAbout) {
              return (
                <div key={`${link.href}-${link.label}`} className="group relative">
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium tracking-wide text-gray-500 transition-colors hover:text-primary 2xl:text-base dark:text-slate-400 dark:hover:text-primary-light"
                  >
                    {link.label}
                    <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <AboutDropdown items={currentText.aboutMenu} />
                </div>
              );
            }

            return (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium tracking-wide text-gray-500 transition-colors hover:text-primary 2xl:text-base dark:text-slate-400 dark:hover:text-primary-light"
              >
                {'sublabel' in link ? (
                  <span className="flex flex-col leading-tight">
                    <span>{link.label}</span>
                    <span className="text-[11px] font-normal opacity-70">{link.sublabel}</span>
                  </span>
                ) : (
                  link.label
                )}
                {'hasMenu' in link && <ChevronDownIcon className="h-4 w-4" />}
              </Link>
            );
          })}
        </div>

      </div>

      {isNewsVisible && (
        <div className="bg-primary px-4 py-2 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1600px] items-start gap-3">
            <span className="mt-0.5 hidden shrink-0 items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide sm:flex">
              {currentText.newsBadge}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-medium sm:text-sm ${isNewsExpanded ? '' : 'truncate'}`}>
                {currentText.newsLine}
              </p>
              <button
                type="button"
                onClick={() => setIsNewsExpanded((v) => !v)}
                className="mt-0.5 text-[11px] font-semibold text-white/80 underline underline-offset-2 hover:text-white"
              >
                {isNewsExpanded ? currentText.showLessNews : currentText.seeFullNews}
              </button>
            </div>
            <button
              type="button"
              onClick={dismissNews}
              aria-label={currentText.dismissNews}
              className="mt-0.5 shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </nav>

    {/* Mobile menu: fixed overlay + slide-in drawer, rendered outside <nav>
        because its backdrop-blur would otherwise redefine the containing
        block for our fixed-position elements (see MembershipModal fix). */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[100] lg:hidden">
        <div
          className="absolute inset-0 bg-black/50 animate-fade-in"
          onClick={closeMobileMenu}
        />

        <div className="absolute inset-y-0 right-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-soft-lg animate-slide-in-right dark:bg-slate-950">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            {storyRing.hasStories ? (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  storyRing.openViewer();
                }}
                aria-label="View story"
                className={`rounded-full p-[2px] ${
                  storyRing.hasUnseen
                    ? 'bg-gradient-to-tr from-amber-400 via-primary to-pink-500'
                    : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-2 ring-white dark:bg-slate-950 dark:ring-slate-950">
                  <Image src={siteImages.logo} alt="Talba e Islam logo" fill sizes="36px" className="object-cover" />
                </div>
              </button>
            ) : (
              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-200">
                <Image src={siteImages.logo} alt="Talba e Islam logo" fill sizes="40px" className="object-cover" />
              </div>
            )}
            <button
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-secondary dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {member && (
              <Link
                href="/account"
                onClick={closeMobileMenu}
                className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-3 transition-colors hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-secondary">{member.name}</p>
                  <p className="truncate text-xs text-text-light">{member.email}</p>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-300">
              <a href={`mailto:${currentText.contact.email}`} className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium dark:bg-slate-800">
                <MailIcon className="h-4 w-4" />
                <span className="truncate">{currentText.contact.email}</span>
              </a>
              <a href="https://wa.me/923219221401" className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium dark:bg-slate-800">
                <WhatsAppIcon className="h-4 w-4" />
                <span>{currentText.contact.whatsapp}</span>
              </a>
              <a href="tel:+923219221401" className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium dark:bg-slate-800">
                <PhoneIcon className="h-4 w-4" />
                <span>{currentText.contact.phone}</span>
              </a>
            </div>

            <div className="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-4 dark:border-slate-800">
              {currentText.navLinks.map((link) => {
                const isAbout = link.href === '/about' && 'hasMenu' in link;

                if (isAbout) {
                  return (
                    <div key={`${link.href}-${link.label}-mobile`} className="rounded-xl bg-amber-50/60 dark:bg-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setIsMobileAboutExpanded((v) => !v)}
                        aria-expanded={isMobileAboutExpanded}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-primary"
                      >
                        {link.label}
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${isMobileAboutExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isMobileAboutExpanded && (
                        <div className="flex flex-col gap-0.5 px-2 pb-2">
                          {currentText.aboutMenu.map((item) => (
                            <Link
                              key={`${item.title}-mobile`}
                              href={item.href}
                              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-primary dark:text-slate-300 dark:hover:bg-slate-900"
                              onClick={closeMobileMenu}
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${link.href}-${link.label}-mobile`}
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-900"
                    onClick={closeMobileMenu}
                  >
                    {'sublabel' in link ? (
                      <span className="flex flex-col leading-tight">
                        <span>{link.label}</span>
                        <span className="text-xs font-normal opacity-70">{link.sublabel}</span>
                      </span>
                    ) : (
                      link.label
                    )}
                    {'hasMenu' in link && <ChevronDownIcon className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 px-4 py-4 dark:border-slate-800">
            <div className="mb-3 flex gap-3">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={toggleLanguage}
              >
                {language === 'en' ? 'اردو' : 'English'}
              </button>
              <button
                type="button"
                aria-label={currentText.toggleThemeLabel}
                className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
            {member ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {currentText.settingsButton}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {currentText.logoutButton}
                  </button>
                </div>
                <Link
                  href="/campaigns"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm"
                >
                  {currentText.donateButton}
                  <HeartIcon className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    setIsMemberModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
                >
                  <UserIcon className="h-5 w-5" />
                  {currentText.memberButton}
                </button>
                <Link
                  href="/campaigns"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm"
                >
                  {currentText.donateButton}
                  <HeartIcon className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    <MembershipModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
    <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    {storyRing.isViewerOpen && (
      <StoryViewer stories={storyRing.stories} onClose={storyRing.closeViewer} onSeen={storyRing.markSeen} />
    )}
    </>
  );
}
