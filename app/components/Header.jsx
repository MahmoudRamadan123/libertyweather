import { SearchIcon } from "lucide-react";

export default function Header({setSearchOpen, isHolidayToday, holidayColors}) {
    return(
              <nav
        className="absolute top-0 z-50 p-3 w-full"

      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <span className="font-semibold text-white text-xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Liberty<span className="text-[#e0a423]">Weather</span>.com
            </span>
            <button
              className="text-lg text-white px-4 py-2 rounded-full transition flex items-center gap-2"
              
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    )
}