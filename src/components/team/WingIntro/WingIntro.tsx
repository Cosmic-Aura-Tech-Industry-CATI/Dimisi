import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import styles from "../styles/team.module.css";

export function WingIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className={styles.wing}>
      <SectionHeading eyebrow={eyebrow} title={title} description={text} />
      <div className={styles.wingLine} />
    </div>
  );
}