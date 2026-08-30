'use client';

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+923219221401';
const whatsappMessage = encodeURIComponent(
  'Hello, I would like to get in touch regarding Talba-e-Islam Karachi.'
);

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-110 hover:bg-[#1ebe57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
    >
      <svg
        className="h-7 w-7"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.15c-.26-.13-1.53-.76-1.77-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.03-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.08-1.27-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.39.11-.52.11-.11.26-.3.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.44-.07-.13-.58-1.4-.79-1.91-.21-.5-.42-.43-.58-.44h-.5c-.17 0-.44.07-.67.32-.24.26-.9.88-.9 2.15 0 1.27.93 2.5 1.06 2.67.13.17 1.82 2.78 4.41 3.89.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.08 1.53-.63 1.74-1.24.22-.61.22-1.13.15-1.24-.06-.1-.23-.17-.49-.29zm-3.02 8.82h-.01a12.8 12.8 0 0 1-6.53-1.79l-.47-.28-4.86 1.28 1.3-4.74-.31-.49a12.77 12.77 0 1 1 10.88 6.02zm10.92-12.8A16 16 0 0 0 5.66 2.35a15.87 15.87 0 0 0-2.5 19l-1.67 6.08 6.23-1.63a15.94 15.94 0 0 0 7.62 1.95h.01A15.99 15.99 0 0 0 26.98 13.17z" />
      </svg>
    </a>
  );
}