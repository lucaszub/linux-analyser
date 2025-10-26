import { Settings } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  serverName?: string;
}

const Header = ({ isOnline, serverName = "srv-prod-01" }: HeaderProps) => {
  return (
    <header className="bg-white/80 border-b border-gray-200 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold tracking-tighter">
                SM
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Server Monitor
              </h1>
              <p className="text-xs text-gray-500">{serverName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isOnline ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  isOnline ? "text-green-700" : "text-red-700"
                }`}
              >
                {isOnline ? "En ligne" : "Hors ligne"}
              </span>
            </div>
            <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
