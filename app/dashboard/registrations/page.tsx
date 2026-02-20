"use client";


import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  CreditCard,
  Users,
  QrCode,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface RegistrationData {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    fees: number;
    category?: string;
  };
  teamId?: {
    _id: string;
    name: string;
  };
  paymentStatus: string;
  amountPaid?: number;
  amountExpected?: number;
  createdAt: string;
  selectedMembers?: any[];
}

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle; color: string; bg: string; border: string }
> = {
  paid: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/50",
  },
  manual_verified: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/50",
  },
  initiated: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/50",
  },
  refunded: {
    icon: XCircle,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/50",
  },
  verification_pending: {
    icon: Loader2,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/50",
  },
};

export default function RegistrationsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const user = useMemo(() => {
    if (session?.user) {
      return {
        // @ts-ignore
        id: session.user.id,
        firstName: session.user.name?.split(" ")[0] || "Champion",
        fullName: session.user.name,
        email: session.user.email,
      };
    }
    return null;
  }, [session]);

  const isLoaded = sessionStatus !== "loading";

  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQr, setSelectedQr] = useState<RegistrationData | null>(null);

  useEffect(() => {
    if (isLoaded && session?.user) {
      fetchRegistrations();
    } else if (isLoaded && !session?.user) {
      setLoading(false);
    }
  }, [session, isLoaded]);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      const res = await fetch(`/api/registrations`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      } else if (res.status === 404) {
        // User doesn't have a profile yet - show empty state
        setRegistrations([]);
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        setError(errorData.message || "Failed to load registrations");
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Error loading registrations");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayNow(registration: RegistrationData) {
    // Trigger payment flow
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: registration.eventId._id,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.message || "Failed to create payment order");
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Robo Rumble",
        description: `Payment for ${registration.eventId.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              eventId: registration.eventId._id,
            }),
          });
          if (verifyRes.ok) {
            alert("Payment successful!");
            fetchRegistrations();
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#00F0FF",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Error initiating payment");
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#00F0FF] mb-4" size={32} />
        <p className="text-zinc-500 font-mono text-sm animate-pulse">
          LOADING_REGISTRATIONS...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 py-12 font-mono border border-dashed border-red-800 rounded-2xl bg-red-500/5">
        {error}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3 font-mono">
        <FileText className="text-[#00F0FF]" /> MY REGISTRATIONS
      </h1>

      {registrations.length === 0 ? (
        <div className="bg-[#111] rounded-xl border border-white/10 p-12 text-center">
          <FileText size={64} className="mx-auto text-zinc-700 mb-4" />
          <h2 className="text-xl font-black text-white mb-2 font-mono uppercase">
            No Registrations Yet
          </h2>
          <p className="text-zinc-400 font-mono text-sm">
            Register for events to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const status =
              statusConfig[reg.paymentStatus] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isPending =
              reg.paymentStatus === "initiated" ||
              reg.paymentStatus === "pending";
            const isPaid =
              reg.paymentStatus === "paid" ||
              reg.paymentStatus === "manual_verified";

            return (
              <div
                key={reg._id}
                className={`bg-[#111] rounded-xl border p-6 ${status.border} hover:border-white/20 transition-all`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white font-mono uppercase">
                      {reg.eventId?.title || "Unknown Event"}
                    </h3>
                    {reg.eventId?.category && (
                      <p className="text-[#E661FF] text-xs font-mono mt-1 uppercase">
                        {reg.eventId.category}
                      </p>
                    )}
                    {reg.teamId && (
                      <p className="text-zinc-400 text-sm font-mono mt-2 flex items-center gap-2">
                        <Users size={14} /> Team: {reg.teamId.name}
                      </p>
                    )}
                    {reg.selectedMembers && reg.selectedMembers.length > 0 && (
                      <p className="text-zinc-500 text-xs font-mono mt-1">
                        Squad Size: {reg.selectedMembers.length} members
                      </p>
                    )}
                    <p className="text-zinc-600 text-xs font-mono mt-2">
                      Registered:{" "}
                      {new Date(reg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold font-mono ${status.bg} ${status.color} border ${status.border}`}
                    >
                      <StatusIcon size={14} />
                      {reg.paymentStatus.replace("_", " ").toUpperCase()}
                    </span>
                    <div className="text-right">
                      <p className="text-zinc-500 text-[10px] font-mono uppercase">
                        Entry Fee
                      </p>
                      <p className="text-xl font-black text-white font-mono">
                        {reg.eventId?.fees === 0
                          ? "FREE"
                          : `₹${reg.amountExpected || reg.eventId?.fees || 0}`}
                      </p>
                    </div>
                    {isPending && reg.eventId?.fees > 0 && (
                      <button
                        onClick={() => handlePayNow(reg)}
                        className="px-4 py-2 bg-[#00F0FF] text-black font-black font-mono text-xs rounded-lg uppercase hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}
                    {isPaid && (
                      <button
                        onClick={() => setSelectedQr(reg)}
                        className="px-4 py-2 bg-[#E661FF] text-black font-black font-mono text-xs rounded-lg uppercase hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(230,97,255,0.3)]"
                      >
                        <QrCode size={14} /> View QR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#00F0FF]/30 p-8 rounded-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white font-mono mb-2 uppercase">
                Team Gate Pass
              </h3>
              <p className="text-[#00F0FF] font-mono text-sm mb-6">
                Scan this at the event entrance
              </p>

              <div className="bg-white p-4 rounded-xl inline-block mb-6">
                <QRCodeSVG
                  value={JSON.stringify({ registrationId: selectedQr._id })}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-left bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <p className="text-zinc-500 text-xs font-mono uppercase mb-1">
                  Event
                </p>
                <p className="text-white font-bold font-mono mb-3">
                  {selectedQr.eventId?.title}
                </p>

                <p className="text-zinc-500 text-xs font-mono uppercase mb-1">
                  Team Name
                </p>
                <p className="text-white font-bold font-mono">
                  {selectedQr.teamId?.name || "Individual"}
                </p>
              </div>

              <p className="text-zinc-600 text-[10px] font-mono mt-4 uppercase">
                ID: {selectedQr._id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
