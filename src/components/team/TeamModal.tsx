"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Linkedin, User, X } from "lucide-react";
import type { TeamMember } from "@/lib/team-data";

export function TeamModal({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!member) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-name"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative z-10 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a]/90 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:grid-cols-2"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-foreground/70 transition-colors duration-300 hover:border-white/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex aspect-square items-center justify-center bg-foreground/[0.04] sm:h-full sm:aspect-auto">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <User className="h-20 w-20 text-foreground/20" strokeWidth={1} />
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h2
                id="team-modal-name"
                className="text-2xl font-medium tracking-tight text-foreground"
              >
                {member.name}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-foreground/40">
                {member.role}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-foreground/60">{member.bio}</p>

              {member.linkedin ? (
                <motion.a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors duration-300 hover:border-foreground/40 hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                  View LinkedIn
                </motion.a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}