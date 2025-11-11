import { useEffect } from "react";
import gsap from "gsap";

export default function FloatingBlobs() {
  useEffect(() => {
    gsap.to(".blob", {
      y: 30,
      x: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <>
      <div className="blob absolute top-10 left-20 w-72 h-72 bg-[#14A44D]/20 blur-3xl rounded-full" style={{ zIndex: -1 }}></div>
      <div className="blob absolute bottom-20 right-20 w-96 h-96 bg-[#5F2EEA]/30 blur-3xl rounded-full" style={{ zIndex: -1 }}></div>
    </>
  );
}
