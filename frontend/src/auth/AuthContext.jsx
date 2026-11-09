import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ems_session';

// The session (token, user, expiry time) survives a page refresh until the token expires.
function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (session && session.expiresAt > Date.now()) return session;
  } catch {
    // Ignore a broken or unavailable storage and start logged out.
  }
  return null;
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode); the session then lasts until refresh.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const update = useCallback((next) => {
    saveSession(next);
    setSession(next);
  }, []);

  // Log out automatically when the 60-minute token expires.
  useEffect(() => {
    if (!session) return undefined;
    const timer = setTimeout(() => update(null), session.expiresAt - Date.now());
    return () => clearTimeout(timer);
  }, [session, update]);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      update({ token: data.token, user: data.user, expiresAt: Date.now() + data.expiresIn * 1000 });
      return data.user;
    },
    [update]
  );

  const logout = useCallback(async () => {
    if (session) {
      try {
        await authApi.logout(session.token);
      } catch {
        // The token may already be expired; the local session is cleared anyway.
      }
    }
    update(null);
  }, [session, update]);

  // Keeps the shown name up to date after the user edits their profile (EVT-F-007).
  const updateUser = useCallback(
    (user) => {
      if (session) update({ ...session, user: { ...session.user, ...user } });
    },
    [session, update]
  );

  const value = useMemo(
    () => ({
      user: session ? session.user : null,
      token: session ? session.token : null,
      role: session ? session.user.role : 'VISITOR',
      login,
      logout,
      updateUser,
    }),
    [session, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
