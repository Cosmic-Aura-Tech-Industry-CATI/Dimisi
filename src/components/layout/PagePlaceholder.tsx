import type { ReactNode } from "react";
import { motion } from "motion/react";

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <section className="grain glow-radial relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="label-caps text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </motion.div>
    </section>
  );
}
