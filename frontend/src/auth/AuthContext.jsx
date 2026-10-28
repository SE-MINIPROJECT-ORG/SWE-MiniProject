import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// Placeholder state for the scaffold. The real login (EVT-F-002) replaces it later.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      role: user ? user.role : 'VISITOR',
      login: (nextUser) => setUser(nextUser),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
