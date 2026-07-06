import { useEffect, useState } from "react";

const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

type Props = {
  text: string;
  delay: number;
  className?: string;
};

export function ScrambleIn({ text, delay, className }: Props) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count += 0.5;
        setRevealed(count);
        if (count >= text.length) clearInterval(interval);
      }, 25);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {text.split("").map((char, i) => {
        if (char === " ") return <span key={i}>&nbsp;</span>;
        if (i < revealed) return <span key={i}>{char}</span>;
        if (i < revealed + 3)
          return (
            <span key={i}>
              {chars[Math.floor(Math.random() * chars.length)]}
            </span>
          );
        return (
          <span key={i} style={{ opacity: 0 }}>
            {char}
          </span>
        );
      })}
    </span>
  );
}
