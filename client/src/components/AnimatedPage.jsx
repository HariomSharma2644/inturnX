import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedPage({ children }) {
  const ref = useRef();

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
