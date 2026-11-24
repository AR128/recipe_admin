import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";

const getAuthErrorMessage = (error) => {
  if (error.response?.status === 403) {
    return "This Google account is not authorized for the admin portal.";
  }

  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before you finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
    case "auth/unauthorized-domain":
      return "This site is not authorized in Firebase Authentication settings.";
    case "auth/network-request-failed":
      return "We couldn't reach Google. Check your connection and try again.";
    default:
      return "Google sign-in couldn't be completed. Please try again.";
  }
};

const Login = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { error, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (authError) {
      setSubmitError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 text-[#F5F0E8]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141412] p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A96E]/20 bg-[#C9A96E]/10 text-[#C9A96E]">
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A96E]">
          Poodiest control room
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-white">
          Admin access
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Continue with the authorized Google account to manage the platform.
        </p>

        {(submitError || error) && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-left text-sm text-red-200"
          >
            {submitError || error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
            />
            <path
              fill="#EA4335"
              d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9A19.6 19.6 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
            />
          </svg>
          {submitting ? "Verifying Google account..." : "Continue with Google"}
        </button>
        <p className="mt-5 text-xs text-gray-500">
          Admin access is restricted to approved Google accounts.
        </p>
      </section>
    </div>
  );
};

export default Login;
