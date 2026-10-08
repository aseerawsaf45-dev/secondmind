import type { Variants, Transition } from 'framer-motion';

// Centralized Framer Motion Configurations for SecondMind UI/UX Redesign
export const spring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

export const slowSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 40,
  mass: 1
};

export const pageReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const popoverVariant: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      duration: 0.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: -4, 
    transition: { 
      duration: 0.15, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const commandPaletteVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { 
      duration: 0.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};
