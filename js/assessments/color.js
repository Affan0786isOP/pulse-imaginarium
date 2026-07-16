window.PULSE = window.PULSE || {};

function startColorTest(container, onComplete) {
  let currentRound = 0;
  const totalRounds = 15;
  let correctCount = 0;
  let responseTimes = [];
  let roundStartTime = 0;
  let currentWord = null;
  let currentColor = null;
  let currentInstruction = ''; // 'WORD' or 'COLOR'

  const COLORS = [
    { name: 'RED', value: '#ef4444' },
    { name: 'BLUE', value: '#3b82f6' },
    { name: 'GREEN', value: '#10b981' },
    { name: 'YELLOW', value: '#eab308' },
    { name: 'PURPLE', value: '#a855f7' }
  ];

  showInstructions();

  function showInstructions() {
    container.innerHTML = `
      <div class="screen-wrapper" id="color-instruct-screen">
        <h3 class="screen-title text-gradient-purple-blue">COGNITIVE INHIBITION EVALUATION</h3>
        <p class="screen-intro-text">
          Quantify prefrontal pre-potent response inhibition and selective attention. This module administers a speeded Stroop task to evaluate interference resolution latencies.
        </p>
        <ul class="screen-steps-list">
          <li>
            <span class="step-num">1</span>
            <div><strong>Read Instructions:</strong> A high-alert command will prompt you to identify either the literal written <strong style="color: var(--color-cyan);">WORD</strong> or the visual <strong style="color: var(--color-purple);">COLOR</strong> of the text.</div>
          </li>
          <li>
            <span class="step-num">2</span>
            <div><strong>Observe Stimulus:</strong> A colored word will flash on screen. The literal word and the display color will often conflict (e.g., the word "BLUE" styled in <span style="color: #ef4444; font-weight: bold;">RED</span> color).</div>
          </li>
          <li>
            <span class="step-num">3</span>
            <div><strong>Select Button:</strong> Click the matching button representing the correct answer as fast as physically possible.</div>
          </li>
          <li>
            <span class="step-num">4</span>
            <div><strong>Maintain Focus:</strong> Complete 15 successive rounds. Speed and accuracy are both critical metric variables.</div>
          </li>
        </ul>
        <div style="margin-top: auto; text-align: right;">
          <button class="btn-primary" id="btn-start-color-test" style="font-family: var(--font-display);">Begin Test</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-color-test').addEventListener('click', () => {
      correctCount = 0;
      currentRound = 0;
      responseTimes = [];
      startNextRound();
    });
  }

  function startNextRound() {
    currentRound++;
    
    // Pick random word and random color
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    let colorIndex = Math.floor(Math.random() * COLORS.length);
    
    // 70% chance to force mismatch to create Stroop interference
    if (Math.random() < 0.7 && wordIndex === colorIndex) {
      colorIndex = (colorIndex + 1) % COLORS.length;
    }

    currentWord = COLORS[wordIndex];
    currentColor = COLORS[colorIndex];
    
    // Choose prompt: identify WORD or COLOR (50/50 chance)
    currentInstruction = Math.random() < 0.5 ? 'WORD' : 'COLOR';

    container.innerHTML = `
      <div class="screen-wrapper">
        <div class="round-tracking-badge">ROUND ${currentRound} OF ${totalRounds}</div>
        
        <div class="test-play-zone" style="min-height: 340px;">
          <div class="stroop-instruct-header">Identify the</div>
          <div class="stroop-instruction-bold" id="stroop-instruction" style="
            background: ${currentInstruction === 'WORD' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(157, 78, 221, 0.1)'};
            border: 1px solid ${currentInstruction === 'WORD' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(157, 78, 221, 0.2)'};
            color: ${currentInstruction === 'WORD' ? 'var(--color-cyan)' : 'var(--color-purple)'};
          ">
            ${currentInstruction}
          </div>

          <div class="stroop-word-display" style="color: ${currentColor.value};">
            ${currentWord.name}
          </div>

          <div class="stroop-choices-container" id="stroop-choices">
            <!-- Choice buttons populated here -->
          </div>
        </div>
      </div>
    `;

    const choicesContainer = document.getElementById('stroop-choices');
    COLORS.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'btn-stroop-choice';
      btn.textContent = color.name;
      btn.dataset.colorName = color.name;
      choicesContainer.appendChild(btn);
      
      btn.addEventListener('click', () => handleChoiceClick(color.name, btn));
    });

    roundStartTime = performance.now();
  }

  function handleChoiceClick(selectedName, clickedBtn) {
    const elapsed = performance.now() - roundStartTime;
    responseTimes.push(elapsed);

    // Disable all buttons to prevent double-clicks
    document.querySelectorAll('.btn-stroop-choice').forEach(b => b.disabled = true);

    const correctAnswerName = (currentInstruction === 'WORD') ? currentWord.name : currentColor.name;
    const isCorrect = (selectedName === correctAnswerName);

    if (isCorrect) {
      correctCount++;
      clickedBtn.style.borderColor = 'var(--color-success)';
      clickedBtn.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      clickedBtn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.15)';
    } else {
      clickedBtn.style.borderColor = '#ef4444';
      clickedBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      clickedBtn.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.15)';
      
      // Highlight the correct one
      document.querySelectorAll('.btn-stroop-choice').forEach(b => {
        if (b.dataset.colorName === correctAnswerName) {
          b.style.borderColor = 'var(--color-success)';
        }
      });
    }

    setTimeout(() => {
      if (currentRound < totalRounds) {
        startNextRound();
      } else {
        showResults();
      }
    }, 600);
  }

  function showResults() {
    const accuracy = (correctCount / totalRounds) * 100;
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    let rating = 'Standard (Average)';
    let ratingClass = '';
    if (accuracy >= 93 && avgTime < 750) {
      rating = 'Exceptional Focus (Supersonic)';
      ratingClass = 'text-gradient-cyan-blue';
    } else if (accuracy >= 80 && avgTime < 1000) {
      rating = 'Excellent (Above Average)';
      ratingClass = 'text-gradient-purple-blue';
    } else if (accuracy < 60) {
      rating = 'Delayed Focus (Below Average)';
    }

    container.innerHTML = `
      <div class="screen-wrapper">
        <h3 class="screen-title text-gradient-purple-blue">INHIBITION METRICS</h3>
        <p class="screen-intro-text">
          Selective attention test successfully finished. Your diagnostic readings have been securely logged.
        </p>

        <div class="results-grid-layout">
          <div class="metric-highlight-card primary-accent">
            <span class="metric-card-label">Selective Accuracy</span>
            <span class="metric-card-value">${accuracy.toFixed(1)}%</span>
            <span class="metric-card-subtext">${correctCount} correct answers of ${totalRounds}</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Attention Rating</span>
            <span class="metric-card-value ${ratingClass}" style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; white-space: normal;">${rating}</span>
            <span class="metric-card-subtext">Calibrated prefrontal classification</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Avg Decision Speed</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-cyan);">${avgTime.toFixed(0)} ms</span>
            <span class="metric-card-subtext">Decision resolution and trigger cycle</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Interference Overload</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-purple);">${(totalRounds - correctCount)}</span>
            <span class="metric-card-subtext">Total error responses registered</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-workspace-back" id="btn-results-exit" style="padding: 0.75rem 1.5rem;">Acknowledge &amp; Return</button>
          <button class="btn-primary" id="btn-results-restart" style="padding: 0.75rem 1.5rem;">Recalibrate</button>
        </div>
      </div>
    `;

    // Record score: accuracy is primary sort, average response time is secondary sort
    window.PULSE.recordScore('color', accuracy, `${accuracy.toFixed(0)}%`, avgTime);
    window.PULSE.renderLeaderboard('color');

    document.getElementById('btn-results-exit').addEventListener('click', () => {
      if (onComplete) onComplete();
    });

    document.getElementById('btn-results-restart').addEventListener('click', () => {
      correctCount = 0;
      currentRound = 0;
      responseTimes = [];
      startNextRound();
    });
  }
}

window.PULSE.startColorTest = startColorTest;
