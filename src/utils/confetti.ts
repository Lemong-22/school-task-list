import confetti from 'canvas-confetti';

export const celebrateTaskCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
  });
};

export const celebrateLevelUp = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const celebrateTitleUnlock = () => {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#FFD700', '#FFA500', '#FFFF00', '#FF6347'],
    shapes: ['star'],
    scalar: 1.2,
  });
};
