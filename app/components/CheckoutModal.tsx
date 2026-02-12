"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle,
  Upload,
  QrCode,
  IndianRupee,
  Copy,
  Check,
} from "lucide-react";
import { UploadButton } from "@/app/utils/uploadthing";
import QRCode from "react-qr-code";

interface CheckoutEvent {
  title: string;
  fees: number;
  memberCount: number;
}

interface CheckoutData {
  events: CheckoutEvent[];
  totalAmount: number;
  upiId: string;
  upiName: string;
  upiLink: string;
  itemCount: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<
    "loading" | "qr" | "upload" | "submitting" | "success" | "free_confirm"
  >("loading");
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCheckoutData();
    } else {
      // Reset state when closed
      setStep("loading");
      setTransactionId("");
      setScreenshotUrl("");
      setError("");
    }
  }, [isOpen]);

  const fetchCheckoutData = async () => {
    try {
      setStep("loading");
      const res = await fetch("/api/cart/checkout");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load checkout");
      }
      const data = await res.json();
      setCheckoutData(data);

      // If total amount is 0, go straight to free confirm
      if (data.totalAmount === 0) {
        setStep("free_confirm");
      } else {
        setStep("qr");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load checkout");
      // Default to QR on error so user can at least see something or try again
      setStep("qr");
    }
  };

  const copyUpiId = () => {
    if (checkoutData?.upiId) {
      navigator.clipboard.writeText(checkoutData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    const isFree = checkoutData?.totalAmount === 0;

    if (!isFree) {
      if (!transactionId.trim()) {
        setError("Please enter your transaction ID");
        return;
      }
      if (!screenshotUrl) {
        setError("Please upload payment screenshot");
        return;
      }
    }

    setStep("submitting");
    setError("");

    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          screenshotUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment");
      }

      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
      setStep("upload");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                <QrCode className="text-[#00F0FF]" size={24} />
                CHECKOUT
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#00F0FF]" size={40} />
                  <p className="text-zinc-500 mt-4 font-mono text-sm">
                    Loading checkout...
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="text-green-500" size={40} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    Payment Submitted!
                  </h3>
                  <p className="text-zinc-500 text-sm text-center">
                    Your payment is being verified. You&apos;ll receive an email
                    once confirmed.
                  </p>
                </div>
              )}

              {(step === "qr" ||
                step === "upload" ||
                step === "free_confirm") &&
                checkoutData && (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                      <h3 className="text-xs uppercase text-zinc-500 font-mono mb-3">
                        Order Summary
                      </h3>
                      <div className="space-y-2">
                        {checkoutData.events.map((event, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-zinc-300">{event.title}</span>
                            <span className="text-white font-mono">
                              {event.fees === 0 ? "FREE" : `₹${event.fees}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                        <span className="font-bold text-white">Total</span>
                        <span className="font-black text-[#00F0FF] text-xl font-mono">
                          {checkoutData.totalAmount === 0
                            ? "FREE"
                            : `₹${checkoutData.totalAmount}`}
                        </span>
                      </div>
                    </div>

                    {step === "free_confirm" && (
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-full flex items-center justify-center">
                          <CheckCircle size={32} className="text-[#00F0FF]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            Confirm Registration
                          </h3>
                          <p className="text-zinc-500 text-sm">
                            You are about to register for{" "}
                            {checkoutData.itemCount} free event
                            {checkoutData.itemCount > 1 ? "s" : ""}.
                          </p>
                        </div>
                        <button
                          onClick={handleSubmit}
                          className="w-full py-3 bg-[#00F0FF] text-black font-black font-mono rounded-xl hover:bg-[#00F0FF]/90 transition-colors uppercase"
                        >
                          Confirm Registration
                        </button>
                      </div>
                    )}

                    {step === "qr" && (
                      <>
                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-4 rounded-xl">
                            <QRCode value={checkoutData.upiLink} size={180} />
                          </div>
                          <p className="text-zinc-500 text-xs mt-3 text-center">
                            Scan with any UPI app to pay
                          </p>
                        </div>

                        {/* UPI ID */}
                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                          <p className="text-xs uppercase text-zinc-500 font-mono mb-2">
                            Or pay to UPI ID
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black px-3 py-2 rounded-lg text-[#00F0FF] font-mono text-sm">
                              {checkoutData.upiId}
                            </code>
                            <button
                              onClick={copyUpiId}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                              {copied ? (
                                <Check size={18} className="text-green-400" />
                              ) : (
                                <Copy size={18} className="text-zinc-400" />
                              )}
                            </button>
                          </div>
                          <p className="text-zinc-600 text-xs mt-2">
                            Amount:{" "}
                            <span className="text-white font-bold">
                              ₹{checkoutData.totalAmount}
                            </span>
                          </p>
                        </div>

                        {/* Next Step Button */}
                        <button
                          onClick={() => setStep("upload")}
                          className="w-full py-3 bg-[#00F0FF] text-black font-black font-mono rounded-xl hover:bg-[#00F0FF]/90 transition-colors uppercase"
                        >
                          I&apos;ve Made Payment
                        </button>
                      </>
                    )}

                    {step === "upload" && (
                      <>
                        {/* Transaction ID */}
                        <div>
                          <label className="text-xs uppercase text-zinc-500 font-mono mb-2 block">
                            Transaction / UTR ID
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter your UPI transaction ID"
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono placeholder:text-zinc-600 focus:border-[#00F0FF]/50 focus:outline-none"
                          />
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                          <label className="text-xs uppercase text-zinc-500 font-mono mb-2 block">
                            Payment Screenshot
                          </label>
                          {screenshotUrl ? (
                            <div className="relative">
                              <img
                                src={screenshotUrl}
                                alt="Payment screenshot"
                                className="w-full h-40 object-cover rounded-xl border border-green-500/50"
                              />
                              <button
                                onClick={() => setScreenshotUrl("")}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                              >
                                <X size={14} className="text-white" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-green-500/90 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                                <CheckCircle size={12} /> Uploaded
                              </div>
                            </div>
                          ) : (
                            <UploadButton
                              endpoint="paymentScreenshot"
                              onClientUploadComplete={(res) => {
                                if (res?.[0]?.url) {
                                  setScreenshotUrl(res[0].url);
                                }
                              }}
                              onUploadError={(error) => {
                                const msg = error.message?.toLowerCase() || "";
                                if (msg.includes("size") || msg.includes("filesizemismatch") || msg.includes("invalid config") || msg.includes("too large")) {
                                  setError("Image size should be less than 4MB");
                                } else {
                                  setError(error.message);
                                }
                              }}
                              appearance={{
                                button:
                                  "bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-sm px-4 py-3 rounded-xl border border-zinc-700 w-full",
                                allowedContent: "text-zinc-600 text-xs",
                              }}
                            />
                          )}
                        </div>

                        {error && (
                          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl text-sm">
                            {error}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep("qr")}
                            className="flex-1 py-3 bg-zinc-800 text-white font-bold font-mono rounded-xl hover:bg-zinc-700 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={!transactionId || !screenshotUrl}
                            className="flex-1 py-3 bg-[#00F0FF] text-black font-black font-mono rounded-xl hover:bg-[#00F0FF]/90 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

              {step === "submitting" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#00F0FF]" size={40} />
                  <p className="text-zinc-500 mt-4 font-mono text-sm">
                    {checkoutData?.totalAmount === 0
                      ? "Registering..."
                      : "Submitting payment..."}
                  </p>
                </div>
              )}

              {error && step === "qr" && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
