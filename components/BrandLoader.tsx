interface BrandLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: { box: 'h-8 w-8', ring: 'border-2', icon: 'h-3.5 w-3.5' },
  md: { box: 'h-16 w-16', ring: 'border-[3px]', icon: 'h-6 w-6' },
  lg: { box: 'h-24 w-24', ring: 'border-4', icon: 'h-9 w-9' },
} as const;

function MinaretIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2l1.6 2.3h-3.2L12 2.2z" />
      <rect x="10.6" y="4.5" width="2.8" height="2.4" />
      <path d="M8.6 6.9h6.8l-1.1 3.1h-4.6l-1.1-3.1z" />
      <rect x="10.1" y="10" width="3.8" height="8.2" />
      <rect x="6.8" y="18.2" width="10.4" height="2.1" rx="0.5" />
    </svg>
  );
}

export default function BrandLoader({ size = 'md', label, fullScreen = false }: BrandLoaderProps) {
  const s = sizeMap[size];

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${s.box}`}>
        <div className={`absolute inset-0 rounded-full ${s.ring} border-secondary/15`} />
        <div
          className={`absolute inset-0 rounded-full ${s.ring} border-transparent border-t-secondary border-r-secondary animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-secondary">
          <MinaretIcon className={s.icon} />
        </div>
      </div>
      {label && <p className="text-sm font-medium text-secondary">{label}</p>}
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
      {spinner}
    </div>
  );
}
