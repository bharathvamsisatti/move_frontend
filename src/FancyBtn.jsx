import { motion } from "framer-motion";

export default function FancyBtn({ children, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(90deg, #00bfa6, #6b5cff)",
        color: "#021021",
        outline: "none",
        fontSize: "15px",
      }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      {children}
    </motion.button>
  );
}
