// Footer.tsx — Global site footer component displaying brand tagline, grouped resource columns, and copyright notice.
const COLUMNS = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact"],
  },
  {
    title: "Services",
    links: ["Offerings", "Solutions", "Consulting"],
  },
  {
    title: "Products",
    links: ["Kalesh", "CarryOn", "Sylon", "Axis Conference Web"],
  },
  {
    title: "Resources",
    links: ["Blogs", "Case Studies", "Documentation"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 max-w-xs md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M12 2 22 12 12 22 2 12 Z" />
              </svg>
              <span className="font-display text-lg text-foreground">Dimisi</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/50">
              Building digital products, intelligent solutions, and future-ready
              technology experiences.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground/40">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <button suppressHydrationWarning className="text-sm text-foreground/50 transition-colors hover:text-foreground">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-foreground/10 pt-8">
          <p className="text-xs text-foreground/40">
            © 2026 Dimisi Technologies. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
