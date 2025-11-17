import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

interface AnimatedBackgroundProps {
  className?: string;
}

export const AnimatedBackground = ({ className = '' }: AnimatedBackgroundProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Load the slim bundle (smaller, optimized version)
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      className={className}
      init={particlesInit}
      options={{
        background: {
          color: {
            value: '#1a2332', // Dark blue background matching your theme
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: {
              enable: false,
            },
            onHover: {
              enable: true,
              mode: ['grab', 'repulse'],
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: '#e0e0e0', // Light grey/white for particles
          },
          links: {
            color: '#e0e0e0',
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: {
                number: {
                  value: 40,
                },
                links: {
                  distance: 100,
                },
              },
            },
          },
        ],
      }}
    />
  );
};
