"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

import { Shield, Upload, DollarSign, CheckCircle } from "lucide-react";
import { events as eventData } from "../data/events";
import { UploadButton } from "../utils/uploadthing";

interface Registration {
    eventId: string;
    teamDetails: string;
}

export default function PaymentPage() {
    const { user, loading: authLoading } = useAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCost, setTotalCost] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Form State
    const [transactionId, setTransactionId] = useState("");
    const [amount, setAmount] = useState("");
    const [uploadUrl, setUploadUrl] = useState(""); // Replaces file state

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        } else if (user) {
            fetchRegistrations();
        }
    }, [user, authLoading]);

    const fetchRegistrations = async () => {
        try {
            const res = await fetch("/api/auth/me"); // Assuming this returns events or we need a dedicated endpoint
            // Actually, user object in context has events array of strings (eventIds)
            // But we need TEAM SIZE to calculate cost. 
            // The user.events contains IDs. The user.registrations (conceptually) has details.
            // We'll need a way to get the team size for each event.
            // Let's create a quick endpoint or update /api/auth/me to return full registration details
            // OR, simply fetch from /api/events/registrations which we might need.

            // For now, let's assume we fetch from a new endpoint to get specific calculation details
            const regRes = await fetch("/api/user/registrations");
            if (regRes.ok) {
                const data = await regRes.json();
                setRegistrations(data.registrations);
                calculateTotal(data.registrations);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (regs: any[]) => {
        let total = 0;
        const paid = user?.paidEvents || [];

        regs.forEach((reg: any) => {
            // If event is already paid for, skip cost calculation
            if (paid.includes(reg.eventId)) return;

            const event = eventData.find(e => e.id === reg.eventId);
            if (event && event.cost) {
                // Parse team details
                try {
                    const teamMembers = JSON.parse(reg.teamDetails);
                    const count = Array.isArray(teamMembers) ? teamMembers.length : 1;
                    total += (event.cost * count);
                } catch (e) {
                    total += event.cost; // Fallback
                }
            }
        });
        setTotalCost(total);
        setAmount(total.toString()); // Auto-fill amount
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadUrl || !transactionId || !amount) {
            alert("Please fill all fields and upload screenshot");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/payment/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionId,
                    amount,
                    screenshotUrl: uploadUrl
                })
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                alert("Submission failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting payment");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) return <div className="min-h-screen bg-black text-[#FF003C] flex items-center justify-center font-mono">CALCULATING_DUES...</div>;

    if (success) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white font-mono p-4">

                <div className="z-10 bg-black/80 border border-green-500 p-8 max-w-md text-center backdrop-blur-md">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h1 className="text-2xl font-black mb-2 text-green-500">PAYMENT SUBMITTED</h1>
                    <p className="text-zinc-400 text-sm mb-6">
                        Your transaction is being verified by the automated system.
                        Status will update on your dashboard shortly.
                    </p>
                    <button onClick={() => router.push("/")} className="px-6 py-3 bg-green-500/20 text-green-500 border border-green-500 uppercase font-black hover:bg-green-500 hover:text-black transition-all">
                        Return to Base
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-transparent text-white font-mono relative">


            <div className="relative z-10 container mx-auto px-4 py-24 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Column: Summary & QR */}
                    <div className="flex-1 space-y-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 backdrop-blur-sm">
                            <h2 className="text-xl font-black text-[#FF003C] mb-4 flex items-center gap-2">
                                <DollarSign /> PAYMENT_MANIFEST
                            </h2>
                            <div className="space-y-4">
                                {registrations.map((reg, idx) => {
                                    const event = eventData.find(e => e.id === reg.eventId);
                                    const details = JSON.parse(reg.teamDetails || "[]");
                                    const count = details.length || 0;
                                    const cost = event?.cost || 0;
                                    return (
                                        <div key={idx} className="flex justify-between text-sm border-b border-white/10 pb-2">
                                            <div>
                                                <div className="font-bold text-white">{event?.title}</div>
                                                <div className="text-xs text-zinc-500">{count} Members x ₹{cost}</div>
                                            </div>
                                            <div className="text-[#00F0FF]">₹{cost * count}</div>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-between text-xl font-black pt-4 border-t border-white/20">
                                    <span>TOTAL DUE</span>
                                    <span className="text-[#00F0FF]">₹{totalCost}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-sm max-w-[250px] mx-auto border-4 border-[#FF003C]">
                            {/* Placeholder QR - Replace with actual asset */}
                            <div className="aspect-square bg-black flex items-center justify-center text-white text-xs">
                                [ QR CODE PLACEHOLDER ]
                                {/* <Image src="/qr-code.png" width={200} height={200} alt="Payment QR" /> */}
                            </div>
                            <p className="text-black text-center font-bold mt-2 text-xs">SCAN TO PAY</p>
                        </div>
                    </div>


                    {/* Right Column: Upload Form */}
                    <div className="flex-1">
                        <div className="bg-black/80 border border-[#FF003C] p-8 backdrop-blur-md space-y-6 shadow-[0_0_30px_rgba(255,0,60,0.15)]">
                            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">
                                Verify Transaction
                            </h2>

                            <div className="space-y-2">
                                <label className="text-[#FF003C] text-xs font-bold uppercase">Transaction ID (UTR)</label>
                                <input
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="ENTER_TXN_ID..."
                                    className="w-full bg-zinc-900/50 border border-zinc-800 p-3 text-white focus:border-[#FF003C] outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[#FF003C] text-xs font-bold uppercase">Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 p-3 text-white focus:border-[#FF003C] outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[#FF003C] text-xs font-bold uppercase">Screenshot Proof</label>

                                {uploadUrl ? (
                                    <div className="relative aspect-video w-full border border-[#00F0FF] rounded overflow-hidden">
                                        <Image src={uploadUrl} alt="Proof" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <p className="text-[#00F0FF] font-bold text-xs flex items-center gap-2">
                                                <CheckCircle size={16} /> UPLOAD_COMPLETE
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-zinc-800 p-4 bg-zinc-900/30">
                                        <UploadButton
                                            endpoint="imageUploader"
                                            onClientUploadComplete={(res) => {
                                                // Do something with the response
                                                console.log("Files: ", res);
                                                if (res && res[0]) {
                                                    setUploadUrl(res[0].url);
                                                    // setFile(null); // No longer needed
                                                }
                                                alert("Upload Completed");
                                            }}
                                            onUploadError={(error: Error) => {
                                                const msg = error.message?.toLowerCase() || "";
                                                if (msg.includes("size") || msg.includes("filesizemismatch") || msg.includes("invalid config") || msg.includes("too large")) {
                                                    alert("Image size should be less than 4MB");
                                                } else {
                                                    alert(`ERROR! ${error.message}`);
                                                }
                                            }}
                                            appearance={{
                                                button: "bg-[#FF003C] text-black font-black font-mono tracking-widest uppercase text-xs px-4 py-2 w-full",
                                                allowedContent: "text-zinc-500 text-[10px] uppercase"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit} // Changed to onClick as form behavior is slightly different now
                                disabled={submitting || !uploadUrl}
                                className={`w-full py-4 text-black font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${!uploadUrl ? "bg-zinc-800 cursor-not-allowed text-zinc-500" : "bg-[#FF003C] hover:bg-white"
                                    }`}
                            >
                                {submitting ? "verifying..." : "SUBMIT PROOF"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
