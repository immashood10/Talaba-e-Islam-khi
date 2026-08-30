'use client';

// Loads Google Identity Services and shows the One Tap prompt so story
// viewers can be identified by their Gmail without leaving the page. Best
// effort only: if the browser has no active Google session, or the user
// dismisses the prompt, no credential ever arrives and the caller should
// keep treating the viewer as an anonymous guest.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function promptGoogleOneTap(onCredential: (credential: string) => void): Promise<void> {
  if (typeof window === 'undefined') return;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return;

  try {
    await loadGsiScript();
  } catch {
    return;
  }

  if (!window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  window.google.accounts.id.prompt();
}
