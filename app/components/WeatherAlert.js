'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, X, Bell, Mail, MapPin, ShieldAlert } from 'lucide-react';

export default function WeatherAlert({ lat, lon }) {
  const [alerts, setAlerts] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access error:", error);
        }
      );
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async (location) => {
    if (!location) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.weather.gov/alerts/active?point=${location.lat},${location.lon}`,
        { headers: { 'User-Agent': 'WeatherApp/1.0' } }
      );
      
      if (!res.ok) throw new Error('Failed to fetch alerts');
      
      const data = await res.json();
      
      if (data?.features?.length) {
        const activeAlerts = data.features.map((f) => ({
          id: f.id,
          event: f.properties.event,
          headline: f.properties.headline,
          description: f.properties.description,
          instruction: f.properties.instruction,
          start: f.properties.effective,
          end: f.properties.expires,
          severity: f.properties.severity,
          urgency: f.properties.urgency,
          certainty: f.properties.certainty,
          areaDesc: f.properties.areaDesc
        }));
        
        // Sort by severity
        activeAlerts.sort((a, b) => {
          const severityOrder = { 'Extreme': 1, 'Severe': 2, 'Moderate': 3, 'Minor': 4, 'Unknown': 5 };
          return (severityOrder[a.severity] || 6) - (severityOrder[b.severity] || 6);
        });
        
        setAlerts(activeAlerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe handler
// In WeatherAlert component, update the handleSubscribe function:
const handleSubscribe = async (e) => {
  e.preventDefault();
  if (!email) return;

  try {
    const location = lat && lon ? { lat, lon } : userLocation;
    
    if (!location) {
      alert('Please enable location services to subscribe');
      return;
    }

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, location })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to subscribe');
    }

    setSubscribed(true);
    setEmail('');
    
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
    
  } catch (err) {
    console.error('Subscription error:', err);
    alert(err.message || 'Failed to subscribe. Please try again.');
  }
};

  // Fetch alerts on location change
  useEffect(() => {
    const location = lat && lon ? { lat, lon } : userLocation;
    if (!location) return;

    fetchAlerts(location);
    
    const interval = setInterval(() => fetchAlerts(location), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon, userLocation, fetchAlerts]);

  // Severity colors
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'bg-red-600';
      case 'severe': return 'bg-red-500';
      case 'moderate': return 'bg-orange-500';
      case 'minor': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  // Urgency icon
  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'immediate': return '🚨';
      case 'expected': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const activeAlertCount = alerts.length;
  const severeCount = alerts.filter(a => ['Extreme', 'Severe'].includes(a.severity)).length;

  // Loading state
  if (loading) {
    return (
      <div className="fixed top-4 right-4 p-3 rounded-full bg-gray-600 animate-pulse">
        <Bell className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  // No alerts
  if (activeAlertCount === 0) return null;

  return (
    <>
      {/* Alert Button */}
      <button
        onClick={() => setAlertOpen(true)}
        className={`fixed top-20 right-4 p-2 rounded-full shadow-lg z-50 ${
          severeCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-orange-500'
        }`}
        aria-label={`${activeAlertCount} weather alerts`}
      >
        <AlertCircle className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-xs font-bold text-red-600 flex items-center justify-center">
          {activeAlertCount}
        </span>
      </button>

      {/* Modal */}
      {alertOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-xl border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Weather Alerts</h2>
  
                </div>
              </div>
              <button
                onClick={() => setAlertOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-gray-800">
                  <span className="text-white font-medium text-sm">
                    {activeAlertCount} Alert{alerts.length > 1 ? 's' : ''}
                  </span>
                </div>
                {severeCount > 0 && (
                  <div className="px-3 py-1.5 rounded-full bg-red-900/40">
                    <span className="text-red-300 font-medium text-sm">
                      {severeCount} Severe
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} bg-gray-800/50`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xl">{getUrgencyIcon(alert.urgency)}</span>
                    <div>
                      <h3 className="text-white font-bold text-base">{alert.event}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-white/20 text-white">
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-200 text-sm mb-3">{alert.headline}</p>
                  
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>Effective:</span>
                      <span className="text-white">{new Date(alert.start).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-white">{new Date(alert.end).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {alert.description && (
                    <div className="mt-3">
                      <p className="text-gray-300 text-sm line-clamp-3">{alert.description}</p>
                    </div>
                  )}
                  
                  {alert.instruction && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-yellow-300 text-xs font-medium">⚠️ Recommended Actions</p>
                      <p className="text-white text-xs mt-1">{alert.instruction.substring(0, 150)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Email Subscription */}
            <div className="p-4 sm:p-6 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <h3 className="text-white font-medium">Get Alert Updates</h3>
              </div>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribed}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                  >
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </div>
                {subscribed && (
                  <p className="text-green-400 text-xs">✓ You'll receive alert updates</p>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="text-center text-xs text-gray-400">
                <p>Data from National Weather Service</p>
                <p className="mt-1">Alerts auto-refresh every 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}