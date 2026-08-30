'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import { siteImages } from '@/lib/image-assets';

const activities = [
  {
    icon: '🕌',
    title: 'Five Daily Prayers',
    description: 'The mosque hosts all five daily congregational prayers (Namaz) led by the Imam, open to all members of the community.',
  },
  {
    icon: '🗓️',
    title: 'Jumma Congregation',
    description: 'A large Friday (Jumma) congregation with khutbah, welcoming worshippers from across Muslim Town and nearby areas.',
  },
  {
    icon: '📖',
    title: 'Quran & Deeniyat Classes',
    description: 'Regular Quran recitation (Nazra) and basic Islamic education classes for children and adults.',
  },
  {
    icon: '🎤',
    title: 'Religious Gatherings',
    description: 'Mehfil-e-Naat, Milad, and other religious gatherings are held throughout the year to mark important occasions.',
  },
  {
    icon: '🤲',
    title: 'Community Iftar',
    description: 'During Ramadan, the mosque organises community iftar and food distribution for worshippers and those in need.',
  },
  {
    icon: '🤝',
    title: 'Community Support',
    description: 'The mosque serves as a hub for guidance, counselling, and welfare support for the local community.',
  },
];

export default function JamaMasjidPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={siteImages.jamaMasjid}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl font-bold text-secondary mb-4 leading-tight">
              Jama Masjid <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Muslim Town</span>
            </h1>
            <p className="text-lg font-medium text-primary mb-6">
              Muslim Town, Karachi
            </p>
            <p className="text-xl text-text-light dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              A place of worship, learning, and community service maintained with the support
              of Talaba e Islam Karachi &mdash; open to all for prayers, religious education, and
              community gatherings.
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-secondary mb-6">
                  About the Mosque
                </h2>
                <p className="text-lg text-text-light dark:text-slate-400 mb-6 leading-relaxed">
                  Jama Masjid Muslim Town (also known locally as Markaz-e-Islam) is a
                  neighbourhood mosque serving the Muslim Town area of Karachi. It stands as a
                  centre for prayer, Islamic education, and community life for residents of the
                  surrounding area.
                </p>
                <p className="text-lg text-text-light dark:text-slate-400 leading-relaxed">
                  Talaba e Islam Karachi supports the mosque&apos;s upkeep and community
                  programs as part of its broader mission of education, welfare, and service
                  rooted in Islamic values.
                </p>
              </div>
              <div className="relative">
                <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-soft-lg">
                  <Image
                    src={siteImages.jamaMasjid}
                    alt="Jama Masjid Muslim Town, Karachi"
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mosque's Work Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-background dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                Mosque Activities
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                How Jama Masjid Muslim Town serves the community
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="card text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{activity.icon}</div>
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-text-light dark:text-slate-400">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ImageGallery
          title="Photo Gallery"
          description="Glimpses of Jama Masjid Muslim Town"
          images={siteImages.jamaMasjidGallery}
        />

        {/* Location Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-background dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Location
            </h2>
            <div className="card mt-8 inline-block px-10 py-8">
              <p className="text-lg font-semibold text-secondary">
                Jama Masjid Muslim Town (Markaz-e-Islam)
              </p>
              <p className="text-lg text-text-light dark:text-slate-400 mt-1">
                Muslim Town, Karachi, Pakistan
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Support the Mosque
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Reach out to learn how you can support Jama Masjid Muslim Town or get involved
              with its community programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
