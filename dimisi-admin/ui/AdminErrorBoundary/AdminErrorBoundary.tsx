import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import styles from "../styles/admin.module.css";

interface Props {
  tab?: string;
  children: ReactNode;
  onResetTab?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (typeof window !== "undefined" && (import.meta as any).env?.DEV) {
      console.warn(`[Admin Error Boundary] Caught runtime error in tab "${this.props.tab}":`, error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: Props): void {
    if (prevProps.tab !== this.props.tab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "An unexpected error occurred while rendering this section.";
      const isChunkError =
        errorMessage.includes("dynamically imported module") ||
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("ChunkLoadError");

      return (
        <div className={styles.card} style={{ margin: "2.5rem auto", maxWidth: "560px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "14px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              marginBottom: "1rem",
              border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <p className={styles.kicker} style={{ color: "#ef4444" }}>
            {isChunkError ? "Network / Module Load Issue" : "Component Error"}
          </p>
          <h2 className={styles.title} style={{ fontSize: "1.5rem" }}>
            Unable to load {this.props.tab ? `the ${this.props.tab} section` : "this section"}
          </h2>
          <p className={styles.sub} style={{ marginBottom: "1.5rem", lineHeight: "1.5", fontSize: "0.88rem" }}>
            {isChunkError
              ? "A fresh version of this admin module may have been published or network connectivity was interrupted. Please retry loading."
              : errorMessage}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className={styles.btn}
              onClick={this.handleRetry}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.6rem 1.2rem",
                fontSize: "0.88rem",
              }}
            >
              <RotateCcw size={15} />
              <span>Retry Section</span>
            </button>
            {this.props.onResetTab && this.props.tab !== "overview" && (
              <button
                type="button"
                className={[styles.btn, styles.ghost].join(" ")}
                onClick={this.props.onResetTab}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.6rem 1.2rem",
                  fontSize: "0.88rem",
                }}
              >
                <ArrowLeft size={15} />
                <span>Return to Overview</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
