import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface P2User {
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
}

interface P2AuthContextType {
  isAuthenticated: boolean;
  user: P2User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyMFA: (code: string) => Promise<boolean>;
  mfaPending: boolean;
}

const P2AuthContext = createContext<P2AuthContextType | null>(null);

const STORAGE_KEY = 'p2_auth';
const MFA_CORRECT_CODE = '123456';

function loadAuth(): { isAuthenticated: boolean; user: P2User | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.isAuthenticated && parsed?.user) return parsed;
    }
  } catch {}
  return { isAuthenticated: false, user: null };
}

export function P2AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadAuth().isAuthenticated);
  const [user, setUser] = useState<P2User | null>(() => loadAuth().user);
  const [mfaPending, setMfaPending] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated, user }));
  }, [isAuthenticated, user]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock: any valid-looking email + 8+ char password succeeds
    await new Promise(r => setTimeout(r, 1000));
    const mockUser: P2User = {
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role: email.includes('admin') ? 'admin' : 'analyst',
    };
    setUser(mockUser);
    setMfaPending(true);
    return true;
  }, []);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    if (code === MFA_CORRECT_CODE) {
      setIsAuthenticated(true);
      setMfaPending(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setMfaPending(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <P2AuthContext.Provider value={{ isAuthenticated, user, login, logout, verifyMFA, mfaPending }}>
      {children}
    </P2AuthContext.Provider>
  );
}

export function useP2Auth() {
  const ctx = useContext(P2AuthContext);
  if (!ctx) throw new Error('useP2Auth must be used within P2AuthProvider');
  return ctx;
}
