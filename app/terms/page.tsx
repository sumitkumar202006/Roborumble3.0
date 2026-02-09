import React from "react";
import { Terminal } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white relative selection:bg-[#00F0FF] selection:text-black">
            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <Terminal className="text-[#00F0FF]" size={32} />
                        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter">
                            Terms <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#E661FF]">& Conditions</span>
                        </h1>
                    </div>

                    <div className="h-1 w-24 bg-[#FF003C] mb-12" />

                    {/* Content */}
                    <div className="space-y-8 font-mono text-zinc-300 leading-relaxed text-sm md:text-base">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">01.</span> Introduction
                            </h2>
                            <p>
                                Welcome to Robo Rumble 3.0. By accessing our website and registering for events, you agree to be bound by these Terms and Conditions. Please read them carefully.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">02.</span> Eligibility
                            </h2>
                            <p>
                                Participation is open to students and professionals as per the specific event guidelines. All participants must provide valid identification during the event.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">03.</span> Registration & Payments
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 marker:text-[#FF003C]">
                                <li>Registration fees are non-transferable.</li>
                                <li>All payments must be made through the designated payment gateway.</li>
                                <li>Incomplete registrations may be rejected.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">04.</span> Event Conduct
                            </h2>
                            <p>
                                Participants are expected to maintain professional conduct. Any form of harassment, cheating, or violation of safety protocols will result in immediate disqualification.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">05.</span> Intellectual Property
                            </h2>
                            <p>
                                All content on this website, including logos, text, and graphics, is the property of Robo Rumble and CSJMU. Unauthorized use is prohibited.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">06.</span> Liability
                            </h2>
                            <p>
                                The organizers are not liable for any personal injury or loss of property during the event. Participants partake at their own risk.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#00F0FF]">07.</span> Changes to Terms
                            </h2>
                            <p>
                                We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of updated terms.
                            </p>
                        </section>

                        <div className="mt-12 p-6 border border-zinc-800 bg-zinc-900/50 rounded-lg">
                            <p className="text-zinc-500 text-xs uppercase tracking-widest">
                                Last Updated: Feb 09, 2026
                            </p>
                            <p className="text-zinc-500 text-xs mt-2">
                                For specific queries, contact us at: <a href="mailto:roborumble@csjmu.ac.in" className="text-[#00F0FF] hover:underline">roborumble@csjmu.ac.in</a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
