import { useRef } from "react";
import { FiX } from "react-icons/fi";
import QRCode from "react-qr-code";

export default function QRCodePopover({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadSVG = () => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = svg.outerHTML;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "qr-code.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlObj);
  };

  const handleDownloadPNG = () => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = function () {
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx && ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObj;
        a.download = "qr-code.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(urlObj);
      }, "image/png");
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in-up">
      <span className="text-gray-800 font-semibold mb-1">QR Code:</span>
      <div
        className="bg-white p-4 rounded-xl shadow border border-gray-200 flex flex-col items-center"
        ref={qrContainerRef}
      >
        <QRCode value={url} size={128} bgColor="#fff" fgColor="#1e293b" />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow transition-all"
          onClick={handleDownloadSVG}
          type="button"
        >
          SVG
        </button>
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow transition-all"
          onClick={handleDownloadPNG}
          type="button"
        >
          PNG
        </button>
        <button
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-xs shadow transition-all flex items-center gap-1"
          onClick={onClose}
          type="button"
        >
          <FiX className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <span className="text-xs text-gray-500 mt-2">Scan to open short URL</span>
    </div>
  );
}
