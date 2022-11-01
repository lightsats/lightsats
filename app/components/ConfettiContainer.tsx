import { confetti } from "dom-confetti";
import React from "react";

export function ConfettiContainer() {
  const confettiRef = React.useRef(null);
  React.useEffect(() => {
    if (confettiRef.current) {
      confetti(confettiRef.current, { elementCount: 100 });
    }
  }, [confettiRef]);

  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    >
      <div ref={confettiRef}></div>
    </div>
  );
}
