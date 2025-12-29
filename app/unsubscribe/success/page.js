// app/unsubscribe/success/page.js
export default function UnsubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h1 className="text-2xl font-bold">Successfully Unsubscribed</h1>
          <p className="opacity-90 mt-2">You have been unsubscribed from Liberty Weather Alerts</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-4">
            <p className="text-gray-600">
              You will no longer receive severe weather alerts. We're sorry to see you go!
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Safety Reminder</h3>
              <p className="text-sm text-blue-700">
                While you won't receive our alerts, please continue to monitor official weather sources 
                from the National Weather Service for severe weather in your area.
              </p>
            </div>
            
            <div className="pt-4">
              <a
                href="/subscribe"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Resubscribe to Alerts
              </a>
              <a
                href="/"
                className="block w-full mt-3 text-center text-gray-600 hover:text-gray-900 font-medium"
              >
                Return to Homepage
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-6 text-center text-gray-500 text-sm">
          <p>Liberty Weather Alerts &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}