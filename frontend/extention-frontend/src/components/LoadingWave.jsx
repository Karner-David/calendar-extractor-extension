// src/components/ProcessingSpinner.jsx
import { motion } from "framer-motion";

export default function ProcessingSpinner({ text = "PROCESSING!" }) {
  return (
    <div className="flex justify-center gap-1">
      {text.split("").map((letter, index) => (
        <motion.span
          key={index}
          className="text-4xl"
          style={{ color: "#BF5700", fontFamily: 'BILLO, sans-serif' }}
          initial={{ y: 0 }}
          animate={{ y: [-5, 0] }} 
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.1, 
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}