import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import api, { setAuthToken } from "../api/axios";
import { auth } from "../firebase";
import { AuthContext } from "./AuthContext.js";

const adminEmail = import.meta.env.ADMIN_EMAIL?.trim().toLowerCase();

const isConfiguredAdmin = (firebaseUser) =>
  Boolean(
    adminEmail &&
      firebaseUser.email &&
      firebaseUser.email.toLowerCase() === adminEmail
  );

const unauthorizedError = () => ({
  response: { status: 403 },
});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentOperation = 0;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const operation = ++currentOperation;

      if (!firebaseUser) {
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        if (!isConfiguredAdmin(firebaseUser)) {
          setError(
            adminEmail
              ? "This Google account is not authorized for the admin portal."
              : "Set ADMIN_EMAIL in the admin app environment to enable admin sign-in."
          );
          await signOut(auth);
          return;
        }

        const idToken = await firebaseUser.getIdToken();
        setAuthToken(idToken);
        const response = await api.get("/dashboard");
        if (operation !== currentOperation) return;
        setAccessToken(idToken);
        setUser({ ...response.data.user, email: firebaseUser.email });
        setError("");
      } catch (authError) {
        if (operation !== currentOperation) return;
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
        setError(
          authError.response?.status === 403
            ? "This Google account is not authorized for the admin portal."
            : "Unable to verify admin access. Please try again.",
        );
        if (
          authError.response?.status === 401 ||
          authError.response?.status === 403
        ) {
          await signOut(auth);
        } else {
          console.error("Unable to verify Firebase admin access:", authError);
        }
      } finally {
        if (operation === currentOperation) setLoading(false);
      }
    });

    return () => {
      currentOperation += 1;
      unsubscribe();
      setAuthToken(null);
    };
  }, []);

  const loginWithGoogle = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    if (!isConfiguredAdmin(firebaseUser)) {
      setError(
        adminEmail
          ? "This Google account is not authorized for the admin portal."
          : "Set ADMIN_EMAIL in the admin app environment to enable admin sign-in."
      );
      await signOut(auth);
      throw unauthorizedError();
    }
    const idToken = await firebaseUser.getIdToken();
    setAuthToken(idToken);

    try {
      const response = await api.get("/dashboard");
      setAccessToken(idToken);
      setUser({ ...response.data.user, email: firebaseUser.email });
    } catch (authError) {
      setAuthToken(null);
      setAccessToken(null);
      setUser(null);
      if (
        authError.response?.status === 401 ||
        authError.response?.status === 403
      ) {
        setError("This Google account is not authorized for the admin portal.");
        await signOut(auth);
      }
      throw authError;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        error,
        loginWithGoogle,
        logout,
        isAuthenticated: Boolean(accessToken),
        loading,
      }}
    >
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <div className="text-sm text-gray-400">Checking admin access...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
