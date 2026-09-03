import {
  Star,
  TrendingUp,
  BarChart3,
  QrCode,
  Layers,
  Award,
} from "lucide-react";
import type { AdminDashboardData } from "@/lib/reviews.functions";
import styles from "./AdminAnalytics.module.css";

export function AdminAnalytics({ data }: { data: AdminDashboardData }) {
  const { stats, campaigns, reviews } = data;

  // Group by service
  const serviceCounts: Record<string, { total: number; avg: number; sum: number }> = {};
  for (const r of reviews) {
    const sName = r.service_name || "General / Other";
    if (!serviceCounts[sName]) serviceCounts[sName] = { total: 0, avg: 0, sum: 0 };
    serviceCounts[sName].total += 1;
    serviceCounts[sName].sum += r.rating;
    serviceCounts[sName].avg = Math.round((serviceCounts[sName].sum / serviceCounts[sName].total) * 10) / 10;
  }

  const sortedServices = Object.entries(serviceCounts).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className={styles.wrap}>
      {/* Key Metric Scorecards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.averageRating.toFixed(1)} ★</div>
          <div className={styles.statLabel}>Average Rating</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalReviews}</div>
          <div className={styles.statLabel}>Total Reviews</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#fbbf24" }}>
            {stats.pendingCount}
          </div>
          <div className={styles.statLabel}>Pending Moderation</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#34d399" }}>
            {stats.approvedCount}
          </div>
          <div className={styles.statLabel}>Published Reviews</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.reviewsThisMonth}</div>
          <div className={styles.statLabel}>New (Last 30 Days)</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#818cf8" }}>
            {stats.overallConversionRate}%
          </div>
          <div className={styles.statLabel}>Overall QR/Link Conv.</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className={styles.sectionGrid}>
        {/* Rating Breakdown */}
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>
            <Star size={18} color="#fbbf24" />
            <span>Rating Distribution</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = stats.distribution[stars] || 0;
              const pct = stats.approvedCount > 0 ? (count / stats.approvedCount) * 100 : 0;
              return (
                <div key={stars} className={styles.distRow}>
                  <span style={{ width: "60px", color: "#cbd5e1", fontWeight: 600 }}>
                    {stars} Stars
                  </span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ width: "50px", textAlign: "right", color: "#94a3b8" }}>
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Breakdown */}
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>
            <Layers size={18} color="#818cf8" />
            <span>Reviews by Service & Category</span>
          </h3>

          <div className={styles.serviceList}>
            {sortedServices.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>No service reviews recorded yet.</p>
            ) : (
              sortedServices.slice(0, 6).map(([serviceName, data]) => (
                <div key={serviceName} className={styles.serviceItem}>
                  <div>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{serviceName}</span>
                    <span style={{ fontSize: "0.76rem", color: "#94a3b8", marginLeft: "8px" }}>
                      ({data.total} {data.total === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  <span style={{ color: "#fbbf24", fontWeight: 700 }}>{data.avg} ★</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Campaigns Leaderboard */}
      <div>
        <h3 style={{ fontFamily: "var(--font-chakra, sans-serif)", fontSize: "1.3rem", color: "#ffffff", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={18} color="#fbbf24" />
          <span>Campaigns & QR Scans Performance</span>
        </h3>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Target Service</th>
                <th>Web Visits</th>
                <th>QR Scans</th>
                <th>Submissions</th>
                <th>Conversion Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No campaigns created yet. Create a campaign to start tracking QR scans and links.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id}>
                    <td>
                      <strong style={{ color: "#ffffff" }}>{camp.campaign_name}</strong>
                      <div style={{ fontSize: "0.74rem", color: "#818cf8", fontFamily: "monospace" }}>
                        /review/{camp.slug}
                      </div>
                    </td>
                    <td>{camp.service_name || "—"}</td>
                    <td>{camp.visits}</td>
                    <td>{camp.scans}</td>
                    <td>{camp.submissions}</td>
                    <td style={{ color: "#34d399", fontWeight: 700 }}>
                      {camp.conversion_rate || 0}%
                    </td>
                    <td>
                      <span style={{ color: camp.is_active ? "#34d399" : "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
                        {camp.is_active ? "● Active" : "○ Disabled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
