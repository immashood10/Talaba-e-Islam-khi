'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import StatCounter from '@/components/StatCounter';
import MembershipModal from '@/components/MembershipModal';
import { siteImages } from '@/lib/image-assets';

export default function AboutPage() {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-primary-light/5 overflow-hidden dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse animation-delay-200" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl font-bold text-secondary mb-6 leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Talaba e Islam Karachi</span>
            </h1>
            <p className="text-xl text-text-light dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We believe in the power of community and faith. Talaba e Islam Karachi brings
              together students, families, and volunteers dedicated to education, welfare, and
              service &mdash; building a stronger, more compassionate Karachi for everyone.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-secondary mb-6">
                  Our Vision
                </h2>
                <p className="text-lg text-text-light dark:text-slate-400 mb-6 leading-relaxed">
                  At Talaba e Islam Karachi, our mission is to serve our community through
                  education, welfare, and civic engagement rooted in Islamic values.
                  We&apos;ve seen firsthand how organized, grassroots effort can transform
                  lives, and we&apos;ve built a movement dedicated to making that support real,
                  consistent, and accessible.
                </p>
                <p className="text-lg text-text-light dark:text-slate-400 leading-relaxed">
                  From free education and medical camps to disaster relief and mosque
                  development, our members and volunteers have supported thousands of families
                  across Karachi. But this is just the beginning of what we can achieve together.
                </p>
              </div>
              <div className="relative">
                <Image
                  src={siteImages.visionTeamPhoto}
                  alt="Talaba e Islam Karachi team"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-2xl shadow-soft-lg"
                  placeholder="blur"
                />
                <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white rotate-12 shadow-glow">
                  <span className="font-bold rotate-[-12deg]">10+ Years</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-background dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                What We Stand For
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                The values that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Trust & Security',
                  description:
                    'Every member\'s information and contribution is handled with complete integrity and confidentiality.',
                },
                {
                  icon: '💪',
                  title: 'Empowerment',
                  description:
                    'We equip our members and volunteers with the support they need to serve their communities and drive real change.',
                },
                {
                  icon: '❤️',
                  title: 'Compassion',
                  description:
                    'Every act of service matters. We honor every volunteer, every contribution, and every effort made for our community.',
                },
                {
                  icon: '🌍',
                  title: 'Inclusivity',
                  description:
                    'Everyone is welcome to join our movement, regardless of background. Our doors are open to all who share our vision.',
                },
                {
                  icon: '📈',
                  title: 'Transparency',
                  description:
                    'We are open about how we operate and where support goes, so our members and community can trust us fully.',
                },
                {
                  icon: '🤝',
                  title: 'Community',
                  description:
                    'We bring people together around shared faith and purpose, building lasting bonds across Karachi.',
                },
              ].map((value) => (
                <div key={value.title} className="card text-center group hover:-translate-y-2 transition-all duration-300">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-text-light dark:text-slate-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chairman's Message */}
        <section id="chairman-message" className="py-20 bg-gradient-to-br from-primary/5 to-background scroll-mt-20 dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                Chairman&apos;s Message
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                A word from our leadership
              </p>
            </div>

            <div className="grid md:grid-cols-[220px_1fr] gap-8 items-center bg-white rounded-2xl shadow-soft-lg p-8 sm:p-10 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
              <div className="mx-auto flex h-40 w-40 md:h-52 md:w-52 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-6xl font-bold text-white shadow-glow ring-4 ring-primary/20">
                CH
              </div>
              <div>
                <div className="mb-4 text-5xl font-black leading-none text-primary/20">&ldquo;</div>
                <p className="text-lg text-text-light dark:text-slate-400 leading-relaxed italic mb-6">
                  Talaba e Islam Karachi was founded on a simple belief: that our community
                  deserves leaders who serve before they lead. Every initiative we run, every
                  member we welcome, and every rupee entrusted to us carries that responsibility.
                  Together, we are building a movement that puts education, welfare, and the
                  people of Karachi first.
                </p>
                <p className="font-bold text-secondary text-lg">Chairman</p>
                <p className="text-sm text-text-light dark:text-slate-400">Talaba e Islam Karachi</p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                Meet Our Leadership
              </h2>
              <p className="text-xl text-text-light dark:text-slate-400">
                The dedicated people behind Talaba e Islam Karachi
              </p>
            </div>

            <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
              <Image
                src={siteImages.teamPhoto}
                alt="Talba-e-Islam Karachi team gathered at a community iftar event"
                sizes="(max-width: 768px) 100vw, 1152px"
                className="h-auto w-full object-cover"
                placeholder="blur"
              />
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-20 bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl text-blue-100">
                Numbers that tell our story
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                { value: 50000, label: 'Members' },
                { value: 150, label: 'Initiatives Launched' },
                { value: 10000, label: 'Volunteers Mobilized' },
                { value: 18, label: 'Union Councils Reached' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    <StatCounter end={stat.value} />
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
              Join Our Community
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Whether you want to volunteer, support an initiative, or become a member, join
              the Talaba e Islam Karachi family today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Get Involved
              </button>
              <a
                href="/campaigns"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                View Our Initiatives
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <MembershipModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
    </div>
  );
}
