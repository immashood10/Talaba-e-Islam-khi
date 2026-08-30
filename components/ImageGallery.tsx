import Image, { StaticImageData } from 'next/image';

interface GalleryImage {
  src: StaticImageData | string;
  alt: string;
}

interface ImageGalleryProps {
  title?: string;
  description?: string;
  images: GalleryImage[];
}

export default function ImageGallery({ title, description, images }: ImageGalleryProps) {
  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {title && <h2 className="text-4xl font-bold text-secondary mb-4">{title}</h2>}
          {description && <p className="text-xl text-text-light dark:text-slate-400 max-w-3xl mx-auto">{description}</p>}
        </div>

        <div className="grid auto-rows-[240px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              className={`group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-soft ${
                index === 0 || index === 3 ? 'lg:row-span-2' : ''
              }`}
            >
              <div className="relative h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <p className="text-sm font-medium">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
