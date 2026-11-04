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

export const springPhysics: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 28,
  mass: 0.85
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 24,
  mass: 0.8
};

export const pageReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02
    }
  }
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 24,
      mass: 0.85
    }
  }
};

export const listItemReveal: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 26
    }
  }
};

export const popoverVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 28
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -4, 
    transition: { 
      duration: 0.14, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const bannerVariant: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 28
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: "easeOut"
    }
  }
};

export const commandPaletteVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 380,
      damping: 28
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: -6, 
    transition: { 
      duration: 0.18, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};
