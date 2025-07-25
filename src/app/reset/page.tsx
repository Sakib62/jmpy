"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { supabase } from "../../utils/supabaseClient";

export default function ResetPasswordPage() {
  const headerProps = {
    user: null,
    onSignIn: () => {},
    onMyUrls: () => {},
    onProfile: () => {},
  };
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  // Check if user is in recovery mode
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user && data.session?.user.email) {
        setSessionChecked(true);
      } else {
        toast.error("Invalid or expired reset link.");
        router.replace("/");
      }
    });
  }, [router]);

  function validatePassword(pw: string) {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validatePassword(newPassword) || newPassword !== confirmPassword)
      return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Password updated!");
      setSigningIn(true);
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) return null;
  if (signingIn) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 animate-bg-gradient relative">
        {/* Blurred overlay */}
        <div className="absolute inset-0 z-10 backdrop-blur-md pointer-events-none" />
        {/* App layout (blurred) */}
        <div className="relative z-0 flex flex-col min-h-screen w-full pointer-events-none select-none">
          <Header {...headerProps} />
          <div className="flex-1" />
          <Footer />
        </div>
        {/* Modal overlay (interactive) */}
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-fade-in-up flex flex-col items-center border border-gray-200 pointer-events-auto">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-semibold text-gray-800">
              Signing you in...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 animate-bg-gradient relative">
      {/* Blurred overlay */}
      <div className="absolute inset-0 z-10 backdrop-blur-sm pointer-events-none" />
      {/* App layout (blurred) */}
      <div className="relative z-0 flex flex-col min-h-screen w-full pointer-events-none select-none">
        <Header {...headerProps} />
        <div className="flex-1" />
        <Footer />
      </div>
      {/* Modal overlay (interactive) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-fade-in-up border border-gray-200 pointer-events-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Set New Password
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative w-full">
              <input
                type={showNewPw ? "text" : "password"}
                required
                placeholder="New password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm pr-10 text-base"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPw((v) => !v)}
                aria-label={showNewPw ? "Hide password" : "Show password"}
              >
                {showNewPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {touched && newPassword && !validatePassword(newPassword) && (
              <div className="text-xs text-red-600 mt-1 ml-1">
                Password must be at least 8 characters and include an uppercase
                letter, a lowercase letter, a number, and a symbol.
              </div>
            )}
            <div className="relative w-full">
              <input
                type={showConfirmPw ? "text" : "password"}
                required
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm pr-10 text-base"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPw((v) => !v)}
                aria-label={showConfirmPw ? "Hide password" : "Show password"}
              >
                {showConfirmPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {touched && confirmPassword && newPassword !== confirmPassword && (
              <div className="text-xs text-red-600 mt-1 ml-1">
                Passwords do not match.
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold text-base hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 mt-2"
              disabled={loading}
            >
              {loading ? "Updating..." : "Set Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
