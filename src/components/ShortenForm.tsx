import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { FiCheck, FiCopy, FiExternalLink, FiLoader } from "react-icons/fi";
import { MdQrCode } from "react-icons/md";
import QRCodePopover from "./QRCodePopover";

export default function ShortenForm({
  user,
  onShorten,
}: {
  user: User | null;
  onShorten: (code: string, url: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<{ type: "original" | "short" | null }>({
    type: null,
  });
  const [customAlias, setCustomAlias] = useState("");
  const [showQR, setShowQR] = useState(false);

  const baseUrl =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL
      ? process.env.NEXT_PUBLIC_BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    return () => {
      if (typeof window !== "undefined") {
        window.history.scrollRestoration = "auto";
      }
    };
  }, [baseUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [shortUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      toast.error("Network error: Please check your internet connection.");
      setLoading(false);
      return;
    }
    
    if (customAlias && !/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
      toast.error("Invalid alias format. Only letters, numbers, dashes (-), and underscores (_) are allowed.");
      setLoading(false);
      return;
    }
    if (customAlias && customAlias.length > 0 && customAlias.length < 6) {
      toast.error("Min length of Alias is 6 characters.");
      setLoading(false);
      return;
    }
    if (customAlias && customAlias.length > 16) {
      toast.error("Max length of Alias is 16 characters.");
      setLoading(false);
      return;
    }
    try {
      let res;
      try {
        res = await fetch("/api/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            customAlias: customAlias.trim() || undefined,
            userId: user?.id || undefined,
          }),
        });
      } catch {
        toast.error("Network error: Please check your internet connection.");
        setLoading(false);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch {
        toast.error("Unexpected server response. Please try again.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "Unknown error");
        setLoading(false);
        return;
      }
      setShortUrl(baseUrl + "/" + data.code);
      setCustomAlias("");
      setLoading(false);
      onShorten(data.code, url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to shorten URL");
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: "original" | "short") => {
    navigator.clipboard.writeText(text);
    setCopied({ type });
    setTimeout(() => setCopied({ type: null }), 1200);
  };

  const handleReset = () => {
    setUrl("");
    setShortUrl("");
    setError("");
    setCopied({ type: null });
    setShowQR(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-2">
      <div className="flex flex-col items-center w-full p-6 border border-blue-100 shadow-2xl bg-sky-100/80 backdrop-blur-lg rounded-2xl shadow-blue-200/40 md:p-8 animate-fade-in-up">
        <h1 className="mb-2 text-2xl font-bold text-center text-gray-900 md:text-3xl">
          Shorten your links
        </h1>
        <p className="mb-6 text-base text-center text-gray-600">
          Paste your long URL below to get a short, shareable link instantly.
        </p>
        {!shortUrl ? (
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <div className="flex flex-col w-full gap-3">
              <div className="flex flex-col w-full">
                <label
                  htmlFor="url"
                  className="mb-1 font-bold text-gray-900 text-md"
                >
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://your-long-link.com"
                  className="w-full min-w-0 px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col w-full">
                <label
                  htmlFor="customAlias"
                  className="mb-1 font-bold text-gray-900 text-md"
                >
                  Alias{" "}
                  <span className="text-xs font-normal text-gray-600 align-middle">
                    (optional)
                  </span>
                </label>
                <input
                  id="customAlias"
                  type="text"
                  placeholder="Custom alias (min 6 chars)"
                  className="w-full min-w-0 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-300 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-lg font-bold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-400 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center w-full gap-2">
                  <FiLoader className="w-5 h-5 text-white animate-spin" />
                  Shortening...
                </span>
              ) : (
                "Shorten URL"
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center w-full gap-6">
            <div className="flex flex-col w-full gap-2">
              <span className="font-semibold text-gray-800">Original URL:</span>
              <div className="flex items-center gap-2">
                <input
                  className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg select-all cursor-text focus:outline-none focus:border-gray-300 focus:shadow-none focus:ring-0 active:border-gray-300 active:shadow-none hover:border-gray-300"
                  value={url}
                  readOnly
                  tabIndex={-1}
                />
                <button
                  className="px-3 py-2 text-xs font-semibold text-blue-700 transition-all bg-blue-100 rounded-lg shadow hover:bg-blue-200"
                  title="Copy"
                  onClick={() => handleCopy(url, "original")}
                  type="button"
                >
                  {copied.type === "original" ? (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <span className="font-semibold text-gray-800">Short URL:</span>
              {/* Large screens: Original layout (input + buttons in same row) */}
              <div className="items-center hidden gap-2 sm:flex">
                <input
                  className="w-full px-4 py-2 text-sm font-bold text-blue-800 border border-blue-200 rounded-lg select-all bg-blue-50 cursor-text focus:outline-none focus:border-blue-200 focus:shadow-none focus:ring-0 active:border-blue-200 active:shadow-none hover:border-blue-200"
                  value={shortUrl}
                  readOnly
                  tabIndex={-1}
                />
                <button
                  className="px-3 py-2 text-xs font-semibold text-blue-700 transition-all bg-blue-100 rounded-lg shadow hover:bg-blue-100"
                  title="Copy"
                  onClick={() => handleCopy(shortUrl, "short")}
                  type="button"
                >
                  {copied.type === "short" ? (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
                {shortUrl && (
                  <button
                    className="p-1 text-blue-700 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => setShowQR(true)}
                    type="button"
                    title="Show QR Code"
                    aria-label="Show QR Code"
                  >
                    <MdQrCode className="w-4 h-4" />
                  </button>
                )}
                {shortUrl && (
                  <button
                    className="p-1 text-gray-700 transition-all hover:text-blue-700 hover:scale-110"
                    onClick={() =>
                      window.open(shortUrl, "_blank", "noopener,noreferrer")
                    }
                    type="button"
                    title="Open short URL in new tab"
                    aria-label="Open short URL in new tab"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Small screens: Separate rows (input on top, centered buttons below) */}
              <div className="flex flex-col gap-2 sm:hidden">
                <input
                  className="w-full px-4 py-2 text-sm font-bold text-blue-800 border border-blue-200 rounded-lg select-all bg-blue-50 cursor-text focus:outline-none focus:border-blue-200 focus:shadow-none focus:ring-0 active:border-blue-200 active:shadow-none hover:border-blue-200"
                  value={shortUrl}
                  readOnly
                  tabIndex={-1}
                />
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-2 text-xs font-semibold text-blue-700 transition-all bg-blue-100 rounded-lg shadow hover:bg-blue-100"
                    title="Copy"
                    onClick={() => handleCopy(shortUrl, "short")}
                    type="button"
                  >
                    {copied.type === "short" ? (
                      <FiCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiCopy className="w-4 h-4" />
                    )}
                  </button>
                  {shortUrl && (
                    <button
                      className="p-1 text-blue-700 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={() => setShowQR(true)}
                      type="button"
                      title="Show QR Code"
                      aria-label="Show QR Code"
                    >
                      <MdQrCode className="w-4 h-4" />
                    </button>
                  )}
                  {shortUrl && (
                    <button
                      className="p-1 text-gray-700 transition-all hover:text-blue-700 hover:scale-110"
                      onClick={() =>
                        window.open(shortUrl, "_blank", "noopener,noreferrer")
                      }
                      type="button"
                      title="Open short URL in new tab"
                      aria-label="Open short URL in new tab"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {showQR &&
              createPortal(
                <div
                  className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
                  onClick={() => setShowQR(false)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <QRCodePopover
                      url={shortUrl}
                      onClose={() => setShowQR(false)}
                    />
                  </div>
                </div>,
                document.body
              )}
            <button
              className="px-5 py-2 mt-0 text-sm font-semibold text-gray-800 transition-all bg-gray-200 rounded-lg shadow hover:bg-gray-300"
              onClick={handleReset}
              type="button"
            >
              Shorten another URL
            </button>
          </div>
        )}
        {error && (
          <div className="w-full mt-4 animate-fade-in-down">
            <div className="p-3 font-semibold text-center text-red-800 bg-red-100 border border-red-200 rounded-lg shadow">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
