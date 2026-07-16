window.PULSE = window.PULSE || {};

function startDirectionTest(container, onComplete) {
  let currentRound = 0;
  const totalRounds = 20;
  let correctCount = 0;
  let streak = 0;
  let maxStreak = 0;
  let responseTimes = [];
  let roundStartTime = 0;
  let currentTarget = null; // 'UP', 'DOWN', 'LEFT', 'RIGHT'
  let state = 'instructions';
  let timeoutId = null;

  const DIRECTIONS = [
    { key: 'UP', arrow: '↑', code: 'ArrowUp' },
    { key: 'DOWN', arrow: '↓', code: 'ArrowDown' },
    { key: 'LEFT', arrow: '←', code: 'ArrowLeft' },
    { key: 'RIGHT', arrow: '→', code: 'ArrowRight' }
  ];

  showInstructions();

  function showInstructions() {
    state = 'instructions';
    container.innerHTML = `
      <div class="screen-wrapper" id="direction-instruct-screen">
        <h3 class="screen-title text-gradient-cyan-blue">SPATIAL-MOTOR CALIBRATION</h3>
        <p class="screen-intro-text">
          Evaluate spatial-motor integration speed and spatial coordinate mapping pathways. Rapidly match the directional vectors displayed on screen.
        </p>
        <ul class="screen-steps-list">
          <li>
            <span class="step-num">1</span>
            <div><strong>Keyboard Controls:</strong> Use your keyboard Arrow keys (<span style="font-family: var(--font-mono); color: var(--color-cyan);">↑, ↓, ←, →</span>) to match the arrow direction.</div>
          </li>
          <li>
            <span class="step-num">2</span>
            <div><strong>Mobile/Touch Controls:</strong> If on a touch-screen device, use the sleek arrow control pad rendered on screen.</div>
          </li>
          <li>
            <span class="step-num">3</span>
            <div><strong>Progressive Acceleration:</strong> The arrow trigger speed accelerates. You have less time to respond in later rounds.</div>
          </li>
          <li>
            <span class="step-num">4</span>
            <div><strong>Perfect Accuracy:</strong> Complete 20 successive rounds. Achieve high streaks and rapid response times.</div>
          </li>
        </ul>
        <div style="margin-top: auto; text-align: right;">
          <button class="btn-primary" id="btn-start-direction-test" style="font-family: var(--font-display);">Begin Calibration</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-direction-test').addEventListener('click', () => {
      correctCount = 0;
      currentRound = 0;
      streak = 0;
      maxStreak = 0;
      responseTimes = [];
      startNextRound();
    });
  }

  function startNextRound() {
    currentRound++;
    state = 'active';

    const randDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    currentTarget = randDir;

    // Calculate response window based on current round (progressive acceleration)
    // Starts at 2.0s, drops to 0.8s by round 20
    const timeLimit = Math.max(800, 2000 - (currentRound - 1) * 63);

    container.innerHTML = `
      <div class="screen-wrapper">
        <div class="round-tracking-badge">ROUND ${currentRound} OF ${totalRounds}</div>
        
        <div class="test-play-zone" style="min-height: 340px;">
          <div class="direction-arrow-box" id="direction-arrow-box">
            ${currentTarget.arrow}
          </div>

          <!-- Touch control pad for mobile responsiveness -->
          <div class="direction-mobile-controls">
            <div class="dummy-cell"></div>
            <button class="btn-direction-key" id="btn-touch-up">↑</button>
            <div class="dummy-cell"></div>
            
            <button class="btn-direction-key" id="btn-touch-left">←</button>
            <button class="btn-direction-key" id="btn-touch-down">↓</button>
            <button class="btn-direction-key" id="btn-touch-right">→</button>
          </div>

          <div class="direction-stats-strip">
            <span>Streak: <strong style="color: var(--color-cyan);">${streak}</strong></span>
            <span>Limit: <strong style="color: var(--color-purple);">${(timeLimit/1000).toFixed(2)}s</strong></span>
          </div>
        </div>
      </div>
    `;

    // Keyboard and Touch listeners
    window.addEventListener('keydown', handleKeyboardInput);
    
    document.getElementById('btn-touch-up').addEventListener('click', () => handleInput('UP'));
    document.getElementById('btn-touch-down').addEventListener('click', () => handleInput('DOWN'));
    document.getElementById('btn-touch-left').addEventListener('click', () => handleInput('LEFT'));
    document.getElementById('btn-touch-right').addEventListener('click', () => handleInput('RIGHT'));

    roundStartTime = performance.now();

    // Start timer for timeout
    timeoutId = setTimeout(() => {
      handleInput('TIMEOUT');
    }, timeLimit);
  }

  function handleKeyboardInput(e) {
    if (state !== 'active') return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleInput('UP');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleInput('DOWN');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleInput('LEFT');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleInput('RIGHT');
    }
  }

  function handleInput(inputKey) {
    if (state !== 'active') return;
    state = 'feedback';

    // Clear timeout and remove event listener
    clearTimeout(timeoutId);
    window.removeEventListener('keydown', handleKeyboardInput);

    const arrowBox = document.getElementById('direction-arrow-box');
    const elapsed = performance.now() - roundStartTime;

    const isCorrect = (inputKey === currentTarget.key);

    if (isCorrect) {
      correctCount++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      responseTimes.push(elapsed);

      if (arrowBox) {
        arrowBox.style.borderColor = 'var(--color-success)';
        arrowBox.style.color = 'var(--color-success)';
        arrowBox.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.4)';
      }
    } else {
      streak = 0; // Reset streak on mistake or timeout

      if (arrowBox) {
        arrowBox.style.borderColor = '#ef4444';
        arrowBox.style.color = '#ef4444';
        arrowBox.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.4)';
      }
    }

    setTimeout(() => {
      if (currentRound < totalRounds) {
        startNextRound();
      } else {
        showResults();
      }
    }, 400);
  }

  function showResults() {
    state = 'results';
    window.removeEventListener('keydown', handleKeyboardInput);

    const accuracy = (correctCount / totalRounds) * 100;
    const avgTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    let rating = 'Standard (Average)';
    let ratingClass = '';
    if (accuracy >= 95 && avgTime < 380) {
      rating = 'Exceptional Coordination (Supersonic)';
      ratingClass = 'text-gradient-cyan-blue';
    } else if (accuracy >= 80 && avgTime < 500) {
      rating = 'Excellent (Above Average)';
      ratingClass = 'text-gradient-purple-blue';
    } else if (accuracy < 60) {
      rating = 'Delayed Response (Below Average)';
    }

    container.innerHTML = `
      <div class="screen-wrapper">
        <h3 class="screen-title text-gradient-cyan-blue">COORDINATION METRICS</h3>
        <p class="screen-intro-text">
          Spatial motor integration assessment complete. Performance variables recorded successfully.
        </p>

        <div class="results-grid-layout">
          <div class="metric-highlight-card primary-accent">
            <span class="metric-card-label">Spatial Accuracy</span>
            <span class="metric-card-value">${accuracy.toFixed(0)}%</span>
            <span class="metric-card-subtext">${correctCount} correct response mappings of ${totalRounds}</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Motor Rating</span>
            <span class="metric-card-value ${ratingClass}" style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; white-space: normal;">${rating}</span>
            <span class="metric-card-subtext">Calibrated reflex rating</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Avg Motor Speed</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-cyan);">${avgTime > 0 ? avgTime.toFixed(0) + ' ms' : '--'}</span>
            <span class="metric-card-subtext">Optic-to-motor execution speed</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Max Response Combo</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-purple);">${maxStreak}</span>
            <span class="metric-card-subtext">Consecutive rapid error-free responses</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-workspace-back" id="btn-results-exit" style="padding: 0.75rem 1.5rem;">Acknowledge &amp; Return</button>
          <button class="btn-primary" id="btn-results-restart" style="padding: 0.75rem 1.5rem;">Recalibrate</button>
        </div>
      </div>
    `;

    // Record score: accuracy is primary sort, average response time is secondary sort
    window.PULSE.recordScore('direction', accuracy, `${accuracy.toFixed(0)}%`, avgTime);
    window.PULSE.renderLeaderboard('direction');

    document.getElementById('btn-results-exit').addEventListener('click', () => {
      if (onComplete) onComplete();
    });

    document.getElementById('btn-results-restart').addEventListener('click', () => {
      correctCount = 0;
      currentRound = 0;
      streak = 0;
      maxStreak = 0;
      responseTimes = [];
      startNextRound();
    });
  }
}

window.PULSE.startDirectionTest = startDirectionTest;
