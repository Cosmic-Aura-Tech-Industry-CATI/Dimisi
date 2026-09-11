import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { askDimisi, type ChatMessage, type ActionChip } from "@/lib/chat.functions";
import type { UploadedFile, ProjectEstimateInput, ProjectEstimateResult } from "@/lib/ai/ai.types";
import { voiceAssistant, isSpeechRecognitionSupported } from "@/lib/ai/ai.voice";
import { validateUploadedFile, readFileAsDataUrl } from "@/lib/ai/ai.security";
import { calculateProjectEstimate } from "@/lib/ai/ai.estimator";
import { detectDimisiWakePhrase } from "@/lib/ai/wakeWord";
import { getRandomWakeGreeting, type AssistantState } from "@/lib/ai/conversation";
import { isAdminIntent, ADMIN_REPLY, ADMIN_ROUTE } from "@admin/lib/intent";
import styles from "./RobotGuide.module.css";

const SUGGESTIONS = [
  "What does DIMISI Technologies do?",
  "Tell me about the Kalesh app",
  "Which services do you offer?",
  "How do I start a project?",
  "Estimate my project cost & timeline",
];

const SCRIPTS: Record<string, string[]> = {
  "/": [
    "Welcome. I am DIMISI AI — your intelligent guide through this world.",
    "Scroll slowly. Every scroll moves the camera, not just the page.",
    "The Owl above you is our brand mind: vision, wisdom, perception.",
    "Need something specific? Tap any chapter in the navigation.",
  ],
  "/services": [
    "Six core service pillars. Explore each dedicated chapter.",
    "Most teams start with Intelligent Automation or Web Engineering.",
    "Pricing is a floor, not a quote — scope changes everything.",
  ],
  "/products": [
    "These are the products we run in production, not slideware.",
    "ATHENA Core is the multi-agent AI brain behind our systems.",
    "Compare them below — engineered for high throughput.",
  ],
  "/blog": [
    "Our engineers write these. No ghostwriters, no fluff.",
    "Filter by category or search — full index ready.",
  ],
  "/gallery": [
    "Concept art, shader tests and interface studies from the studio.",
    "Click any frame to open it fullscreen. Escape closes it.",
  ],
  "/career": [
    "We hire for craft and curiosity. Templates get archived instantly.",
    "Five steps, forty-eight hour decisions, no ghosting. Ever.",
  ],
  "/reviews": [
    "5.0★ verified ratings from enterprise clients and team alumni.",
    "Filter reviews by category or submit your own verified review.",
  ],
  "/contact": [
    "Tell me what you are building. I route it to our leadership in minutes.",
    "Everything here is validated live — 48-hour blueprint turnaround.",
  ],
};

/**
 * DIMISI AI — The Intelligent Guide Robot & Sales Assistant.
 * Persistent across the site, reacts to route, pointer, voice, attachments, and user interaction.
 */
export function RobotGuide() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lines = useMemo(() => SCRIPTS[pathname] ?? SCRIPTS["/"], [pathname]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [open, setOpen] = useState(true);
  const [excited, setExcited] = useState(false);
  const [waking, setWaking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [assistantState, setAssistantState] = useState<AssistantState>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [adminOffer, setAdminOffer] = useState(false);

  // Voice & Media States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project Estimator Interactive State
  const [showEstimator, setShowEstimator] = useState(false);
  const [estimatorInput, setEstimatorInput] = useState<ProjectEstimateInput>({
    projectType: "web",
    scale: "mvp",
    features: ["auth", "admin"],
  });
  const [estimatorResult, setEstimatorResult] = useState<ProjectEstimateResult | null>(null);

  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat, assistantState, showEstimator]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.stopListening();
      voiceAssistant.stopSpeaking();
    };
  }, []);

  const triggerWakeUpAnimation = () => {
    setWaking(true);
    setExcited(true);
    setAssistantState("WAKING");
    window.setTimeout(() => {
      setWaking(false);
      setExcited(false);
    }, 900);
  };

  const send = async (rawText: string, customAttachment?: UploadedFile | null) => {
    let question = rawText.trim();
    const activeAttachment = customAttachment !== undefined ? customAttachment : attachment;

    if ((!question && !activeAttachment) || assistantState === "PROCESSING") return;

    // 1. Strict Secret Admin Trigger Pre-Check (Isolated & never revealed)
    if (isAdminIntent(question)) {
      const next: ChatMessage[] = [...chat, { role: "user", content: question }];
      setChat([...next, { role: "assistant", content: ADMIN_REPLY }]);
      setAdminOffer(true);
      setDraft("");
      setAttachment(null);
      return;
    }

    // 2. Wake-word detection & query stripping
    const wake = detectDimisiWakePhrase(question);
    if (wake.activated) {
      if (import.meta.env.DEV) {
        console.log("[DIMISI AI] Wake phrase detected:", wake.phrase);
      }
      triggerWakeUpAnimation();
      setChatOpen(true);

      // If user typed only a wake phrase (e.g., "Hey Dimisi", "Dimisi wake up")
      if (wake.isWakeOnly && !activeAttachment) {
        const isHindi = /(?:sunno|kaise|batao|namaste)/i.test(wake.phrase || "");
        const greeting = getRandomWakeGreeting(isHindi);
        const next: ChatMessage[] = [
          ...chat,
          { role: "user", content: question },
          {
            role: "assistant",
            content: greeting,
            actions: [
              { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
              { id: "estimator", label: "📊 Project Estimator", action: "estimator" },
            ],
          },
        ];
        setChat(next);
        setDraft("");
        setAttachment(null);
        setAssistantState("ACTIVE_CONVERSATION");
        return;
      }

      // If user said "Hey Dimisi, what services do you offer?", use stripped query
      if (wake.remainingQuery) {
        question = wake.remainingQuery;
      }
    }

    const next: ChatMessage[] = [
      ...chat,
      {
        role: "user",
        content: rawText.trim() || (activeAttachment ? `Attached: ${activeAttachment.name}` : ""),
        attachment: activeAttachment || undefined,
      },
    ];

    setChat(next);
    setDraft("");
    setAttachment(null);
    setError(null);
    setAssistantState("PROCESSING");
    setExcited(true);

    try {
      const res = await askDimisi({
        data: {
          messages: next.slice(-12),
          currentRoute: pathname,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
          attachment: activeAttachment || undefined,
        },
      });

      setChat([
        ...next,
        {
          role: "assistant",
          content: res.reply,
          actions: res.actions,
        },
      ]);
      setAssistantState("ACTIVE_CONVERSATION");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setAssistantState("IDLE");
    } finally {
      window.setTimeout(() => setExcited(false), 600);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      setAssistantState("IDLE");
      return;
    }

    setAssistantState("LISTENING");
    const started = voiceAssistant.startListening({
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          void send(transcript);
        } else {
          setAssistantState("IDLE");
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        setAssistantState("IDLE");
        setError(errMsg);
      },
      onEnd: () => {
        setIsListening(false);
        if (assistantState === "LISTENING") {
          setAssistantState("IDLE");
        }
      },
    });

    if (started) {
      setIsListening(true);
      setError(null);
    }
  };

  const handleSpeakMessage = (msgContent: string, idx: number) => {
    if (speakingMsgIdx === idx) {
      voiceAssistant.stopSpeaking();
      setSpeakingMsgIdx(null);
      return;
    }

    voiceAssistant.speak(
      msgContent,
      () => setSpeakingMsgIdx(idx),
      () => setSpeakingMsgIdx(null),
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const uploaded = await readFileAsDataUrl(file);
      setAttachment(uploaded);
      setError(null);
    } catch {
      setError("Failed to read the file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleActionClick = (chip: ActionChip) => {
    if (chip.action === "navigate" && chip.target) {
      setChatOpen(false);
      void navigate({ to: chip.target });
    } else if (chip.action === "estimator") {
      setShowEstimator(true);
      const res = calculateProjectEstimate(estimatorInput);
      setEstimatorResult(res);
    } else if (chip.action === "message" && chip.target) {
      void send(chip.target);
    }
  };

  const handleRunEstimator = () => {
    const res = calculateProjectEstimate(estimatorInput);
    setEstimatorResult(res);
  };

  const toggleFeature = (feat: string) => {
    setEstimatorInput((prev) => {
      const exists = prev.features.includes(feat);
      const nextFeats = exists
        ? prev.features.filter((f) => f !== feat)
        : [...prev.features, feat];
      const updated = { ...prev, features: nextFeats };
      setEstimatorResult(calculateProjectEstimate(updated));
      return updated;
    });
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
            <div className={styles.panelBadge}>
              <span className={styles.panelBadgeDot} />
              <span>DIMISI AI</span>
            </div>
            <button
              type="button"
              className={styles.mini}
              onClick={() => {
                setChatOpen(false);
                voiceAssistant.stopSpeaking();
                voiceAssistant.stopListening();
                setAssistantState("IDLE");
              }}
              aria-label="Close the DIMISI AI chat"
            >
              Close
            </button>
          </div>

          <div className={styles.log} ref={logRef} data-lenis-prevent tabIndex={0}>
            {chat.length === 0 && !showEstimator ? (
              <p className={styles.hint}>
                I am DIMISI AI, your intelligent assistant & technology guide. Ask me anything, or
                say &quot;Hey Dimisi&quot; anytime to begin.
              </p>
            ) : null}

            {chat.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={m.role === "user" ? styles.msgUser : styles.msgBotWrapper}
              >
                {m.attachment ? (
                  <div className={styles.msgAttachment}>
                    📎 {m.attachment.name}
                  </div>
                ) : null}
                <div className={[styles.msg, m.role === "user" ? styles.msgUser : styles.msgBot].join(" ")}>
                  {m.content}
                </div>

                {m.role === "assistant" ? (
                  <div className={styles.msgActions}>
                    <button
                      type="button"
                      className={[styles.speakBtn, speakingMsgIdx === i ? styles.speakBtnActive : ""].join(" ")}
                      onClick={() => handleSpeakMessage(m.content, i)}
                      aria-label="Listen to this response"
                    >
                      {speakingMsgIdx === i ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  </div>
                ) : null}

                {m.actions && m.actions.length > 0 ? (
                  <div className={styles.chips} style={{ marginTop: "0.3rem" }}>
                    {m.actions.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        className={styles.chip}
                        onClick={() => handleActionClick(act)}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {assistantState === "PROCESSING" ? (
              <p className={[styles.msg, styles.msgBot].join(" ")}>DIMISI AI is processing…</p>
            ) : null}

            {isListening ? (
              <div className={styles.listeningAlert}>
                <span>🎙️</span>
                <span>Listening… speak your question or say &quot;Hey Dimisi&quot;</span>
              </div>
            ) : null}

            {/* Smart Project Estimator Interactive View */}
            {showEstimator ? (
              <div className={styles.estimatorContainer}>
                <div className={styles.estimatorTitle}>
                  <span>📊 Smart Project Estimator</span>
                  <button
                    type="button"
                    className={styles.estimatorClose}
                    onClick={() => setShowEstimator(false)}
                    aria-label="Close Estimator"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <p className={styles.estimatorLabel}>1. Project Discipline:</p>
                  <div className={styles.estimatorGrid}>
                    {(["web", "mobile", "ai", "enterprise"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={[
                          styles.estimatorBtn,
                          estimatorInput.projectType === type ? styles.estimatorBtnSelected : "",
                        ].join(" ")}
                        onClick={() => {
                          const updated = { ...estimatorInput, projectType: type };
                          setEstimatorInput(updated);
                          setEstimatorResult(calculateProjectEstimate(updated));
                        }}
                      >
                        {type === "web" ? "🌐 Web Platform" : type === "mobile" ? "📱 Mobile App" : type === "ai" ? "🧠 AI Systems" : "🏢 Enterprise Cloud"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={styles.estimatorLabel}>2. Engagement Scale:</p>
                  <div className={styles.estimatorGrid}>
                    {(["mvp", "growth", "enterprise"] as const).map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        className={[
                          styles.estimatorBtn,
                          estimatorInput.scale === scale ? styles.estimatorBtnSelected : "",
                        ].join(" ")}
                        onClick={() => {
                          const updated = { ...estimatorInput, scale };
                          setEstimatorInput(updated);
                          setEstimatorResult(calculateProjectEstimate(updated));
                        }}
                      >
                        {scale === "mvp" ? "🚀 Fast MVP" : scale === "growth" ? "📈 Growth Scale" : "🏛️ Enterprise"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={styles.estimatorLabel}>3. Core Modules (Select all needed):</p>
                  <div className={styles.estimatorGrid}>
                    {[
                      { id: "auth", label: "🔒 Auth & RBAC" },
                      { id: "payments", label: "💳 Payments" },
                      { id: "admin", label: "📊 Admin Ops" },
                      { id: "ai", label: "🤖 AI / LLM" },
                      { id: "realtime", label: "⚡ Real-time" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={[
                          styles.estimatorBtn,
                          estimatorInput.features.includes(f.id) ? styles.estimatorBtnSelected : "",
                        ].join(" ")}
                        onClick={() => toggleFeature(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {estimatorResult ? (
                  <div className={styles.estimatorResultBox}>
                    <div className={styles.estimatorResultTitle}>{estimatorResult.title}</div>
                    <div>
                      <strong>Timeline:</strong>{" "}
                      <span className={styles.estimatorTimeline}>{estimatorResult.estimatedTimeline}</span>
                    </div>
                    <div>
                      <strong>Stack:</strong> {estimatorResult.techStack.slice(0, 3).join(", ")}
                    </div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <button
                        type="button"
                        className={styles.mini}
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => {
                          setChatOpen(false);
                          void navigate({ to: "/contact" });
                        }}
                      >
                        💬 Start 48-Hr Project Discussion
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

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

          {chat.length === 0 && !showEstimator ? (
            <div className={styles.chips}>
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.chip}
                  onClick={() => {
                    if (q.includes("Estimate")) {
                      setShowEstimator(true);
                      handleRunEstimator();
                    } else {
                      void send(q);
                    }
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}

          {/* Attachment Preview */}
          {attachment ? (
            <div className={styles.attachmentPreview}>
              <span>📎 {attachment.name}</span>
              <button
                type="button"
                className={styles.removeAttachment}
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          ) : null}

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach document or screenshot for AI analysis"
              title="Upload wireframe, screenshot or PDF"
            >
              📎
            </button>

            {isSpeechRecognitionSupported() ? (
              <button
                type="button"
                className={[styles.iconBtn, isListening ? styles.iconBtnRecording : ""].join(" ")}
                onClick={handleVoiceToggle}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={isListening ? "Listening..." : "Speak your question"}
              >
                🎙️
              </button>
            ) : null}

            <input
              className={styles.input}
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask DIMISI AI or say 'Hey Dimisi'…"
              aria-label="Your question for DIMISI AI"
            />
            <button
              type="submit"
              className={styles.send}
              disabled={assistantState === "PROCESSING" || (!draft.trim() && !attachment)}
            >
              Send
            </button>
          </form>
        </div>
      ) : open ? (
        <div className={styles.bubble}>
          <p className={styles.name}>DIMISI AI</p>
          <p className={styles.line}>
            {typed}
            <span className={styles.caret} aria-hidden="true" />
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.mini} onClick={celebrate}>
              Next tip
            </button>
            <button
              type="button"
              className={styles.mini}
              onClick={() => {
                triggerWakeUpAnimation();
                setChatOpen(true);
              }}
            >
              Wake AI
            </button>
            <button type="button" className={styles.mini} onClick={() => setOpen(false)}>
              Hide
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={[styles.robot, excited ? styles.excited : "", waking ? styles.waking : ""].join(" ")}
        onClick={() => {
          if (chatOpen) {
            setChatOpen(false);
          } else {
            triggerWakeUpAnimation();
            setChatOpen(true);
          }
        }}
        aria-label={chatOpen ? "Close DIMISI AI" : "Chat with DIMISI AI, your intelligent assistant"}
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