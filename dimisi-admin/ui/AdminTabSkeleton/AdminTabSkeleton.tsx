import styles from "./AdminTabSkeleton.module.css";

interface AdminTabSkeletonProps {
  tab?: string;
}

export function AdminTabSkeleton({ tab }: AdminTabSkeletonProps) {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-live="polite" data-tab={tab}>
      {/* Header Bar Placeholder */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subSkeleton}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.actionSkeleton}`} />
      </div>

      {/* Toolbar / Search Placeholder */}
      <div className={styles.toolbar}>
        <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.filterSkeleton}`} />
      </div>

      {/* Table / Content Card Placeholder */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeaderRow}>
          <div className={`${styles.skeleton} ${styles.colSmall}`} />
          <div className={`${styles.skeleton} ${styles.colThumb}`} />
          <div className={`${styles.skeleton} ${styles.colLarge}`} />
          <div className={`${styles.skeleton} ${styles.colMedium}`} />
          <div className={`${styles.skeleton} ${styles.colBadge}`} />
          <div className={`${styles.skeleton} ${styles.colActions}`} />
        </div>

        {[1, 2, 3, 4, 5].map((rowIdx) => (
          <div key={rowIdx} className={styles.tableRow}>
            <div className={`${styles.skeleton} ${styles.colSmall}`} />
            <div className={`${styles.skeleton} ${styles.colThumb}`} />
            <div className={`${styles.skeleton} ${styles.colLarge}`} />
            <div className={`${styles.skeleton} ${styles.colMedium}`} />
            <div className={`${styles.skeleton} ${styles.colBadge}`} />
            <div className={`${styles.skeleton} ${styles.colActions}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
