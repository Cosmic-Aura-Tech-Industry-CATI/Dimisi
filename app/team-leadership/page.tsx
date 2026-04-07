"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function TeamPage() {
    const team = [
        {
            name: "Alex Sterling",
            role: "Chief Executive Officer",
            bio: "Leading the vision of global technology integration.",
            image: "/user.png",
        },
        {
            name: "Sarah Chen",
            role: "Chief Technology Officer",
            bio: "Architecting scale and engineering excellence.",
            image: "/user.png",
        },
        {
            name: "Marcus Thorne",
            role: "Head of AI Design",
            bio: "Pushing the frontiers of human-machine interaction.",
            image: "/user.png",
        },
        {
            name: "Elena Rossi",
            role: "SVP, Customer Success",
            bio: "Ensuring world-class support for global enterprises.",
            image: "/user.png",
        },
    ];

    return (
        <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-24 flex flex-col items-center text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-8">
                        Our Leadership
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        Meet the thinkers and builders pushing the frontier of technology
                        and design at DIMIISI.
                    </p>
                </motion.div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {team.map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group"
                        >
                            {/* Image Card */}
                            <div className="aspect-square rounded-[3rem] border border-gray-800 backdrop-blur-xl bg-white/5 overflow-hidden mb-6 relative p-2">

                                {/* Image */}
                                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center px-4">
                                <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-500 transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 opacity-70">
                                    {member.role}
                                </p>
                                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}