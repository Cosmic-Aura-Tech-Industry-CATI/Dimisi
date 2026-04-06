"use client";

import { motion } from "framer-motion";
import { MessageSquare, Mail, Hash, PenTool, Code, LayoutDashboard } from "lucide-react";

const tools = [
  { name: "Intercom", color: "bg-blue-500", icon: <MessageSquare className="w-6 h-6 text-white" /> },
  { name: "Mailchimp", color: "bg-yellow-500", icon: <Mail className="w-6 h-6 text-white" /> },
  { name: "Slack", color: "bg-purple-600", icon: <Hash className="w-6 h-6 text-white" /> },
  { name: "Figma", color: "bg-pink-500", icon: <PenTool className="w-6 h-6 text-white" /> },
  { name: "GitHub", color: "bg-gray-800", icon: <Code className="w-6 h-6 text-white" /> },
  { name: "Trello", color: "bg-blue-400", icon: <LayoutDashboard className="w-6 h-6 text-white" /> },
];

export default function Integrations() {
  return (
    <section className="py-24 overflow-hidden" id="integration">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect with 100+ tools</h2>
        <p className="text-gray-400">Plug and play with your favorite applications. Demisi natively integrates with the tools you already use.</p>
        <button className="mt-6 px-6 py-2 rounded-full border border-white/20 text-sm hover:bg-white hover:text-black transition-colors">
          View all Integrations
        </button>
      </div>

      <div className="relative w-full max-w-5xl mx-auto flex justify-center">
         <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {tools.map((tool, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl ${tool.color} flex items-center justify-center shadow-xl shadow-${tool.color}/20`}>
                  {tool.icon}
                </div>
                <span className="text-xs text-gray-500 font-medium">{tool.name}</span>
              </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
}
