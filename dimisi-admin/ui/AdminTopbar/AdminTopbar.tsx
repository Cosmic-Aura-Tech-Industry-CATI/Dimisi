import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import styles from "./AdminTopbar.module.css";

/** Admin topbar: mobile nav toggle, section title, right-aligned profile icon. */
export function AdminTopbar({
  title,
  onToggleNav,
  profile,
}: {
  title: string;
  onToggleNav: () => void;
  profile?: ReactNode;
}) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label="Toggle navigation"
        onClick={onToggleNav}
      >
        <Menu size={18} />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{profile}</div>
    </header>
  );
}
