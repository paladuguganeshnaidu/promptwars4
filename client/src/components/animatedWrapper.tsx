import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
}

export function AnimatedWrapper({ children }: AnimatedWrapperProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
