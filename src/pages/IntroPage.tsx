import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { stores, appLogo } from "@/lib/store";

const IntroPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  // Create a larger set of background logos by repeating stores with random positions
  const scatteredLogos = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const store = stores[i % stores.length];
      return {
        id: `scatter-${i}`,
        icon: store.icon,
        name: store.name,
        x: Math.random() > 0.5 ? Math.random() * 35 : -(Math.random() * 35),
        y: Math.random() > 0.5 ? Math.random() * 35 : -(Math.random() * 35),
        scale: 0.6 + Math.random() * 0.4,
        duration: 15 + Math.random() * 10,
        delay: i * 0.1,
      };
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("intro_seen", "true");
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => navigate("/", { replace: true }), 800);
    }, 4500); // Slightly longer for richer animation
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[100] overflow-hidden"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,104,10,0.05)_0%,transparent_70%)]" />

          {/* Scattered Store Logos */}
          {scatteredLogos.map((logo, i) => (
            <motion.div
              key={logo.id}
              className="absolute flex flex-col items-center gap-1 grayscale"
              style={{
                left: `${50 + logo.x}%`,
                top: `${50 + logo.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0, filter: "blur(8px)" }}
              animate={{
                opacity: [0, 0.4, 0.25],
                scale: logo.scale,
                filter: ["blur(8px)", "blur(2px)", "blur(4px)"],
                x: [0, Math.random() * 30 - 15, 0],
                y: [0, Math.random() * 30 - 15, 0],
              }}
              transition={{
                duration: logo.duration,
                delay: logo.delay,
                repeat: Infinity,
                ease: "linear",
                opacity: { duration: 2, delay: logo.delay },
                scale: { duration: 2, delay: logo.delay },
              }}
            >
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-2xl">
                {typeof logo.icon === 'string' ? (
                  <img src={logo.icon} alt={logo.name} className="w-full h-full object-contain opacity-60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">{logo.icon}</div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Radial mask to deepen focus - adjusted to be less aggressive */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(5,5,5,0.2) 50%, rgba(5,5,5,0.7) 100%)",
            }}
          />

          {/* Central Logo Container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* App Icon */}
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(198,104,10,0.3)] overflow-hidden p-5"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, type: "spring" }}
              >
                <img src={appLogo} alt="Trjara" className="w-full h-full object-contain brightness-0 invert" />
              </motion.div>

              {/* Brand Name */}
              <div className="flex flex-col items-center gap-2">
                <motion.h1
                  className="font-display text-4xl md:text-6xl font-black tracking-tighter text-white"
                  initial={{ opacity: 0, letterSpacing: "-0.05em" }}
                  animate={{ opacity: 1, letterSpacing: "0em" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  TRJARA<span className="text-primary">.</span>
                </motion.h1>
                <motion.div
                  className="h-px w-12 bg-primary/50"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
                <motion.p
                  className="text-xs md:text-sm text-primary/80 font-bold uppercase tracking-[0.3em]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  The Future of Shopping
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Subtle particles or noise overlay could go here */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroPage;
