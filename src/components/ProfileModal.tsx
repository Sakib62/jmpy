import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff, FiKey, FiLogOut, FiMail, FiX } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient";

const TABS = [
  { key: "email", label: "Email", icon: <FiMail className="inline mr-2" /> },
  {
    key: "password",
    label: "Password",
    icon: <FiKey className="inline mr-2" />,
  },
];

export default function ProfileModal({
  open,
  onClose,
  user,
  setUser,
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}) {
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  // Track touched state for each field
  const [touchedCurrent, setTouchedCurrent] = useState(false);
  const [touchedNew, setTouchedNew] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Password validation helper
  function validatePassword(pw: string) {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }

  // Change Email
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMsg("");
    if (!email || email === user?.email) {
      setEmailMsg("Please enter a new email.");
      setEmailLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ email });
    setEmailLoading(false);
    setEmailMsg(
      error ? error.message : "Check your email to confirm the change."
    );
    // After email change, refresh session and update user
    if (!error) {
      const { data } = await supabase.auth.refreshSession();
      setUser(data.user);
    }
  };

  // Change Password
  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setPwLoading(true);
    setPwMsg("");
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg("All fields are required.");
      setPwLoading(false);
      return;
    }
    if (!validatePassword(currentPw)) {
      setPwMsg(
        "Current password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special symbol."
      );
      setPwLoading(false);
      return;
    }
    if (!validatePassword(newPw)) {
      setPwMsg(
        "New password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special symbol."
      );
      setPwLoading(false);
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg("New passwords do not match.");
      setPwLoading(false);
      return;
    }
    // Re-authenticate
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPw,
    });
    if (authError) {
      setPwMsg("Current password is incorrect.");
      setPwLoading(false);
      return;
    }
    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      setPwMsg(error.message);
    } else {
      setPwMsg("");
      toast.success("Password updated successfully!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTouchedCurrent(false);
      setTouchedNew(false);
      setTouchedConfirm(false);
      setFormSubmitted(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    setLogoutLoading(false);
    onClose();
    toast.success("Logged out");
    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Main Profile Modal */}
      <div
        className={`bg-gradient-to-br from-blue-100/90 via-cyan-50/80 to-blue-200/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-cyan-200/40 w-[95%] max-w-[400px] sm:max-w-lg md:max-w-2xl min-w-[320px] p-0 relative flex flex-row animate-fade-in min-h-[400px] max-h-[90vh] overflow-x-auto overflow-y-hidden ${
          showLogoutPrompt ? "pointer-events-none blur-sm select-none" : ""
        }`}
      >
        <button
          className="absolute z-20 text-gray-400 top-3 right-3 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>
        {/* Tabs: vertical sidebar */}
        <div className="w-1/3 min-w-[120px] max-w-[140px] border-r border-cyan-400/60 bg-gradient-to-b from-cyan-200/80 via-cyan-100/70 to-cyan-300/60 backdrop-blur-lg flex flex-col py-4 px-2 gap-2 justify-between rounded-l-2xl">
          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <h2 className="px-2 text-lg font-bold text-gray-900">Profile</h2>
            </div>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left font-medium transition-all mb-1 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none ${
                  tab === t.key
                    ? "bg-white/90 text-cyan-700 shadow-sm border border-cyan-200/50"
                    : "text-gray-700 hover:bg-white/50 hover:text-cyan-800"
                }`}
                onClick={() => setTab(t.key)}
                disabled={tab === t.key}
              >
                <span className="hidden sm:inline">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center mt-8 mb-2">
            <button
              onClick={() => setShowLogoutPrompt(true)}
              className="flex flex-col items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all bg-red-600 rounded-lg shadow sm:flex-row hover:bg-red-700 disabled:opacity-60 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
              disabled={logoutLoading}
            >
              <FiLogOut className="hidden w-4 h-4 sm:block" />
              Log Out
            </button>
          </div>
        </div>
        {/* Right: Tab Content */}
        <div className="flex-1 p-4 md:p-6 pt-20 md:pt-16 flex flex-col justify-start bg-cyan-50/30 backdrop-blur-lg rounded-b-none md:rounded-r-2xl min-w-[280px] overflow-y-auto overflow-x-auto">
          {tab === "email" && (
            <form
              onSubmit={handleEmailChange}
              className="w-full max-w-sm mx-auto mt-0"
            >
              <div className="mb-6">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Current Email
                </label>
                <div className="mb-2 text-base font-medium text-gray-900 break-all cursor-default select-all">
                  {user?.email}
                </div>
              </div>
              <div className="mb-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  New Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={email}
                  placeholder="Enter new email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoading}
                  required
                />
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="p-2 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
                  disabled={emailLoading || email === user?.email}
                >
                  {emailLoading ? "Updating..." : "Change Email"}
                </button>
              </div>
              {emailMsg && (
                <div className="mt-2 text-sm text-center text-red-600">
                  {emailMsg}
                </div>
              )}
            </form>
          )}
          {tab === "password" && (
            <form
              onSubmit={handlePwChange}
              className="w-full max-w-sm mx-auto mt-0"
            >
              <div className="relative mb-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={currentPw}
                  placeholder="Current password"
                  onChange={(e) => setCurrentPw(e.target.value)}
                  onBlur={() => setTouchedCurrent(true)}
                  disabled={pwLoading}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute text-gray-500 right-2 top-8 hover:text-gray-700"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedCurrent || formSubmitted) &&
                  currentPw &&
                  !validatePassword(currentPw) && (
                    <div className="mt-1 text-xs text-red-600">
                      Password must be at least 8 characters and include an
                      uppercase letter, a lowercase letter, a number, and a
                      special symbol.
                    </div>
                  )}
              </div>
              <div className="relative mb-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type={showNewPw ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={newPw}
                  placeholder="New password"
                  onChange={(e) => setNewPw(e.target.value)}
                  onBlur={() => setTouchedNew(true)}
                  disabled={pwLoading}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute text-gray-500 right-2 top-8 hover:text-gray-700"
                  onClick={() => setShowNewPw((v) => !v)}
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedNew || formSubmitted) &&
                  newPw &&
                  !validatePassword(newPw) && (
                    <div className="mt-1 text-xs text-red-600">
                      Password must be at least 8 characters and include an
                      uppercase letter, a lowercase letter, a number, and a
                      special symbol.
                    </div>
                  )}
              </div>
              <div className="relative mb-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={confirmPw}
                  placeholder="Confirm new password"
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onBlur={() => setTouchedConfirm(true)}
                  disabled={pwLoading}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute text-gray-500 right-2 top-8 hover:text-gray-700"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedConfirm || formSubmitted) &&
                  confirmPw &&
                  newPw !== confirmPw && (
                    <div className="mt-1 text-xs text-red-600">
                      Passwords do not match.
                    </div>
                  )}
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="p-2 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
                  disabled={pwLoading}
                >
                  {pwLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
              {/* Only show backend response (pwMsg) below the button if it is set and not a frontend validation error */}
              {pwMsg &&
                !(
                  pwMsg.includes("must be at least 8 characters") ||
                  pwMsg.includes("do not match") ||
                  pwMsg.includes("All fields are required.")
                ) && (
                  <div className="mt-2 text-sm text-center text-red-600">
                    {pwMsg}
                  </div>
                )}
            </form>
          )}
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-[90%] max-w-[320px] text-center animate-fade-in">
            <div className="mb-4 text-lg font-semibold text-gray-800">
              Are you sure you want to log out?
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handleLogout}
                className="px-6 py-2 font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60"
                disabled={logoutLoading}
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutPrompt(false)}
                className="px-6 py-2 font-semibold text-gray-800 transition-all bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
