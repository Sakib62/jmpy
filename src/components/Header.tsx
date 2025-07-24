import type { User } from "@supabase/supabase-js";
import { FiLink } from "react-icons/fi";

export default function Header({
  user,
  onSignIn,
  onMyUrls,
  onProfile,
}: {
  user: User | null;
  onSignIn: () => void;
  onMyUrls: () => void;
  onProfile: () => void;
}) {
  return (
    <header className="w-full z-10 sticky top-0 bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200 flex items-center px-6 py-3 md:py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-500 to-blue-400 flex items-center justify-center shadow">
          <FiLink className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight select-none">
          Linkly
        </span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <button
              className="text-blue-700 font-semibold hover:underline px-3 py-1 rounded transition-all"
              onClick={onMyUrls}
            >
              My URLs
            </button>
            <div
              className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold ml-2 cursor-pointer"
              title={user.email ?? "User"}
              onClick={onProfile}
            >
              {(user.email?.[0] || "U").toUpperCase()}
            </div>
          </>
        ) : (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all"
            onClick={onSignIn}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
