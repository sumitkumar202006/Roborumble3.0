"use client";

import { useEffect } from "react";
import styles from "./Hero.module.scss";

interface HeroProps {
  onComplete: () => void;
}

export default function Hero({ onComplete }: HeroProps) {
  const title = "ROBO RUMBLE 3.0";

  // Auto-redirect after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds for animation then redirect

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.heroContainer}>
      <h1 className={styles.glitchText} data-text={title}>
        <div className={styles.line1}>
          {"ROBO RUMBLE".split("").map((char, i) => (
            <span
              key={i}
              className={styles.letter}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {char}
            </span>
          ))}
        </div>
        <div className={styles.line2}>
          {" 3.0".split("").map((char, i) => (
            <span
              key={i + 11}
              className={styles.letter}
              style={{ animationDelay: `${(i + 11) * 0.05}s` }}
            >
              {char}
            </span>
          ))}
        </div>
      </h1>

      <p className={`${styles.subtitle} mt-6 font-mono text-sm md:text-base tracking-widest uppercase`}>
        {">> ACCESSING SYSTEM <<"}
      </p>
    </div>
  );
}
