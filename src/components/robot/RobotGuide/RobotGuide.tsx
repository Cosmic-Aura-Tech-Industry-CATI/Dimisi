import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { askDimisi, type ChatMessage } from "@/lib/chat.functions";
import { isAdminIntent, ADMIN_REPLY, ADMIN_ROUTE } from "@admin/lib/intent";
import styles from "./RobotGuide.module.css";

const SUGGESTIONS = [
  "What does DIMISI Technologies do?",
  "Tell me about the Kalesh app",
  "Which services do you offer?",
  "Who is on the team?",
  "How do I start a project?",
];

const SCRIPTS: Record<string, string[]> = {
  "/": [
    "Welcome. I am DIMISI Technologies — your guide through this world.",
    "Scroll slowly. Every scroll moves the camera, not just the page.",
    "The Owl above you is our brand mind: vision, wisdom, perception.",
    "Need something specific? The nav is glass — tap any chapter.",
  ],
  "/services": [
    "Six services. Hover a card and I'll tell you who it is for.",
    "Most teams start with Intelligent Automation. It pays for itself fastest.",
    "Pricing is a floor, not a quote — scope changes everything.",
  ],
  "/products": [
    "These are the products we run in production, not slideware.",
    "ATHENA Core is the brain behind almost everything else here.",
    "Compare them below — the table does not exaggerate.",
  ],
  "/blog": [
    "Our engineers write these. No ghostwriters, no fluff.",
    "Filter by category or search — I indexed everything already.",
  ],
  "/gallery": [
    "Concept art, shader tests and interface studies from the studio.",
    "Click any frame to open it fullscreen. Escape closes it.",
  ],
  "/career": [
    "We hire for craft and curiosity. Templates get archived instantly.",
    "Five steps, forty-eight hour decisions, no ghosting. Ever.",
  ],
  "/contact": [
    "Tell me what you are building. I route it to a human in minutes.",
    "Everything here is validated live — I'll flag mistakes gently.",
  ],
};

/**
 * DIMISI Technologies — the small guide robot.
 * Persistent across the site, reacts to route, pointer and interaction.
 */
export function RobotGuide() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lines = useMemo(() => SCRIPTS[pathname] ?? SCRIPTS["/"], [pathname]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [open, setOpen] = useState(true);
  const [excited, setExcited] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminOffer, setAdminOffer] = useState(false);
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askDimisi);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat, thinking]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    const next: ChatMessage[] = [...chat, { role: "user", content: question }];
    setChat(next);
    setDraft("");
    setError(null);

    if (isAdminIntent(question)) {
      setChat([...next, { role: "assistant", content: ADMIN_REPLY }]);
      setAdminOffer(true);
      return;
    }

    setThinking(true);
    setExcited(true);
    try {
      const res = await ask({
        data: {
          messages: next.slice(-12),
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      const clean = res.reply.replace(/\*\*/g, "").replace(/^\s*[-*•]\s+/gm, "· ");
      setChat([...next, { role: "assistant", content: clean }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setThinking(false);
      window.setTimeout(() => setExcited(false), 600);
    }
  };

  useEffect(() => {
    setIndex(0);
  }, [pathname]);

  // Typing animation
  useEffect(() => {
    const full = lines[index % lines.length] ?? "";
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [lines, index]);

  // Auto-advance
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => i + 1), 9000);
    return () => window.clearInterval(id);
  }, []);

  // Head follows the cursor
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      el.style.setProperty("--look-x", `${Math.max(-1, Math.min(1, dx * 2)) * 5}px`);
      el.style.setProperty("--look-y", `${Math.max(-1, Math.min(1, dy * 2)) * 3}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const celebrate = () => {
    setExcited(true);
    setIndex((i) => i + 1);
    window.setTimeout(() => setExcited(false), 900);
  };

  return (
    <aside className={styles.dock} aria-live="polite">
      {chatOpen ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <p className={styles.name}>Ask DIMISI</p>
            <button
              type="button"
              className={styles.mini}
              onClick={() => setChatOpen(false)}
              aria-label="Close the DIMISI chat"
            >
              Close
            </button>
          </div>

          <div className={styles.log} ref={logRef} data-lenis-prevent tabIndex={0}>
            {chat.length === 0 ? (
              <p className={styles.hint}>
                I am DIMISI, your guide. Ask me anything about the site — services, products, team,
                blog, careers or how to start a project. I read the latest pages live.
              </p>
            ) : null}
            {chat.map((m, i) => (
              <p
                key={`${m.role}-${i}`}
                className={[styles.msg, m.role === "user" ? styles.msgUser : styles.msgBot].join(" ")}
              >
                {m.content}
              </p>
            ))}
            {thinking ? <p className={[styles.msg, styles.msgBot].join(" ")}>Thinking…</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
            {adminOffer ? (
              <div className={styles.chips}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => {
                    setAdminOffer(false);
                    setChatOpen(false);
                    void navigate({ to: ADMIN_ROUTE });
                  }}
                >
                  🔐 Admin Login
                </button>
              </div>
            ) : null}
          </div>

          {chat.length === 0 ? (
            <div className={styles.chips}>
              {SUGGESTIONS.map((q) => (
                <button key={q} type="button" className={styles.chip} onClick={() => void send(q)}>
                  {q}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <input
              className={styles.input}
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question…"
              aria-label="Your question for DIMISI"
            />
            <button type="submit" className={styles.send} disabled={thinking || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : open ? (
        <div className={styles.bubble}>
          <p className={styles.name}>DIMISI</p>
          <p className={styles.line}>
            {typed}
            <span className={styles.caret} aria-hidden="true" />
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.mini} onClick={celebrate}>
              Next tip
            </button>
            <button type="button" className={styles.mini} onClick={() => setChatOpen(true)}>
              Ask me
            </button>
            <button type="button" className={styles.mini} onClick={() => setOpen(false)}>
              Hide
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={[styles.robot, excited ? styles.excited : ""].join(" ")}
        onClick={() => (chatOpen ? setChatOpen(false) : open ? setChatOpen(true) : setOpen(true))}
        aria-label={chatOpen ? "Close the DIMISI chat" : "Chat with DIMISI, the guide robot"}
      >
        <span className={styles.shell} ref={shellRef}>
          <span className={styles.antenna} aria-hidden="true" />
          <span className={styles.head} aria-hidden="true">
            <span className={styles.visor}>
              <span className={styles.eye} />
              <span className={styles.eye} />
            </span>
          </span>
          <span className={styles.body} aria-hidden="true">
            <span className={styles.core} />
          </span>
          <span className={styles.armL} aria-hidden="true" />
          <span className={styles.armR} aria-hidden="true" />
          <span className={styles.thruster} aria-hidden="true" />
        </span>
      </button>
    </aside>
  );
}