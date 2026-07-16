window.PULSE = window.PULSE || {};

function startVisualTest(container, onComplete) {
  let attempts = [];
  const totalAttempts = 5;
  let currentAttempt = 0;
  let timerId = null;
  let state = 'instructions'; // instructions, waiting, ready, feedback, results
  let triggerTime = 0;

  let feedbackTimeoutId = null;
  let feedbackCallback = null;

  function setFeedbackTimeout(callback, delay) {
    feedbackCallback = callback;
    feedbackTimeoutId = setTimeout(() => {
      feedbackCallback = null;
      feedbackTimeoutId = null;
      callback();
    }, delay);
  }

  function triggerFeedbackNext() {
    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId);
      const cb = feedbackCallback;
      feedbackCallback = null;
      feedbackTimeoutId = null;
      if (cb) cb();
    }
  }

  const handleGlobalKeyDown = (e) => {
    // Self-cleanup check: if the visual elements are no longer present in the DOM, clean up the listener
    if (!container.isConnected || 
        (!document.getElementById('visual-instruct-screen') && 
         !document.getElementById('reaction-box') && 
         !document.getElementById('visual-results-screen'))) {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      return;
    }

    // Prevent space bar from scrolling the page
    if (e.key === ' ') {
      e.preventDefault();
    }

    // Ignore keyboard repeats when holding keys down
    if (e.repeat) return;

    // Handle inputs based on current state
    if (state === 'instructions') {
      if (e.key === ' ' || e.key === 'Enter') {
        const btn = document.getElementById('btn-start-visual-test');
        if (btn) btn.click();
      }
    } else if (state === 'waiting' || state === 'ready') {
      if (e.key === ' ') {
        handleBoxClick();
      }
    } else if (state === 'feedback') {
      if (e.key === ' ' || e.key === 'Enter') {
        triggerFeedbackNext();
      }
    } else if (state === 'results') {
      if (e.key === ' ' || e.key === 'Enter') {
        const btn = document.getElementById('btn-results-restart');
        if (btn) btn.click();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        const btn = document.getElementById('btn-results-exit');
        if (btn) btn.click();
      }
    }
  };

  // Attach global keyboard handler
  window.addEventListener('keydown', handleGlobalKeyDown);

  showInstructions();

  function showInstructions() {
    state = 'instructions';
    container.innerHTML = `
      <div class="screen-wrapper" id="visual-instruct-screen">
        <h3 class="screen-title text-gradient-cyan-blue">RETINAL LATENCY EVALUATION</h3>
        <p class="screen-intro-text">
          Isolate retinal transmission speed against sudden chromatic light shifts. This module maps raw speed of signal transduction from the retina down the optic nerve pathways.
        </p>
        <ul class="screen-steps-list">
          <li>
            <span class="step-num">1</span>
            <div><strong>Initialize Calibration:</strong> Click the button below or press <strong style="color: var(--color-cyan);">SPACE</strong> / <strong style="color: var(--color-cyan);">ENTER</strong> to prepare your sensory reflexes.</div>
          </li>
          <li>
            <span class="step-num">2</span>
            <div><strong>Maintain Fixation:</strong> The main panel will transition to a high-alert standby state. Wait patiently.</div>
          </li>
          <li>
            <span class="step-num">3</span>
            <div><strong>Chromatic Shift:</strong> When the panel turns green and displays "CLICK NOW!", tap/click anywhere inside it or press <strong style="color: var(--color-cyan);">SPACE</strong> as fast as physically possible.</div>
          </li>
          <li>
            <span class="step-num">4</span>
            <div><strong>Precision Calibration:</strong> Complete 5 full attempts. Early triggers will cancel the current run.</div>
          </li>
        </ul>
        <div style="margin-top: auto; text-align: right;">
          <button class="btn-primary" id="btn-start-visual-test" style="font-family: var(--font-display);">Begin Calibration</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-visual-test').addEventListener('click', () => {
      attempts = [];
      currentAttempt = 0;
      startNextAttempt();
    });
  }

  function startNextAttempt() {
    currentAttempt++;
    state = 'waiting';
    
    container.innerHTML = `
      <div class="screen-wrapper">
        <div class="round-tracking-badge">ATTEMPT ${currentAttempt} OF ${totalAttempts}</div>
        <div class="test-play-zone">
          <div class="reaction-target-box waiting" id="reaction-box">
            <span class="reaction-prompt-text" style="color: #ef4444;">Standby...</span>
            <span class="reaction-subprompt-text">Wait for the screen to turn green</span>
          </div>
          <div class="keyboard-hint" style="margin-top: 1.25rem; font-size: 0.85rem; color: var(--color-text-muted); font-family: var(--font-sans); text-align: center; opacity: 0.8; line-height: 1.4;">
            Click anywhere or press <kbd style="background: rgba(255, 255, 255, 0.08); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: var(--font-mono); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.3); font-size: 0.75rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0.2rem;">SPACE</kbd> as soon as the stimulus appears.
          </div>
        </div>
      </div>
    `;

    const reactionBox = document.getElementById('reaction-box');
    
    // Random delay between 1.8s and 4.2s
    const randomDelay = 1800 + Math.random() * 2400;
    
    timerId = setTimeout(() => {
      triggerReadyState(reactionBox);
    }, randomDelay);

    reactionBox.addEventListener('click', handleBoxClick);
  }

  function triggerReadyState(reactionBox) {
    state = 'ready';
    triggerTime = performance.now();
    
    reactionBox.classList.remove('waiting');
    reactionBox.classList.add('ready-click');
    
    const promptText = reactionBox.querySelector('.reaction-prompt-text');
    const subpromptText = reactionBox.querySelector('.reaction-subprompt-text');
    
    if (promptText) {
      promptText.textContent = 'CLICK NOW!';
      promptText.style.color = '#ffffff';
    }
    if (subpromptText) {
      subpromptText.textContent = 'RAPID REFLEX TRIGGER';
      subpromptText.style.color = 'rgba(255, 255, 255, 0.8)';
    }
  }

  function handleBoxClick() {
    const reactionBox = document.getElementById('reaction-box');
    if (!reactionBox) return;

    if (state === 'waiting') {
      // Too early!
      clearTimeout(timerId);
      state = 'feedback';
      
      reactionBox.classList.remove('waiting');
      reactionBox.classList.add('too-early');
      
      const promptText = reactionBox.querySelector('.reaction-prompt-text');
      const subpromptText = reactionBox.querySelector('.reaction-subprompt-text');
      if (promptText) {
        promptText.textContent = 'Too Early!';
        promptText.style.color = '#f59e0b';
      }
      if (subpromptText) {
        subpromptText.textContent = 'Attempt cancelled. Resetting... (Press SPACE/ENTER to skip)';
        subpromptText.style.color = 'var(--color-text-secondary)';
      }

      currentAttempt--; // Decrement attempt count to retry
      setFeedbackTimeout(() => {
        startNextAttempt();
      }, 1500);

    } else if (state === 'ready') {
      const clickTime = performance.now();
      const reflexLatency = clickTime - triggerTime;
      attempts.push(reflexLatency);
      
      state = 'feedback';
      reactionBox.classList.remove('ready-click');
      reactionBox.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      reactionBox.style.boxShadow = 'none';
      reactionBox.style.borderColor = 'var(--border-color)';
      
      const promptText = reactionBox.querySelector('.reaction-prompt-text');
      const subpromptText = reactionBox.querySelector('.reaction-subprompt-text');
      if (promptText) {
        promptText.textContent = `${reflexLatency.toFixed(0)} ms`;
        promptText.style.color = 'var(--color-cyan)';
      }
      if (subpromptText) {
        subpromptText.textContent = 'Response Recorded. (Press SPACE/ENTER to skip)';
        subpromptText.style.color = 'var(--color-text-muted)';
      }

      setFeedbackTimeout(() => {
        if (currentAttempt < totalAttempts) {
          startNextAttempt();
        } else {
          showResults();
        }
      }, 1500);
    } else if (state === 'feedback') {
      // Clicking the area or pressing SPACE during feedback skips the delay
      triggerFeedbackNext();
    }
  }

  function showResults() {
    state = 'results';
    
    const minTime = Math.min(...attempts);
    const maxTime = Math.max(...attempts);
    const avgTime = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    
    // Consistency calculation (Standard Deviation)
    const variance = attempts.reduce((sum, val) => sum + Math.pow(val - avgTime, 2), 0) / attempts.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 0.4)));

    // Rating determination
    let rating = 'Standard (Average)';
    let ratingClass = 'text-gradient-purple-blue';
    if (avgTime < 195) {
      rating = 'Exceptional (Supersonic Reflexes)';
      ratingClass = 'text-gradient-cyan-blue';
    } else if (avgTime < 240) {
      rating = 'Excellent (Above Average)';
      ratingClass = 'text-gradient-cyan-blue';
    } else if (avgTime > 310) {
      rating = 'Delayed (Below Average)';
      ratingClass = '';
    }

    container.innerHTML = `
      <div class="screen-wrapper" id="visual-results-screen">
        <h3 class="screen-title text-gradient-cyan-blue">EVALUATION METRICS</h3>
        <p class="screen-intro-text">
          Retinal signal translation cycle completed. Your cognitive results have been logged to the systems registry.
        </p>

        <div class="results-grid-layout">
          <div class="metric-highlight-card primary-accent">
            <span class="metric-card-label">Average Reflex Speed</span>
            <span class="metric-card-value">${avgTime.toFixed(0)} ms</span>
            <span class="metric-card-subtext">Overall ocular-motor latency index</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Reflex Rating</span>
            <span class="metric-card-value ${ratingClass}" style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; white-space: normal;">${rating}</span>
            <span class="metric-card-subtext">Calibrated classification group</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Fastest Reflex</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-success);">${minTime.toFixed(0)} ms</span>
            <span class="metric-card-subtext">Maximum synaptic potential</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Consistency Index</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-purple);">${consistencyScore.toFixed(0)}%</span>
            <span class="metric-card-subtext">Sensorimotor coordination stability</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-workspace-back" id="btn-results-exit" style="padding: 0.75rem 1.5rem;">Acknowledge &amp; Return</button>
          <button class="btn-primary" id="btn-results-restart" style="padding: 0.75rem 1.5rem;">Recalibrate</button>
        </div>
      </div>
    `;

    // Record the score
    window.PULSE.recordScore('visual', avgTime, `${avgTime.toFixed(0)} ms`, stdDev);
    window.PULSE.renderLeaderboard('visual');

    document.getElementById('btn-results-exit').addEventListener('click', () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      clearTimeout(timerId);
      triggerFeedbackNext();
      if (onComplete) onComplete();
    });

    document.getElementById('btn-results-restart').addEventListener('click', () => {
      attempts = [];
      currentAttempt = 0;
      startNextAttempt();
    });
  }
}

window.PULSE.startVisualTest = startVisualTest;
