'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormInput from '@/components/FormInput';

const contactInfo = [
  {
    label: 'Email',
    value: 'talabaeislamkarachi@gmail.com',
    href: 'mailto:talabaeislamkarachi@gmail.com',
  },
  {
    label: 'Phone',
    value: '+92 321 9221401',
    href: 'tel:+923219221401',
  },
  {
    label: 'WhatsApp',
    value: '+92 321 9221401',
    href: 'https://wa.me/923219221401',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSent, setIsSent] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setIsSent(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary-light/5 py-20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              Contact Us
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-secondary sm:text-5xl">
              We would love to hear from you
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-text-light dark:text-slate-400">
              Send a message for donations, volunteering, sponsorships, or general questions.
              Our team will get back to you as soon as possible.
            </p>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-soft-lg sm:p-8 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-3xl font-bold text-secondary">Send a Message</h2>
              <p className="mt-3 text-text-light dark:text-slate-400">
                Fill out the form and we will route your message to the right person.
              </p>

              <form className="mt-8" onSubmit={handleSubmit}>
                <div className="grid gap-x-5 md:grid-cols-2">
                  <FormInput
                    label="Full Name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(value) => updateField('name', value)}
                    required
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(value) => updateField('email', value)}
                    required
                  />
                </div>

                <div className="grid gap-x-5 md:grid-cols-2">
                  <FormInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+92 300 0000000"
                    value={form.phone}
                    onChange={(value) => updateField('phone', value)}
                  />
                  <FormInput
                    label="Subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(value) => updateField('subject', value)}
                    required
                  />
                </div>

                <FormInput
                  label="Message"
                  type="textarea"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(value) => updateField('message', value)}
                  rows={6}
                  required
                />

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button type="submit" className="btn-primary">
                    Submit Message
                  </button>
                  {isSent && (
                    <p className="text-sm font-medium text-primary">
                      Thank you. Your message has been received.
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-amber-50 to-blue-50 p-6 shadow-soft-lg sm:p-8 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
                <h2 className="text-3xl font-bold text-secondary">Contact Details</h2>
                <div className="mt-6 space-y-4">
                  {contactInfo.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block rounded-xl bg-white p-4 shadow-sm transition-colors hover:text-primary dark:bg-slate-800"
                    >
                      <span className="block text-sm font-semibold uppercase tracking-wide text-primary">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-lg font-semibold text-secondary">
                        {item.value}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-secondary">Find Us</h2>
                  <p className="mt-2 text-text-light dark:text-slate-400">
                    Visit our office or use the map to get directions.
                  </p>
                </div>
                <iframe
                  title="Talba e Islam location map"
                  src="https://www.google.com/maps?q=24.9674375,67.0700625&output=embed"
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
