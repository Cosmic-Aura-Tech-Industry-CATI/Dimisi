import { useEffect, useRef, useState } from "react";

const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

type Props = {
  text: string;
  isHovered: boolean;
  className?: string;
};

export function ScrambleText({ text, isHovered, className }: Props) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isHovered) {
      setDisplay(text);
      return;
    }

    frameRef.current = 0;
    intervalRef.current = setInterval(() => {
      frameRef.current += 1;
      // 4 frames per character determines how many are locked in.
      const revealed = Math.floor(frameRef.current / 4);
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealed) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );
      if (revealed >= text.length) {
        setDisplay(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}
