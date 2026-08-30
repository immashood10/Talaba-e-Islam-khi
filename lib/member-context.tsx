'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface PublicMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  hasPassword: boolean;
}

type MemberContextValue = {
  member: PublicMember | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (member: PublicMember) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<PublicMember | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMember = async () => {
    const data = await fetch('/api/member/me')
      .then((res) => (res.ok ? res.json() : { member: null, isAdmin: false }))
      .catch(() => ({ member: null, isAdmin: false }));
    setMember(data.member ?? null);
    setIsAdmin(data.isAdmin ?? false);
  };

  useEffect(() => {
    fetchMember().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      isAdmin,
      isLoading,
      login: (loggedInMember) => setMember(loggedInMember),
      logout: async () => {
        await fetch('/api/member/logout', { method: 'POST' }).catch(() => {});
        setMember(null);
      },
      refresh: fetchMember,
    }),
    [member, isAdmin, isLoading],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const context = useContext(MemberContext);

  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }

  return context;
}
