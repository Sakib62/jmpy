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
        className={`bg-white rounded-lg shadow-lg w-full max-w-2xl p-0 relative flex animate-fade-in min-h-[400px] ${
          showLogoutPrompt ? "pointer-events-none blur-sm select-none" : ""
        }`}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>
        {/* Left: Tabs + Logout */}
        <div className="w-1/3 min-w-[140px] max-w-[180px] border-r bg-gray-50 flex flex-col py-6 px-2 gap-2 justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">
              Profile
            </h2>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left font-medium transition-all mb-1 ${
                  tab === t.key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTab(t.key)}
                disabled={tab === t.key}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center mb-2">
            <button
              onClick={() => setShowLogoutPrompt(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-60"
              disabled={logoutLoading}
            >
              <FiLogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
        {/* Right: Tab Content */}
        <div className="flex-1 p-8 pt-16 flex flex-col justify-start">
          {tab === "email" && (
            <form
              onSubmit={handleEmailChange}
              className="max-w-sm mx-auto w-full mt-0"
            >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Email
                </label>
                <div className="text-gray-900 mb-2 select-all break-all cursor-default text-base font-medium">
                  {user?.email}
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={email}
                  placeholder="Enter new email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoading}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-all disabled:opacity-60 mt-2"
                disabled={emailLoading || email === user?.email}
              >
                {emailLoading ? "Updating..." : "Change Email"}
              </button>
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
              className="max-w-sm mx-auto w-full mt-0"
            >
              <div className="mb-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10"
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
                  className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedCurrent || formSubmitted) &&
                  currentPw &&
                  !validatePassword(currentPw) && (
                    <div className="text-xs text-red-600 mt-1">
                      Password must be at least 8 characters and include an
                      uppercase letter, a lowercase letter, a number, and a
                      special symbol.
                    </div>
                  )}
              </div>
              <div className="mb-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type={showNewPw ? "text" : "password"}
                  className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10"
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
                  className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPw((v) => !v)}
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedNew || formSubmitted) &&
                  newPw &&
                  !validatePassword(newPw) && (
                    <div className="text-xs text-red-600 mt-1">
                      Password must be at least 8 characters and include an
                      uppercase letter, a lowercase letter, a number, and a
                      special symbol.
                    </div>
                  )}
              </div>
              <div className="mb-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10"
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
                  className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <FiEyeOff /> : <FiEye />}
                </button>
                {(touchedConfirm || formSubmitted) &&
                  confirmPw &&
                  newPw !== confirmPw && (
                    <div className="text-xs text-red-600 mt-1">
                      Passwords do not match.
                    </div>
                  )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-all disabled:opacity-60 mt-2"
                disabled={pwLoading}
              >
                {pwLoading ? "Updating..." : "Change Password"}
              </button>
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
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="bg-white border rounded shadow p-6 w-80 text-center animate-fade-in">
            <div className="mb-3 text-gray-800 font-medium text-lg">
              Are you sure you want to log out?
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-60"
                disabled={logoutLoading}
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutPrompt(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
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
