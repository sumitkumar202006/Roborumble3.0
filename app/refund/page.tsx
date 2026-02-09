import React from "react";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-black text-white relative selection:bg-[#00F0FF] selection:text-black">
            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <AlertCircle className="text-[#FF003C]" size={32} />
                        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter">
                            Refund <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF003C] to-[#E661FF]">& Cancellation</span>
                        </h1>
                    </div>

                    <div className="h-1 w-24 bg-[#FF003C] mb-12" />

                    {/* Content */}
                    <div className="space-y-8 font-mono text-zinc-300 leading-relaxed text-sm md:text-base">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#FF003C]">01.</span> General Policy
                            </h2>
                            <p>
                                Robo Rumble 3.0 has a strict <strong>No Refund Policy</strong>. Once registration is confirmed and payment is made, it cannot be cancelled or refunded under any circumstances, except where explicitly stated below.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#FF003C]">02.</span> Event Cancellation
                            </h2>
                            <p>
                                In the rare event that the entire Robo Rumble 3.0 event is cancelled by the organizers due to unforeseen circumstances (e.g., force majeure, pandemics), a full or partial refund may be processed at the discretion of the management.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#FF003C]">03.</span> Disqualification
                            </h2>
                            <p>
                                If a participant or team is disqualified due to a violation of the event rules, Terms & Conditions, or code of conduct, <strong>no refund</strong> will be issued.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#FF003C]">04.</span> Duplicate Payments
                            </h2>
                            <p>
                                In case of duplicate payment for the same registration ID due to technical glitches, the extra amount will be refunded. The participant must notify us within 7 days of the transaction with proof of payment.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#FF003C]">05.</span> Processing Time
                            </h2>
                            <p>
                                Approved refunds (if any) will be processed within 7-14 working days and credited back to the original method of payment.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="p-4 border border-[#FF003C]/50 bg-[#FF003C]/10 rounded flex items-start gap-3">
                                <AlertCircle className="text-[#FF003C] shrink-0 mt-1" size={20} />
                                <p className="text-zinc-200">
                                    <strong>Note:</strong> Transaction fees charged by the payment gateway are non-refundable in all cases.
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
