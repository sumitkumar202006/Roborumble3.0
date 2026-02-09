import React from "react";
import { Shield } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white relative selection:bg-[#00F0FF] selection:text-black">
            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="text-[#E661FF]" size={32} />
                        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter">
                            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E661FF] to-[#00F0FF]">Policy</span>
                        </h1>
                    </div>

                    <div className="h-1 w-24 bg-[#E661FF] mb-12" />

                    {/* Content */}
                    <div className="space-y-8 font-mono text-zinc-300 leading-relaxed text-sm md:text-base">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">01.</span> Data Collection
                            </h2>
                            <p>
                                We collect personal information such as name, email address, phone number, and institution details when you register for Robo Rumble 3.0. We may also collect technical data like IP addresses for security purposes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">02.</span> Use of Information
                            </h2>
                            <p>
                                The collected information is used for:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-[#E661FF]">
                                <li>Event registration and coordination.</li>
                                <li>Processing payments.</li>
                                <li>Sending event updates and notifications.</li>
                                <li>Improving user experience on our platform.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">03.</span> Data Protection
                            </h2>
                            <p>
                                We implement robust security measures to protect your data. Access is restricted to authorized personnel only. We do not sell or trade your personal information to third parties.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">04.</span> Third-Party Services
                            </h2>
                            <p>
                                We use secure third-party payment gateways (like Razorpay) and authentication services (like Clerk). These services have their own privacy policies which we encourage you to review.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">05.</span> Photography & Media
                            </h2>
                            <p>
                                By participating, you consent to being photographed or recorded during the event for promotional purposes on our official channels.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <span className="text-[#E661FF]">06.</span> Contact Us
                            </h2>
                            <p>
                                If you have any questions regarding this privacy policy, please contact us at <a href="mailto:roborumble@csjmu.ac.in" className="text-[#E661FF] hover:underline">roborumble@csjmu.ac.in</a>.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
