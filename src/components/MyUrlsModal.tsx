import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { FiCheck, FiCopy, FiLoader, FiTrash2, FiX } from "react-icons/fi";
import { MdQrCode } from "react-icons/md";
import { supabase } from "../utils/supabaseClient";
import QRCodePopover from "./QRCodePopover";

export type Url = {
  id: string;
  original_url: string;
  short_code: string;
  custom_alias: string | null;
  click_count: number | null;
  created_at: string | null;
};

export default function MyUrlsModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
}) {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState<{ id: string; url: string } | null>(
    null
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("urls")
        .select(
          "id, original_url, short_code, custom_alias, click_count, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUrls((data as Url[]) || []);
    } catch {
      if (urls.length > 0) {
        toast.error("Could not refresh URLs");
      } else {
        setError("Failed to fetch URLs");
      }
    } finally {
      setLoading(false);
    }
  }, [user, urls.length]);

  useEffect(() => {
    if (open) fetchUrls();
  }, [open, fetchUrls]);

  if (!open) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from("urls").delete().eq("id", id);
      if (error) throw error;
      setUrls((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete URL");
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  const handleShowQR = (id: string, url: string) => {
    setShowQR(showQR && showQR.id === id ? null : { id, url });
  };

  const baseUrl =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL
      ? process.env.NEXT_PUBLIC_BASE_URL
      : typeof window !== "undefined"
      ? window.location.origin
      : "";

  // Portal for QR overlay
  const QRPortal = showQR
    ? createPortal(
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
          onClick={() => setShowQR(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <QRCodePopover url={showQR.url} onClose={() => setShowQR(null)} />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-sky-200/60 backdrop-blur-lg rounded-2xl shadow-2xl shadow-blue-200/40 border border-blue-100 p-4 md:p-6 w-full max-w-md sm:max-w-lg md:max-w-2xl relative animate-fade-in-up overflow-y-auto max-h-[75vh] px-2">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
            aria-label="Close My URLs"
          >
            <FiX />
          </button>
          <h2 className="text-2xl font-bold mb-3 text-center text-gray-900 tracking-tight">
            My URLs
          </h2>
          <div className="flex justify-end mb-2">
            <button
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2 min-w-[70px] justify-center"
              onClick={fetchUrls}
              disabled={loading}
            >
              {loading ? (
                <FiLoader className="animate-spin w-4 h-4" />
              ) : (
                "Refresh"
              )}
            </button>
          </div>
          {loading && !urls.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-base font-medium">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : urls.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No URLs yet. Shorten your first link!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-900 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-blue-300 border-b border-blue-200 text-white">
                    <th className="px-4 py-3 text-left font-semibold w-full text-gray-900 tracking-tight">
                      URL Info
                    </th>
                    <th className="px-4 py-3 text-center font-semibold w-[80px] text-gray-900 tracking-tight">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-center font-semibold w-[110px] text-gray-900 tracking-tight">
                      Created
                    </th>
                    <th className="px-4 py-3 text-center font-semibold w-[180px] text-gray-900 tracking-tight">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((u, idx) => {
                    const shortUrl = `${baseUrl}/${
                      u.custom_alias || u.short_code
                    }`;
                    return (
                      <tr
                        key={u.id}
                        className={
                          `border-b border-blue-100 transition-colors ` +
                          (idx % 2 === 0 ? "bg-white" : "bg-blue-50/80") +
                          " hover:bg-sky-200/80"
                        }
                      >
                        <td className="px-4 py-4 align-top text-gray-900 break-words max-w-2xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-mono text-blue-700 break-all text-base"
                              title={shortUrl}
                            >
                              {shortUrl}
                            </span>
                            <button
                              className="p-1 bg-blue-100 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs shadow transition-all"
                              onClick={() => handleCopy(shortUrl, u.id)}
                              title="Copy"
                              type="button"
                            >
                              {copied === u.id ? (
                                <FiCheck className="w-4 h-4 text-green-600" />
                              ) : (
                                <FiCopy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="text-sm break-words mb-1 text-gray-700">
                            {u.original_url}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center align-top text-gray-900 font-medium">
                          {u.click_count ?? 0}
                        </td>
                        <td className="px-4 py-4 text-center align-top text-gray-900 font-medium">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-center align-top">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                              title="Show QR Code"
                              onClick={() => handleShowQR(u.id, shortUrl)}
                              type="button"
                            >
                              <MdQrCode />
                            </button>
                            <button
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                              title="Delete"
                              onClick={() => setConfirmDeleteId(u.id)}
                              disabled={deleting === u.id}
                              type="button"
                            >
                              {deleting === u.id ? "..." : <FiTrash2 />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {QRPortal}
      {confirmDeleteId &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40">
            <div className="bg-white border border-gray-300 rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center animate-fade-in-up">
              <h3 className="text-lg font-bold mb-3 text-gray-900 text-center">
                Do you want to delete your short URL?
              </h3>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deleting === confirmDeleteId}
                >
                  {deleting === confirmDeleteId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
