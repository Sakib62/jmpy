import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const handleHomeClick = () => {
    router.push("/");
  };
  return (
    <header className="w-full z-10 sticky top-0 bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200 flex items-center px-2 py-2 md:px-6 md:py-4 flex-wrap">
      <div
        className="flex items-center gap-1 cursor-pointer group select-none"
        onClick={handleHomeClick}
        title="Go to homepage"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-500 to-blue-400 flex items-center justify-center shadow">
          <FiLink className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">
          jmpy
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
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold ml-2 cursor-pointer"
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
