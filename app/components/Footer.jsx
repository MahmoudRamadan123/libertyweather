import { useEffect, useState } from "react";
import { CheckCircle, Mail } from "lucide-react";

export default function Footer({ isHolidayToday = false, holidayColors = [] }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const accentColor =
    isHolidayToday && holidayColors.length > 9
      ? holidayColors[9]
      : "#a3b5c7";

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);

  /* ================= SUBSCRIBE ================= */
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    if (!userLocation) {
      alert("Please enable location access for local weather updates");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          location: userLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setSubscribed(true);
      setEmail("");

      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative mt-10 px-6 pb-8 text-white">
      {/* NEWSLETTER */}
      <div className="max-w-md mx-auto mb-8 text-center">
        <h3 className="text-lg font-semibold mb-2">
          Daily Weather Updates ☀️
        </h3>
        <p className="text-sm opacity-80 mb-4">
          Get today’s weather delivered every morning.
        </p>

        {subscribed ? (
          <div className="flex justify-center items-center gap-2 text-green-400">
            <CheckCircle size={18} />
            <span className="text-sm">Subscribed successfully</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <div className="relative flex-1">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>

      {/* FOOTER LINKS */}
      <div
        className="text-center text-xs opacity-80"
        style={{ color: accentColor }}
      >
        <div className="flex justify-center gap-6 mb-3">
          <a href="/privacy" className="hover:underline text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline text-white">
            Terms of Service
          </a>
        </div>

        <p className="opacity-60">
          © {new Date().getFullYear()} Weather Updates
        </p>
      </div>
    </footer>
  );
}
