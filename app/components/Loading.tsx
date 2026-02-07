import React from 'react';
import styles from './Loading.module.scss';
import { clsx } from 'clsx'; // Optional, but helps with multiple classes if needed, or just template literals
import { GlitchTears } from './GlitchTears';
import MatrixBackground from './MatrixBackground';

const Loading = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.container}>
        <div className={styles.h1Container}>
          <div className={clsx(styles.cube, styles.h1, styles.w1, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w1, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w1, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w2, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w2, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w2, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w3, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w3, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h1, styles.w3, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>
        </div>

        <div className={styles.h2Container}>
          <div className={clsx(styles.cube, styles.h2, styles.w1, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w1, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w1, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w2, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w2, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w2, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w3, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w3, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h2, styles.w3, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>
        </div>

        <div className={styles.h3Container}>
          <div className={clsx(styles.cube, styles.h3, styles.w1, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w1, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w1, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w2, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w2, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w2, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w3, styles.l1)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w3, styles.l2)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>

          <div className={clsx(styles.cube, styles.h3, styles.w3, styles.l3)}>
            <div className={clsx(styles.face, styles.top)}></div>
            <div className={clsx(styles.face, styles.left)}></div>
            <div className={clsx(styles.face, styles.right)}></div>
          </div>
        </div>
      </div>
      
      <div className={styles.textContainer}>
        <div className={styles.loadingText} data-text="LOADING THE RUMBLE...">LOADING THE RUMBLE...</div>
        <div className={styles.loadingLine}></div>
      </div>
      
      <GlitchTears />
      
      {/* Matrix Background (Red/Inactive) */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -10 }}>
         <MatrixBackground color="#FF0000" text="STATUS: TERMINAL INACTIVE" />
      </div>
    </div>
  );
};

export default Loading;
