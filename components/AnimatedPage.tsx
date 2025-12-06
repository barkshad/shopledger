
import React from 'react';
import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

interface AnimatedPageProps {
  children: React.ReactNode;
}

const MotionDiv = motion.div as any;

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  return (
    <MotionDiv
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
    >
      {children}
    </MotionDiv>
  );
};

export default AnimatedPage;
