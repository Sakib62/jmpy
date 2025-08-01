import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi";
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
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  useEffect(() => {
    setSignInEmail("");
    setSignInPassword("");
    setSignUpEmail("");
    setSignUpPassword("");
    setShowForgotPw(false);
    setForgotEmail("");
    setForgotLoading(false);
    setForgotSubmitted(false);
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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
    setForgotLoading(true);
    if (!validateEmail(forgotEmail)) {
      setForgotLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: baseUrl + "/reset",
      });
      if (error) throw error;
      toast.success("Check your email for a password reset link.");
      setShowForgotPw(false);
    } catch (err: unknown) {
      let msg = "Failed to send reset email";
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6 sm:p-8 w-[90%] max-w-[320px] sm:max-w-sm relative animate-fade-in-up">
        <button
          className="absolute text-3xl text-gray-500/60 top-3 right-3 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        {showForgotPw ? (
          <>
            <h2 className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-center text-gray-900">
              <FiMail className="inline-block mb-1" /> Reset Password
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleForgotPassword}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="px-4 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
              />
              {forgotSubmitted &&
                forgotEmail &&
                !validateEmail(forgotEmail) && (
                  <div className="mt-0 ml-1 text-xs text-red-600">
                    Enter a valid email address.
                  </div>
                )}
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div className="mt-3 text-sm text-center text-gray-700">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowForgotPw(false)}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold text-center text-gray-900">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>
            <form className="flex flex-col gap-4" onSubmit={handleAuth}>
              {isSignUp ? (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="px-4 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    onBlur={() => setTouchedEmail(true)}
                    disabled={loading}
                  />
                  {(touchedEmail || formSubmitted) &&
                    signUpEmail &&
                    !validateEmail(signUpEmail) && (
                      <div className="mt-0 ml-1 text-xs text-red-600">
                        Enter a valid email address.
                      </div>
                    )}
                  <div className="relative w-full">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="Password"
                      className="w-full px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      onBlur={() => setTouchedPw(true)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {(touchedPw || formSubmitted) &&
                    signUpPassword &&
                    !validatePassword(signUpPassword) && (
                      <div className="mt-0 ml-1 text-xs text-red-600">
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
                    className="px-4 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    onBlur={() => setTouchedEmail(true)}
                    disabled={loading}
                  />
                  {(touchedEmail || formSubmitted) &&
                    signInEmail &&
                    !validateEmail(signInEmail) && (
                      <div className="mt-0 ml-1 text-xs text-red-600">
                        Enter a valid email address.
                      </div>
                    )}
                  <div className="relative w-full">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="Password"
                      className="w-full px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      onBlur={() => setTouchedPw(true)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {(touchedPw || formSubmitted) &&
                    signInPassword &&
                    !validatePassword(signInPassword) && (
                      <div className="mt-0 ml-1 text-xs text-red-600">
                        Password must be at least 8 characters and include an
                        uppercase letter, a lowercase letter, a number, and a
                        symbol.
                      </div>
                    )}
                </>
              )}
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
            <div className="mt-3 text-sm text-center text-gray-700">
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
                  <br />
                  <button
                    className="mt-2 text-blue-600 hover:underline"
                    onClick={() => setShowForgotPw(true)}
                    type="button"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
