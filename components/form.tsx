"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    return (
        <section className="py-24" id="contact">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">

                {/* Contact Info */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                    <h1 className="text-5xl md:text-6xl font-bold mb-8">Get in Touch</h1>
                    <p className="text-xl text-muted mb-12 leading-relaxed">
                        Ready to push your business forward? Let's discuss your vision and how our products and services can help you scale.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted mb-1">Email Us</p>
                                <a href="mailto:dimisi@gmail.com" className="text-2xl font-semibold hover:text-blue-500 transition-colors">dimisi@gmail.com</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted mb-1">Call Us</p>
                                <a href="tel:+918545099251" className="text-2xl font-semibold hover:text-purple-500 transition-colors">+91 85450 99251</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-muted mb-1">Support</p>
                                <p className="text-2xl font-semibold">24/7 Availability</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <form className="glass p-10 rounded-[2.5rem] border border-border space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted ml-2">Your Name</label>
                                <input
                                    type="text" required placeholder="John Doe"
                                    className="w-full bg-background/50 border border-border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted ml-2">Email Address</label>
                                <input
                                    type="email" required placeholder="you@example.com"
                                    className="w-full bg-background/50 border border-border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted ml-2">How can we help?</label>
                            <textarea
                                rows={6} required placeholder="Tell us about your project or inquiry..."
                                className="w-full bg-background/50 border border-border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                            />
                        </div>
                        <button className="btn-primary w-full p-5 rounded-2xl font-bold flex items-center justify-center gap-3 group">
                            Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </motion.div>

            </div>
        </section>
    );
}
