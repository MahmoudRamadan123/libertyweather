import { CheckCircle } from "lucide-react";

export default function Footer({
  isHolidayToday,
  holidayColors,
}) {
  return (
    <footer
      className="relative mt-5  pb-5 px-6  text-white"
    >
    

      {/* BOTTOM LINKS */}
      <div
        className="text-center text-xs mt-5 pt-6 opacity-80"
        style={{
          color:
            isHolidayToday && holidayColors.length > 0
              ? holidayColors[9]
              : "#a3b5c7",
        }}
      >
        <div className="flex gap-6 justify-center">
          <a href="/privacy" className="text-sm font-medium hover:underline text-white" >
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm font-medium hover:underline text-white" >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
