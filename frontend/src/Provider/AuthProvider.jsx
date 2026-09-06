import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "../firebase/firebase.config";
import { api } from "../lib/api";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refreshProfile(current = auth.currentUser) {
    if (!current) return;
    const data = await api(`/users/role/${encodeURIComponent(current.email)}`);
    setProfile(data);
    setError("");
    return data;
  }
  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      if (!active) return;
      const request = ++revision;
      setUser(current);
      setProfile(null);
      setError("");
      setLoading(true);
      try {
        if (current) {
          const data = await api(
            `/users/role/${encodeURIComponent(current.email)}`,
          );
          if (active && revision === request) setProfile(data);
        }
      } catch (err) {
        if (active && revision === request) setError(err.message);
      } finally {
        if (active && revision === request) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return (
    <AuthContext
      value={{
        user,
        profile,
        loading,
        error,
        refreshProfile,
        logout: () => signOut(auth),
      }}
    >
      {children}
    </AuthContext>
  );
}
