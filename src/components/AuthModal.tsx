import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient";

export default function AuthModal({
  open,
  onClose,
  onAuth,
  onSignUp,
}: {
  open: boolean;
  onClose: () => void;
  onAuth: (user: User | null) => void;
  onSignUp?: () => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setSignInEmail("");
    setSignInPassword("");
    setSignUpEmail("");
    setSignUpPassword("");
    if (open) setIsSignUp(false); // Always default to sign-in when modal opens
  }, [open]);

  function validateEmail(email: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }
  function validatePassword(pw: string) {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setLoading(true);
    const email = isSignUp ? signUpEmail : signInEmail;
    const password = isSignUp ? signUpPassword : signInPassword;
    if (!validateEmail(email)) {
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setLoading(false);
      return;
    }
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
      if (result.error) throw result.error;
      onAuth(result.data.user ?? null);
      if (isSignUp && onSignUp) onSignUp();
      onClose();
    } catch (err: unknown) {
      let msg = "Auth failed";
      if (err instanceof Error) {
        if (
          err.message.toLowerCase().includes("password") &&
          (err.message.includes("at least") ||
            err.message.includes("must contain"))
        ) {
          msg =
            "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.";
        } else {
          msg = err.message;
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in-up">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          {isSignUp ? (
            <>
              <input
                type="email"
                required
                placeholder="Email"
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                onBlur={() => setTouchedEmail(true)}
                disabled={loading}
              />
              {(touchedEmail || formSubmitted) &&
                signUpEmail &&
                !validateEmail(signUpEmail) && (
                  <div className="text-xs text-red-600 mt-0 ml-1">
                    Enter a valid email address.
                  </div>
                )}
              <div className="relative w-full">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm pr-10"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  onBlur={() => setTouchedPw(true)}
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {(touchedPw || formSubmitted) &&
                signUpPassword &&
                !validatePassword(signUpPassword) && (
                  <div className="text-xs text-red-600 mt-0 ml-1">
                    Password must be at least 8 characters and include an
                    uppercase letter, a lowercase letter, a number, and a
                    symbol.
                  </div>
                )}
            </>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Email"
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                onBlur={() => setTouchedEmail(true)}
                disabled={loading}
              />
              {(touchedEmail || formSubmitted) &&
                signInEmail &&
                !validateEmail(signInEmail) && (
                  <div className="text-xs text-red-600 mt-0 ml-1">
                    Enter a valid email address.
                  </div>
                )}
              <div className="relative w-full">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm pr-10"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  onBlur={() => setTouchedPw(true)}
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {(touchedPw || formSubmitted) &&
                signInPassword &&
                !validatePassword(signInPassword) && (
                  <div className="text-xs text-red-600 mt-0 ml-1">
                    Password must be at least 8 characters and include an
                    uppercase letter, a lowercase letter, a number, and a
                    symbol.
                  </div>
                )}
            </>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            disabled={loading}
          >
            {loading
              ? isSignUp
                ? "Signing up..."
                : "Signing in..."
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>
        <div className="text-sm text-center mt-3 text-gray-700">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
