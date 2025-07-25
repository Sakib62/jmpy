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
    <div className="w-full max-w-lg flex flex-col items-center px-2">
      <div className="w-full bg-sky-100/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-blue-200/40 border border-blue-100 p-8 md:p-10 animate-fade-in-up flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
          Shorten your links
        </h1>
        <p className="text-base text-gray-600 mb-6 text-center">
          Paste your long URL below to get a short, shareable link instantly.
        </p>
        {!shortUrl ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col w-full">
                <label
                  htmlFor="url"
                  className="text-md font-bold text-gray-900 mb-1"
                >
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://your-long-link.com/example"
                  className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white/90 placeholder-gray-400 text-base transition-all duration-300 shadow-sm w-full min-w-0"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col w-full">
                <label
                  htmlFor="customAlias"
                  className="text-md font-bold text-gray-900 mb-1"
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
                  className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white/90 placeholder-gray-400 text-sm transition-all duration-300 shadow-sm w-full min-w-0"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-400 text-white rounded-lg px-6 py-3 font-bold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center w-full">
                  <FiLoader className="animate-spin h-5 w-5 text-white" />
                  Shortening...
                </span>
              ) : (
                "Shorten URL"
              )}
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 items-center">
            <div className="w-full flex flex-col gap-2">
              <span className="text-gray-800 font-semibold">Original URL:</span>
              <div className="flex items-center gap-2">
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 text-sm cursor-text select-all focus:outline-none focus:border-gray-300 focus:shadow-none focus:ring-0 active:border-gray-300 active:shadow-none hover:border-gray-300"
                  value={url}
                  readOnly
                  tabIndex={-1}
                />
                <button
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-xs shadow transition-all"
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
            <div className="w-full flex flex-col gap-2">
              <span className="text-gray-800 font-semibold">Short URL:</span>
              <div className="flex items-center gap-2">
                <input
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-blue-50 text-blue-800 font-bold text-sm cursor-text select-all focus:outline-none focus:border-blue-200 focus:shadow-none focus:ring-0 active:border-blue-200 active:shadow-none hover:border-blue-200"
                  value={shortUrl}
                  readOnly
                  tabIndex={-1}
                />
                <button
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs shadow transition-all"
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
                    className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    className="p-1 text-gray-700 hover:text-blue-700 hover:scale-110 transition-all"
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
              className="mt-4 px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm shadow transition-all"
              onClick={handleReset}
              type="button"
            >
              Shorten another URL
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 animate-fade-in-down w-full">
            <div className="p-3 bg-red-100 rounded-lg text-red-800 font-semibold shadow border border-red-200 text-center">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
