import { SplitText } from "../SplitText/SplitText";
import { Reveal } from "../Reveal/Reveal";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
}: SectionHeadingProps) {
  return (
    <header className={[styles.head, styles[align]].join(" ")}>
      <Reveal variant="fade">
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>
      <SplitText as={as} text={title} className={styles.title} />
      {description ? (
        <Reveal variant="up" delay={140}>
          <p className={styles.desc}>{description}</p>
        </Reveal>
      ) : null}
    </header>
  );
}