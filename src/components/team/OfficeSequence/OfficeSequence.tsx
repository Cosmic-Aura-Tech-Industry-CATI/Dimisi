import { useEffect, useRef } from "react";
import type { Office } from "@/data/offices";
import { OfficeDoor } from "../OfficeDoor/OfficeDoor";
import { OfficeScene } from "../OfficeScene/OfficeScene";
import { TeamMemberProfile } from "../TeamMemberProfile/TeamMemberProfile";
import styles from "../styles/team.module.css";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * One continuous camera move per office: approach -> unlock -> door slides
 * open -> camera enters -> information assembles -> camera leaves.
 * Driven by scroll progress and smoothed with a lerp inside a rAF loop.
 */
export function OfficeSequence({ office, index }: { office: Office; index: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--door", "1");
      el.style.setProperty("--enter", "1");
      el.style.setProperty("--exit", "0");
      return;
    }

    let raf = 0;
    let cur = { d: 0, e: 0, x: 0, p: 0 };
    const dir = index % 2 === 0 ? 1 : -1;

    const loop = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;

      const door = ease(clamp01((p - 0.06) / 0.22));
      const enter = ease(clamp01((p - 0.2) / 0.26));
      const exit = ease(clamp01((p - 0.82) / 0.18));

      // lateral camera pan through the room: enters angled, settles, leaves angled
      const pan = (p - 0.5) * 2 * dir;

      cur = {
        d: cur.d + (door - cur.d) * 0.16,
        e: cur.e + (enter - cur.e) * 0.16,
        x: cur.x + (exit - cur.x) * 0.16,
        p: cur.p + (pan - cur.p) * 0.12,
      };

      el.style.setProperty("--door", cur.d.toFixed(4));
      el.style.setProperty("--enter", cur.e.toFixed(4));
      el.style.setProperty("--exit", cur.x.toFixed(4));
      el.style.setProperty("--pan", cur.p.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  return (
    <section
      ref={ref}
      className={styles.office}
      aria-label={`Office ${office.no} — ${office.name}`}
    >
      <div className={styles.stage}>
        <div className={styles.room}>
          <OfficeDoor office={office} />
          <div className={styles.interior}>
            <OfficeScene office={office} index={index} />
            <TeamMemberProfile office={office} />
          </div>
        </div>
      </div>
    </section>
  );
}