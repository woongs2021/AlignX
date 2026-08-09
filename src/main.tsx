import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import { App } from '@/App';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/typography.css';
import '@/styles/layout.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.09, duration: 1.1 }}>
        <App />
      </ReactLenis>
    </MotionConfig>
  </StrictMode>,
);
