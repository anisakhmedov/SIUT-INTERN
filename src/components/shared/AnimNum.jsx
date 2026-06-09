import { useState, useRef, useEffect } from "react";

export default function AnimNum({ target, sfx = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          let c = 0;
          const s = 60;
          const inc = target / s;
          const t = setInterval(() => {
            c = Math.min(c + inc, target);
            setV(Math.round(c));
            if (c >= target) clearInterval(t);
          }, 2000 / s);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {v}
      {sfx}
    </span>
  );
}
