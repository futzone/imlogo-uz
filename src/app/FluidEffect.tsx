"use client";

import { useEffect } from "react";

const FluidEffect: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/fluid-cursor.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <canvas id="fluid" />;
};

export default FluidEffect;
