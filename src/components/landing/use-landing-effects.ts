"use client";

import { useEffect } from "react";

export function useLandingEffects() {
  useEffect(() => {
    const cur = document.getElementById("pl-cursor");
    const ring = document.getElementById("pl-cursor-ring");
    if (!cur || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cur.style.left = `${mx - 4}px`;
      cur.style.top = `${my - 4}px`;
      ring.style.left = `${rx - 18}px`;
      ring.style.top = `${ry - 18}px`;
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.borderColor = "rgba(167,139,250,0.7)";
    };
    const onLeave = () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(167,139,250,0.4)";
    };

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    const interactives = document.querySelectorAll(
      ".pl-root button, .pl-root a, .pl-root .cal-day, .pl-root .time-slot, .pl-root .service-card, .pl-root .testi-card, .pl-root .cred-card"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".pl-root .reveal").forEach((el) => io.observe(el));

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      io.disconnect();
    };
  }, []);
}
