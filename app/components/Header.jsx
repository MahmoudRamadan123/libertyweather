import { SearchIcon } from "lucide-react";

export default function Header({ setSearchOpen, isHolidayToday, holidayColors }) {
  const updatedAt = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="absolute top-0 z-50 w-full">
      <nav className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* MAIN ROW */}
          <div className="flex flex-row sm:items-center justify-between py-3 gap-2">

            {/* BRAND */}
            <div className="flex gap-2 items-center">
              <img alt="Logo" className="w-10 h-10" />
            <div className="flex flex-col">
              <span
                className="font-semibold text-white text-md lg:text-2xl leading-none"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
              >
                Liberty<span className="text-[#e0a423]">Weather</span>.com
              </span>

              <span className="text-[9px] mt-1 lg:text-sm text-white/80 max-w-xs sm:max-w-none">
                Accurate, local, and real-time weather updates
              </span>
            </div>
</div>
            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-0 lg:gap-4">

              {/* UPDATED TIME */}
              <span className="lg:text-[11px] text-[9px] text-white/70 whitespace-nowrap">
                Updated at {updatedAt}
              </span>

              {/* SEARCH BUTTON */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full
                           text-white hover:bg-white/10 active:bg-white/20 transition"
                aria-label="Search weather"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}
