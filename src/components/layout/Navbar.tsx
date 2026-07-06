import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { offeringsMenu, primaryNav, productsMenu, type NavItem } from "@/lib/site-data";
import { ScrambleHover } from "@/components/ui/ScrambleHover";

function LogoMark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-foreground">
        <rect
          x="12"
          y="1.5"
          width="14.85"
          height="14.85"
          rx="2"
          transform="rotate(45 12 1.5)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
      <span className="text-base font-medium tracking-tight text-foreground">Dimisi</span>
    </span>
  );
}

function Dropdown({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
      >
        <ScrambleHover text={label} />
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3"
          >
            <div className="grid gap-0.5 rounded-2xl border border-foreground/10 bg-background/80 p-2 backdrop-blur-xl">
              {items.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-xl px-3 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-foreground/5 bg-background/30 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" aria-label="Dimisi Technologies home">
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Dropdown label="Offerings" items={offeringsMenu} />
          <Dropdown label="Products" items={productsMenu} />
          {primaryNav.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              <ScrambleHover text={link.label} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 0 26px 0 rgba(255,255,255,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="hidden rounded-full sm:block"
          >
            <Link
              to="/contact"
              className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 sm:inline-flex"
            >
              Get in Touch
            </Link>
          </motion.div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 lg:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-foreground/10 bg-background/70 backdrop-blur-md lg:hidden"
          >
            <nav className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto px-6 py-4">
              <p className="px-2 pt-2 text-xs uppercase tracking-[0.2em] text-foreground/40">
                Offerings
              </p>
              {offeringsMenu.map((item) => (
                <Link
                  key={`m-off-${item.label}`}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <p className="px-2 pt-3 text-xs uppercase tracking-[0.2em] text-foreground/40">
                Products
              </p>
              {productsMenu.map((item) => (
                <Link
                  key={`m-prod-${item.label}`}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-foreground/10 pt-2">
                {primaryNav.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-2 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    activeProps={{ className: "text-foreground" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
              >
                Get in Touch
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
