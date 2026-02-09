"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error" | "warning"
  >("idle");
  const [verificationData, setVerificationData] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false,
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string, decodedResult: any) {
      handleVerification(decodedText);
    }

    function onScanFailure(error: any) {
      // handle scan failure, usually better to ignore and keep scanning.
      // console.warn(`Code scan error = ${error}`);
    }

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, []);

  const handleVerification = async (qrData: string) => {
    try {
      // throttle to prevent multiple calls
      if (verificationStatus === "loading") return;

      setVerificationStatus("loading");
      setMessage("Verifying...");

      let registrationId = qrData;
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.registrationId) {
          registrationId = parsed.registrationId;
        }
      } catch (e) {
        // assume it's just the ID string if JSON parse fails
      }

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action: "checkIn" }),
      });

      const data = await res.json();

      if (res.ok) {
        setVerificationData(data.registration);
        setVerificationStatus("success");
        setMessage("Verified & Checked In Successfully");

        // Play success sound if desired
        const audio = new Audio("/sounds/success.mp3"); // placeholder
        audio.play().catch(() => {});
      } else {
        setVerificationData(data.registration || null);
        if (res.status === 400 && data.message === "Already checked in") {
          setVerificationStatus("warning");
          setMessage("Already Checked In!");
        } else {
          setVerificationStatus("error");
          setMessage(data.message || "Verification Failed");
        }
      }
    } catch (error) {
      console.error(error);
      setVerificationStatus("error");
      setMessage("Network or Server Error");
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setVerificationStatus("idle");
    setVerificationData(null);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono md:p-8">
      <h1 className="text-2xl md:text-3xl font-black text-[#00F0FF] mb-6 md:mb-8 text-center uppercase border-b border-[#00F0FF]/30 pb-4">
        Admin Verification
      </h1>

      <div className="max-w-md mx-auto space-y-8">
        {/* Scanner Section */}
        <div className="bg-[#111] p-4 rounded-xl border border-zinc-800">
          <div id="reader" className="w-full"></div>
        </div>

        {/* Manual Entry */}
        <div className="bg-[#111] p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase mb-2">
            Manual Entry Override
          </p>
          <div className="flex gap-2">
            <input
              placeholder="Enter Registration ID"
              className="flex-1 bg-black border border-zinc-700 p-2 text-white font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerification((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 text-xs font-bold uppercase transition-colors"
              onClick={(e) => {
                const input = e.currentTarget
                  .previousElementSibling as HTMLInputElement;
                handleVerification(input.value);
              }}
            >
              Verify
            </button>
          </div>
        </div>

        {/* Result Section */}
        {verificationStatus !== "idle" && (
          <div
            className={`p-6 rounded-xl border-2 animate-in slide-in-from-bottom-4 ${
              verificationStatus === "success"
                ? "bg-green-500/10 border-green-500"
                : verificationStatus === "warning"
                  ? "bg-yellow-500/10 border-yellow-500"
                  : verificationStatus === "error"
                    ? "bg-red-500/10 border-red-500"
                    : "bg-zinc-800/50 border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {verificationStatus === "loading" && (
                <Loader2 className="animate-spin" />
              )}
              {verificationStatus === "success" && (
                <CheckCircle className="text-green-500" size={32} />
              )}
              {verificationStatus === "warning" && (
                <AlertTriangle className="text-yellow-500" size={32} />
              )}
              {verificationStatus === "error" && (
                <XCircle className="text-red-500" size={32} />
              )}

              <h2
                className={`text-xl font-bold uppercase ${
                  verificationStatus === "success"
                    ? "text-green-500"
                    : verificationStatus === "warning"
                      ? "text-yellow-500"
                      : verificationStatus === "error"
                        ? "text-red-500"
                        : "text-white"
                }`}
              >
                {message}
              </h2>
            </div>

            {verificationData && (
              <div className="space-y-4 text-sm font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase text-[10px] w-24 shrink-0">Event</span>
                  <span className="font-bold text-white uppercase text-xs">
                    {verificationData.eventId?.title}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase text-[10px] w-24 shrink-0">Team</span>
                  <span className="font-bold text-white uppercase text-xs">
                    {verificationData.teamId?.name || "Independent"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase text-[10px] w-24 shrink-0">Members</span>
                  <span className="text-zinc-300 text-xs">
                    {verificationData.selectedMembers?.length > 0
                      ? verificationData.selectedMembers
                          .map((m: any) => m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim())
                          .join(", ")
                      : verificationData.teamId?.members?.length > 0
                        ? verificationData.teamId.members
                            .map((m: any) => m.fullName || `${m.firstName || ""} ${m.lastName || ""}`.trim())
                            .join(", ")
                        : verificationData.teamId?.leaderId?.fullName ||
                          "Unknown Member"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-zinc-500 uppercase text-[10px] w-24 shrink-0">Status</span>
                  <span
                    className={`font-black text-xs ${
                      verificationData.paymentStatus === "paid"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {verificationData.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={resetScan}
              className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold uppercase transition-colors"
            >
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
