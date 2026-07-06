import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { services, products } from "@/lib/site-data";

type SimpleLink = { label: string; to: string };

const PRIMARY_LINKS: SimpleLink[] = [
  { label: "Industries", to: "/industries" },
  { label: "Our Work", to: "/case-studies" },
  { label: "Blogs", to: "/blog" },
  { label: "Our Team", to: "/our-team" },
  { label: "Careers", to: "/careers" },
];


function DiamondMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 22 12 12 22 2 12 Z" />
    </svg>
  );
}

const spring = { type: "spring", stiffness: 400, damping: 26 } as const;

type DropdownId = "offerings" | "products";

function NavDropdown({
  id,
  label,
  items,
  openDropdown,
  setOpenDropdown,
}: {
  id: DropdownId;
  label: string;
  items: { label: string; slug: string }[];
  openDropdown: DropdownId | null;
  setOpenDropdown: (v: DropdownId | null) => void;
}) {
  const open = openDropdown === id;

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpenDropdown(open ? null : id)}
        whileHover={{ y: -2 }}
        transition={spring}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative flex items-center gap-1 px-1 py-1 text-[0.82rem] font-medium tracking-tight text-foreground/60 transition-colors duration-300 hover:text-foreground"
      >
        <span className="relative z-10">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
        <span className="pointer-events-none absolute -bottom-0.5 left-1/2 h-px w-full -translate-x-1/2 scale-x-0 bg-gradient-to-r from-transparent via-foreground to-transparent opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-80" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 grid max-h-[70vh] min-w-[240px] gap-0.5 overflow-y-auto rounded-xl border border-foreground/10 bg-background/90 p-2 shadow-2xl backdrop-blur-xl"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                to={id === "offerings" ? "/services/$slug" : "/products/$slug"}
                params={{ slug: item.slug }}
                onClick={() => setOpenDropdown(null)}
                role="menuitem"
                className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({ label, to }: SimpleLink) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={spring}>
      <Link
        to={to}
        className="group relative px-1 py-1 text-[0.82rem] font-medium tracking-tight text-foreground/60 transition-colors duration-300 hover:text-foreground"
        activeProps={{ className: "text-foreground" }}
      >
        <span className="relative z-10">{label}</span>
        <span className="pointer-events-none absolute -bottom-0.5 left-1/2 h-px w-full -translate-x-1/2 scale-x-0 bg-gradient-to-r from-transparent via-foreground to-transparent opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-80" />
      </Link>
    </motion.div>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownId | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const offeringItems = services.map((s) => ({ label: s.title, slug: s.slug }));
  const productItems = products.map((p) => ({ label: p.name, slug: p.slug }));


  return (
    <div
      ref={navRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:px-6 md:pt-5"
    >
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-auto w-full max-w-6xl rounded-[20px] transition-[background,box-shadow,backdrop-filter] duration-500 ease-out ${
          scrolled ? "nav-glass-scrolled" : "nav-glass"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5">
          {/* Left: logo */}
          <Link
            to="/"
            className="flex items-center gap-3 pr-2 text-foreground"
            aria-label="Dimisi home"
          >
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className="grid h-9 w-9 place-items-center rounded-xl border border-foreground/10 bg-foreground/5"
            >
              <DiamondMark />
            </motion.span>
            <span className="font-display text-[1.05rem] font-light tracking-[0.14em] text-foreground">
              DIMISI
            </span>
          </Link>

          {/* Center: nav links */}
          <div className="hidden items-center gap-6 lg:flex">
            <NavDropdown
              id="offerings"
              label="Offerings"
              items={offeringItems}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
            <NavDropdown
              id="products"
              label="Products"
              items={productItems}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
            {PRIMARY_LINKS.map((link) => (
              <NavLink key={link.label} label={link.label} to={link.to} />
            ))}
          </div>

          {/* Right: CTA + hamburger */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="hidden sm:block"
            >
              <Link
                to="/contact"
                className="glow-warm group relative block overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[0.82rem] font-semibold tracking-tight text-primary-foreground"
              >
                <span className="relative z-10">Get in Touch</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              </Link>
            </motion.div>

            <button
              className="flex h-10 w-10 flex-col items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <motion.span
                className="block h-[1.5px] w-4 bg-foreground"
                animate={menuOpen ? { rotate: 45, y: 3.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="my-1 block h-[1.5px] w-4 bg-foreground"
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="block h-[1.5px] w-4 bg-foreground"
                animate={menuOpen ? { rotate: -45, y: -3.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-foreground/5 bg-[#0A0A0A] lg:hidden"
            >
              <div className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto px-4 py-4">
                {/* Offerings accordion */}
                <button
                  type="button"
                  onClick={() =>
                    setMobileAccordion(mobileAccordion === "offerings" ? null : "offerings")
                  }
                  aria-expanded={mobileAccordion === "offerings"}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium tracking-tight text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  Offerings
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      mobileAccordion === "offerings" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    gridTemplateRows: mobileAccordion === "offerings" ? "1fr" : "0fr",
                    opacity: mobileAccordion === "offerings" ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid pl-4"
                >
                  <div className="min-h-0 overflow-hidden">
                    {offeringItems.map((item) => (
                      <Link
                        key={`m-off-${item.slug}`}
                        to="/services/$slug"
                        params={{ slug: item.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-left text-sm tracking-tight text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>


                {/* Products accordion */}
                <button
                  type="button"
                  onClick={() =>
                    setMobileAccordion(mobileAccordion === "products" ? null : "products")
                  }
                  aria-expanded={mobileAccordion === "products"}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium tracking-tight text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  Products
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      mobileAccordion === "products" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    gridTemplateRows: mobileAccordion === "products" ? "1fr" : "0fr",
                    opacity: mobileAccordion === "products" ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid pl-4"
                >
                  <div className="min-h-0 overflow-hidden">
                    {productItems.map((item) => (
                      <Link
                        key={`m-prod-${item.slug}`}
                        to="/products/$slug"
                        params={{ slug: item.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-left text-sm tracking-tight text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>


                <div className="mt-2 pt-2">
                  {PRIMARY_LINKS.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, ...spring }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-left text-sm font-medium tracking-tight text-foreground/65 transition-colors hover:bg-foreground/5 hover:text-foreground"
                        activeProps={{ className: "text-foreground" }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="glow-warm mt-3 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold tracking-tight text-primary-foreground"
                >
                  Get in Touch
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
