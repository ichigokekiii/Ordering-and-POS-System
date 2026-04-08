import React from "react";

function PaymentModals({
  methodModal,
  setMethodModal,
  cashModal,
  setCashModal,
  qrModal,
  setQrModal,
  cashReceived,
  setCashReceived,
  total,
  finalizeTransaction,
  quickAmounts,
  dm,
}) {
  return (
    <>
      {/* 1. METHOD MODAL */}
      {methodModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-[90%] max-w-[480px] shadow-2xl relative ${dm ? "bg-gray-800" : "bg-white"}`}>
            <button
              onClick={() => setMethodModal(false)}
              className={`absolute top-4 right-4 rounded-full p-2 transition-colors ${dm ? "text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600" : "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className={`text-2xl font-bold mb-8 text-center ${dm ? "text-gray-100" : "text-gray-800"}`}>Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => { setMethodModal(false); setCashModal(true); setCashReceived(0); }}
                className={`aspect-square border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${dm ? "bg-blue-900/30 hover:bg-blue-900/50 border-blue-700 text-blue-300" : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"}`}
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span className="text-2xl font-bold">CASH</span>
              </button>
              <button
                onClick={() => { setMethodModal(false); setQrModal(true); setCashReceived(total); }}
                className={`aspect-square border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${dm ? "bg-purple-900/30 hover:bg-purple-900/50 border-purple-700 text-purple-300" : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"}`}
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                <span className="text-2xl font-bold">QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CASH MODAL */}
      {cashModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`rounded-2xl w-[90%] max-w-[600px] shadow-2xl flex flex-col overflow-hidden ${dm ? "bg-gray-800" : "bg-white"}`}>
            <div className={`border-b p-4 flex items-center gap-4 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button onClick={() => { setCashModal(false); setMethodModal(true); }} className={`p-2 rounded-full transition ${dm ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>Cash Payment</h3>
            </div>

            <div className={`p-6 md:p-8 flex flex-col gap-8 ${dm ? "bg-gray-900/40" : "bg-gray-50"}`}>
              <div className={`p-6 rounded-xl shadow-sm border space-y-3 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="flex justify-between text-lg">
                  <span className={`font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>Total</span>
                  <span className={`font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>₱{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className={`font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>Cash Received</span>
                  <span className="font-bold text-blue-500">₱{cashReceived.toLocaleString()}</span>
                </div>
                <div className={`h-px my-2 ${dm ? "bg-gray-700" : "bg-gray-100"}`}></div>
                <div className="flex justify-between text-2xl">
                  <span className={`font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>Change</span>
                  <span className={`font-bold ${cashReceived >= total ? 'text-green-500' : 'text-red-500'}`}>
                    ₱{Math.max(0, cashReceived - total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived(prev => prev + amt)}
                    className={`border py-3 rounded-xl font-bold text-lg shadow-sm transition active:scale-95 ${dm ? "bg-gray-700 border-gray-600 text-gray-200 hover:text-blue-300 hover:border-blue-600" : "bg-white border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-300"}`}
                  >
                    +₱{amt}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(0)}
                  className={`border py-3 rounded-xl font-bold text-lg shadow-sm transition active:scale-95 col-span-1 text-red-500 ${dm ? "bg-gray-700 border-gray-600 hover:bg-red-900/30" : "bg-white border-gray-200 hover:bg-red-50"}`}
                >
                  Clear
                </button>
                <button
                  onClick={() => setCashReceived(total)}
                  className="bg-blue-600 border border-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-lg text-white shadow-sm transition active:scale-95 col-span-2"
                >
                  Exact Amount (₱{total})
                </button>
              </div>
            </div>

            <div className={`p-4 border-t ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button
                onClick={() => finalizeTransaction('CASH')}
                disabled={cashReceived < total}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-sm ${
                  cashReceived >= total
                    ? "bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98]"
                    : dm ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Finish Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. QR MODAL */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`rounded-2xl w-[90%] max-w-[400px] shadow-2xl flex flex-col overflow-hidden ${dm ? "bg-gray-800" : "bg-white"}`}>
            <div className={`border-b p-4 flex items-center gap-4 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button onClick={() => { setQrModal(false); setMethodModal(true); }} className={`p-2 rounded-full transition ${dm ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>QR Payment</h3>
            </div>

            <div className={`p-8 flex flex-col items-center justify-center gap-6 ${dm ? "bg-gray-900/40" : "bg-gray-50"}`}>
              <div className={`p-4 rounded-2xl shadow-sm border ${dm ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                <svg className={`w-48 h-48 ${dm ? "text-gray-100" : "text-gray-800"}`} viewBox="0 0 100 100">
                  <rect width="100" height="100" fill={dm ? "#1f2937" : "#fff"} />
                  <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="10" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="55" y="15" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="10" y="40" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="25" y="55" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="40" width="20" height="20" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="70" y="40" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="85" y="55" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="70" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="55" y="80" width="20" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="80" y="70" width="10" height="20" fill={dm ? "#e5e7eb" : "#000"} />
                </svg>
              </div>
              <div className="text-center">
                <p className={`font-medium mb-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>Total Amount to Pay</p>
                <p className={`text-4xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>₱{total.toLocaleString()}</p>
              </div>
              <p className={`text-sm text-center ${dm ? "text-gray-500" : "text-gray-400"}`}>Ask the customer to scan the QR code to complete the payment.</p>
            </div>

            <div className={`p-4 border-t ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button
                onClick={() => finalizeTransaction('QR')}
                className="w-full bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98] py-4 rounded-xl font-bold text-xl transition-all shadow-sm"
              >
                Finish Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentModals;