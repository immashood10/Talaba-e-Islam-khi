'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import StatCounter from '@/components/StatCounter';
import MembershipModal from '@/components/MembershipModal';
import { categories } from '@/lib/mock-data';
import { siteImages } from '@/lib/image-assets';
import { useLanguage } from '@/lib/language-context';
import EventCard from '@/components/EventCard';
import type { EventWithMeta } from '@/lib/event-view';

const copy = {
  en: {
    heroTitle: 'Welcome to Talaba e Islam Karachi',
    heroDescription:
      'A movement dedicated to education, community welfare, and serving the people of Karachi. Join us in building a stronger, more compassionate community rooted in Islamic values.',
    startFundraiser: 'Get Involved',
    donateNow: 'Support the Party',
    stats: [
      { value: 50000, label: 'Members' },
      { value: 150, label: 'Initiatives' },
      { value: 2000, label: 'Volunteers' },
    ],
    browseTitle: 'Our Focus Areas',
    browseDescription: 'Explore the initiatives shaping our community',
    impactTitle: 'Impact Gallery',
    impactDescription: 'Browse real images from our initiatives, events, and community gatherings that show our work in action.',
    howItWorksTitle: 'How to Get Involved',
    howItWorksDescription: 'Join the movement and make an impact in three simple steps',
    steps: [
      {
        number: '01',
        title: 'Become a Member',
        description: 'Sign up to join Talaba e Islam Karachi and become part of our growing movement.',
      },
      {
        number: '02',
        title: 'Attend Events & Volunteer',
        description: 'Take part in our programs, rallies, and community initiatives on the ground.',
      },
      {
        number: '03',
        title: 'Support Our Initiatives',
        description: 'Contribute to the causes and programs that matter most to you and your community.',
      },
    ],
    startToday: 'Join Us Today',
    ctaTitle: 'Ready to Join the Movement?',
    ctaDescription: 'Become part of a growing community dedicated to education, welfare, and service. Your journey with Talaba e Islam Karachi starts here.',
    ctaPrimary: 'Join Now',
    ctaSecondary: 'View Our Initiatives',
    testimonialsTitle: 'What Our Members Say',
    testimonialsDescription: 'Hear from members, volunteers, and community leaders who are part of this movement.',
    testimonials: [
      {
        name: 'Ayesha Khan',
        role: 'Party Member',
        quote:
          'Talaba e Islam Karachi makes being part of something bigger feel personal. I can see where our efforts are going, and the leadership follows through with care.',
      },
      {
        name: 'Muhammad Ali',
        role: 'Volunteer',
        quote:
          'The work is organized, respectful, and focused on real needs. Every initiative I joined felt meaningful from day one.',
      },
      {
        name: 'Sana Ahmed',
        role: 'Community Member',
        quote:
          'Their education programs helped children in our area continue school with dignity. That consistency matters to families.',
      },
      {
        name: 'Bilal Hussain',
        role: 'Youth Wing Member',
        quote:
          'Updates on our initiatives were clear and timely. It gave me confidence that even a small contribution was part of something useful.',
      },
    ],
  },
  ur: {
    heroTitle: 'تلبہ اسلام کراچی میں خوش آمدید',
    heroDescription:
      'تعلیم، فلاحی خدمات، اور کراچی کے عوام کی خدمت کے لیے ایک تحریک۔ اسلامی اقدار پر مبنی ایک مضبوط اور ہمدرد معاشرے کی تعمیر میں ہمارا ساتھ دیں۔',
    startFundraiser: 'شامل ہوں',
    donateNow: 'ہماری مدد کریں',
    stats: [
      { value: 50000, label: 'ارکان' },
      { value: 150, label: 'اقدامات' },
      { value: 2000, label: 'رضاکار' },
    ],
    browseTitle: 'ہمارے شعبہ جات',
    browseDescription: 'ہماری کمیونٹی کے اقدامات دریافت کریں',
    impactTitle: 'اثراتی گیلری',
    impactDescription: 'ہمارے اقدامات، تقریبات، اور کمیونٹی اجتماعات کی حقیقی تصاویر دیکھیں جو ہمارے کام کو ظاہر کرتی ہیں۔',
    howItWorksTitle: 'کیسے شامل ہوں',
    howItWorksDescription: 'تین آسان مراحل میں تحریک میں شامل ہوں اور فرق پیدا کریں',
    steps: [
      {
        number: '01',
        title: 'رکن بنیں',
        description: 'تلبہ اسلام کراچی میں شامل ہونے کے لیے رجسٹر کریں اور ہماری بڑھتی ہوئی تحریک کا حصہ بنیں۔',
      },
      {
        number: '02',
        title: 'تقریبات میں شرکت کریں اور رضاکارانہ خدمات دیں',
        description: 'ہمارے پروگراموں، ریلیوں، اور کمیونٹی اقدامات میں براہ راست حصہ لیں۔',
      },
      {
        number: '03',
        title: 'ہمارے اقدامات کی مدد کریں',
        description: 'ان مقاصد اور پروگراموں میں تعاون کریں جو آپ اور آپ کی کمیونٹی کے لیے سب سے اہم ہیں۔',
      },
    ],
    startToday: 'آج ہی شامل ہوں',
    ctaTitle: 'کیا آپ تحریک میں شامل ہونے کے لیے تیار ہیں؟',
    ctaDescription: 'تعلیم، فلاح، اور خدمت کے لیے وقف ایک بڑھتی ہوئی کمیونٹی کا حصہ بنیں۔ تلبہ اسلام کراچی کے ساتھ آپ کا سفر یہیں سے شروع ہوتا ہے۔',
    ctaPrimary: 'ابھی شامل ہوں',
    ctaSecondary: 'ہمارے اقدامات دیکھیں',
    testimonialsTitle: 'ہمارے ارکان کیا کہتے ہیں',
    testimonialsDescription: 'ارکان، رضاکاروں، اور کمیونٹی رہنماؤں کی رائے جو اس تحریک کا حصہ ہیں۔',
    testimonials: [
      {
        name: 'Ayesha Khan',
        role: 'Party Member',
        quote:
          'Talaba e Islam Karachi makes being part of something bigger feel personal. I can see where our efforts are going, and the leadership follows through with care.',
      },
      {
        name: 'Muhammad Ali',
        role: 'Volunteer',
        quote:
          'The work is organized, respectful, and focused on real needs. Every initiative I joined felt meaningful from day one.',
      },
      {
        name: 'Sana Ahmed',
        role: 'Community Member',
        quote:
          'Their education programs helped children in our area continue school with dignity. That consistency matters to families.',
      },
      {
        name: 'Bilal Hussain',
        role: 'Youth Wing Member',
        quote:
          'Updates on our initiatives were clear and timely. It gave me confidence that even a small contribution was part of something useful.',
      },
    ],
  },
} as const;

export default function HomePage() {
  const { language } = useLanguage();
  const currentCopy = copy[language];
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithMeta[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        const relevant = ((data.events ?? []) as EventWithMeta[])
          .filter((e) => e.status === 'live' || e.status === 'today' || e.status === 'upcoming')
          .sort((a, b) => a.date.localeCompare(b.date));
        setUpcomingEvents(relevant);
      } catch {
        // ignore - empty state handles this
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % currentCopy.testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [currentCopy.testimonials.length]);

  useEffect(() => {
    if (siteImages.heroCarousel.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % siteImages.heroCarousel.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const showPreviousTestimonial = () => {
    setActiveTestimonial((current) =>
      current === 0 ? currentCopy.testimonials.length - 1 : current - 1
    );
  };

  const showNextTestimonial = () => {
    setActiveTestimonial((current) => (current + 1) % currentCopy.testimonials.length);
  };

  const featuredEvent =
    upcomingEvents.find((e) => e.isFeatured) ?? (upcomingEvents.length > 0 ? upcomingEvents[0] : null);
  const latestEvents = upcomingEvents.filter((e) => e.id !== featuredEvent?.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary-light/5 pt-20 pb-32 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="absolute inset-0 lg:hidden">
            {siteImages.heroCarousel.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === activeHeroImage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 0px, 100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 hidden opacity-30 lg:block">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse animation-delay-200" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left animate-slide-up">
                <h1 className="text-4xl lg:text-6xl font-extrabold text-secondary leading-tight">
                  {currentCopy.heroTitle}
                </h1>
                <p className="mt-6 text-lg lg:text-xl text-white lg:text-text-light dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                  {currentCopy.heroDescription}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(true)}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    {currentCopy.startFundraiser}
                  </button>
                  <Link href="/campaigns" className="btn-secondary text-lg px-8 py-4">
                    {currentCopy.donateNow}
                  </Link>
                </div>

                <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                  {currentCopy.stats.map((stat) => (
                    <div key={stat.label} className="text-center lg:text-left">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                        <StatCounter end={stat.value} />
                      </div>
                      <div className="text-xs sm:text-sm lg:text-base text-text-light dark:text-slate-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block animate-slide-up">
                <div className="relative rounded-3xl shadow-soft-lg h-[420px]">
                  <Image
                    src={siteImages.heroIllustration}
                    alt="Talba-e-Islam community support illustration"
                    fill
                    sizes="(min-width: 1280px) 584px, (min-width: 1024px) 50vw, 0px"
                    className="object-contain p-8"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">Upcoming Events</h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                Join us at our next gatherings and initiatives
              </p>
            </div>

            {isLoadingEvents ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse p-0">
                    <div className="h-44 rounded-t-xl bg-gray-200 dark:bg-slate-800" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
                      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !featuredEvent ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗓️</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No upcoming events right now</h3>
                <p className="text-text-light dark:text-slate-400 mb-6">
                  Check back soon, or explore what we&apos;ve hosted in the past.
                </p>
                <Link href="/events" className="btn-primary">
                  View All Events
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Featured Event</p>
                  <div className="mx-auto max-w-3xl">
                    <EventCard event={featuredEvent} />
                  </div>
                </div>

                {latestEvents.length > 0 && (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-10">
                    {latestEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}

                <div className="text-center">
                  <Link href="/events" className="btn-secondary">
                    View All Events
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-primary/5 to-background dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {currentCopy.browseTitle}
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                {currentCopy.browseDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/campaigns?category=${category.id}`}
                  className={`group p-6 rounded-2xl border-2 border-transparent hover:border-primary transition-all duration-300 hover:-translate-y-1 ${category.color} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-lg">{category.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ImageGallery
          title={currentCopy.impactTitle}
          description={currentCopy.impactDescription}
          images={siteImages.gallery}
        />

        <section className="py-20 bg-gradient-to-br from-primary/5 to-background dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {currentCopy.howItWorksTitle}
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                {currentCopy.howItWorksDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {currentCopy.steps.map((step, index) => (
                <div
                  key={step.number}
                  className="card text-center group hover:-translate-y-2 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-glow group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-light dark:text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="btn-primary"
              >
                {currentCopy.startToday}
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src={siteImages.communityPortrait}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              loading="lazy"
            />
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {currentCopy.ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {currentCopy.ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {currentCopy.ctaPrimary}
              </button>
              <Link
                href="/campaigns"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                {currentCopy.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-secondary">
                {currentCopy.testimonialsTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-text-light dark:text-slate-400">
                {currentCopy.testimonialsDescription}
              </p>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-white to-blue-50 p-4 shadow-soft-lg sm:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                >
                  {currentCopy.testimonials.map((testimonial) => (
                    <article
                      key={testimonial.name}
                      className="min-w-full px-1 sm:px-4"
                    >
                      <div className="grid min-h-[320px] items-center gap-8 rounded-xl bg-white p-6 shadow-soft md:grid-cols-[0.8fr_1.2fr] md:p-10 dark:bg-slate-800">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white shadow-glow">
                            {testimonial.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <h3 className="mt-5 text-2xl font-bold text-secondary">
                            {testimonial.name}
                          </h3>
                          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-primary">
                            {testimonial.role}
                          </p>
                        </div>

                        <blockquote className="text-center md:text-left">
                          <div className="mb-5 text-6xl font-black leading-none text-primary/20">
                            &ldquo;
                          </div>
                          <p className="text-xl font-medium leading-relaxed text-gray-700 md:text-2xl dark:text-slate-300">
                            {testimonial.quote}
                          </p>
                        </blockquote>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={showPreviousTestimonial}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white text-secondary shadow-sm transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  {currentCopy.testimonials.map((testimonial, index) => (
                    <button
                      key={`${testimonial.name}-dot`}
                      type="button"
                      aria-label={`Show testimonial ${index + 1}`}
                      onClick={() => setActiveTestimonial(index)}
                      className={`h-2.5 rounded-full transition-all duration-200 ${
                        activeTestimonial === index
                          ? 'w-8 bg-primary'
                          : 'w-2.5 bg-blue-100 hover:bg-primary/50 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={showNextTestimonial}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white text-secondary shadow-sm transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <MembershipModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
    </div>
  );
}
