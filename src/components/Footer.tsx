import { FiGithub, FiLinkedin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full mt-0 py-6 flex flex-col items-center justify-center bg-gray-900/95 shadow-inner border-t border-gray-800 animate-fade-in">
      <span className="text-gray-200 text-sm">
        &copy; {new Date().getFullYear()} Linkly. All rights reserved.
      </span>
      <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs">
        <span>Created by</span>
        <span className="font-semibold text-gray-300">Sakibul Islam</span>
        <a
          href="https://github.com/Sakib62"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
          aria-label="Sakib62 on GitHub"
        >
          <FiGithub className="inline align-middle w-4 h-4" />
        </a>
        <a
          href="https://www.linkedin.com/in/sakib-ul-islam"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
          aria-label="Sakibul Islam on LinkedIn"
        >
          <FiLinkedin className="inline align-middle w-4 h-4" />
        </a>
      </div>
    </footer>
  );
}
