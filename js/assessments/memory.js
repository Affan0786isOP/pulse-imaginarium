window.PULSE = window.PULSE || {};

function startMemoryTest(container, onComplete) {
  let level = 1;
  let lives = 3;
  let gridCols = 3;
  let gridRows = 3;
  let tilesCount = 3;
  
  let currentPattern = []; // indices of correct cells
  let userSelected = []; // indices clicked by user
  let state = 'instructions'; // instructions, showing, playing, feedback, results
  
  let totalCorrectClicks = 0;
  let totalClicks = 0;

  showInstructions();

  function showInstructions() {
    state = 'instructions';
    container.innerHTML = `
      <div class="screen-wrapper" id="memory-instruct-screen">
        <h3 class="screen-title text-gradient-purple-blue">SPATIAL WORKING MEMORY GRID</h3>
        <p class="screen-intro-text">
          Evaluate your prefrontal spatial cache size. Memorize and reconstruct progressive geometric spatial patterns across a modular high-speed tile matrix.
        </p>
        <ul class="screen-steps-list">
          <li>
            <span class="step-num">1</span>
            <div><strong>Observe Pattern:</strong> A grid of tiles will appear, and a set of random cells will illuminate in purple. Memorize their spatial coordinates.</div>
          </li>
          <li>
            <span class="step-num">2</span>
            <div><strong>Tile Occlusion:</strong> After 1.5 seconds, the cells will dim back to their default standby state.</div>
          </li>
          <li>
            <span class="step-num">3</span>
            <div><strong>Reconstruct:</strong> Select the correct tiles from memory. Correct selections light up in cyan; incorrect in red.</div>
          </li>
          <li>
            <span class="step-num">4</span>
            <div><strong>Progressive Scaling:</strong> Grid columns/rows and target pattern lengths increase at higher levels. Three total mistakes terminate the evaluation.</div>
          </li>
        </ul>
        <div style="margin-top: auto; text-align: right;">
          <button class="btn-primary" id="btn-start-memory-test" style="font-family: var(--font-display);">Start Calibration</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-memory-test').addEventListener('click', () => {
      level = 1;
      lives = 3;
      totalCorrectClicks = 0;
      totalClicks = 0;
      configureLevel();
      startLevel();
    });
  }

  function configureLevel() {
    if (level === 1) {
      gridCols = gridRows = 3;
      tilesCount = 3;
    } else if (level === 2) {
      gridCols = gridRows = 3;
      tilesCount = 4;
    } else if (level === 3) {
      gridCols = gridRows = 4;
      tilesCount = 4;
    } else if (level === 4) {
      gridCols = gridRows = 4;
      tilesCount = 5;
    } else if (level === 5) {
      gridCols = gridRows = 5;
      tilesCount = 5;
    } else if (level === 6) {
      gridCols = gridRows = 5;
      tilesCount = 6;
    } else {
      // Scale up infinitely
      gridCols = gridRows = 6;
      tilesCount = Math.min(18, 5 + Math.floor(level / 2));
    }
  }

  function startLevel() {
    state = 'showing';
    userSelected = [];
    currentPattern = [];

    // Render static workspace
    container.innerHTML = `
      <div class="screen-wrapper">
        <div class="round-tracking-badge">LEVEL ${level}</div>
        
        <div class="test-play-zone" style="min-height: 360px;">
          <div class="memory-stats-strip">
            <div class="memory-stat-item">
              <span class="memory-stat-label">Grid Size</span>
              <span class="memory-stat-value" id="memory-grid-dim">${gridCols} x ${gridRows}</span>
            </div>
            <div class="memory-stat-item" style="align-items: flex-end;">
              <span class="memory-stat-label">Lives Remaining</span>
              <div class="heart-lives-wrap" id="heart-lives-container">
                <!-- Hearts populated in JS -->
              </div>
            </div>
          </div>

          <div class="matrix-grid-container" id="matrix-grid" style="
            grid-template-columns: repeat(${gridCols}, 1fr);
            grid-template-rows: repeat(${gridRows}, 1fr);
            max-width: ${gridCols > 5 ? '420px' : '380px'};
          ">
            <!-- Grid cells generated here -->
          </div>
        </div>
      </div>
    `;

    renderLives();

    const grid = document.getElementById('matrix-grid');
    const totalCells = gridCols * gridRows;

    // Generate cell items in grid
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';
      cell.dataset.index = i;
      grid.appendChild(cell);
    }

    // Pick unique random indexes for pattern
    const cellIndices = Array.from({ length: totalCells }, (_, index) => index);
    for (let k = 0; k < tilesCount; k++) {
      const randIdx = Math.floor(Math.random() * cellIndices.length);
      const chosenCell = cellIndices.splice(randIdx, 1)[0];
      currentPattern.push(chosenCell);
    }

    // Flash the pattern after 500ms delay to let user focus
    setTimeout(() => {
      flashPattern();
    }, 500);
  }

  function renderLives() {
    const container = document.getElementById('heart-lives-container');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('svg');
      heart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      heart.setAttribute('width', '16');
      heart.setAttribute('height', '16');
      heart.setAttribute('viewBox', '0 0 24 24');
      heart.setAttribute('fill', 'none');
      heart.setAttribute('stroke', 'currentColor');
      heart.setAttribute('stroke-width', '2');
      heart.setAttribute('stroke-linecap', 'round');
      heart.setAttribute('stroke-linejoin', 'round');
      heart.className = `heart-icon ${i >= lives ? 'lost' : ''}`;
      heart.innerHTML = '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>';
      container.appendChild(heart);
    }
  }

  function flashPattern() {
    const cells = document.querySelectorAll('.matrix-cell');
    
    // Highlight cells in pattern
    currentPattern.forEach(idx => {
      cells[idx].classList.add('illuminated');
    });

    // Dim them after 1400ms display time
    setTimeout(() => {
      cells.forEach(c => c.classList.remove('illuminated'));
      state = 'playing';
      enableCellClicks();
    }, 1400);
  }

  function enableCellClicks() {
    const cells = document.querySelectorAll('.matrix-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (state !== 'playing') return;
        
        const cellIdx = parseInt(cell.dataset.index, 10);
        
        // Prevent double click on same cell
        if (userSelected.includes(cellIdx)) return;
        
        totalClicks++;
        userSelected.push(cellIdx);

        if (currentPattern.includes(cellIdx)) {
          // Correct click
          totalCorrectClicks++;
          cell.classList.add('correct-click');

          // Check if entire pattern is matched
          const hasWon = currentPattern.every(idx => userSelected.includes(idx));
          if (hasWon) {
            state = 'feedback';
            setTimeout(() => {
              level++;
              configureLevel();
              startLevel();
            }, 800);
          }
        } else {
          // Incorrect click
          cell.classList.add('incorrect-click');
          lives--;
          renderLives();

          // Highlight correct remaining tiles so user gets visual feedback
          const cellsList = document.querySelectorAll('.matrix-cell');
          currentPattern.forEach(idx => {
            if (!userSelected.includes(idx)) {
              cellsList[idx].style.borderColor = 'var(--color-cyan)';
            }
          });

          state = 'feedback';

          setTimeout(() => {
            if (lives <= 0) {
              showResults();
            } else {
              // Retry current level (keep level index, generate new pattern)
              startLevel();
            }
          }, 1200);
        }
      });
    });
  }

  function showResults() {
    state = 'results';
    
    const accuracy = totalClicks > 0 ? (totalCorrectClicks / totalClicks) * 100 : 0;
    const highestLevel = level;

    let rating = 'Standard (Average)';
    let ratingClass = '';
    if (highestLevel >= 9) {
      rating = 'Exceptional Cache (Supersonic)';
      ratingClass = 'text-gradient-cyan-blue';
    } else if (highestLevel >= 6) {
      rating = 'Excellent (Above Average)';
      ratingClass = 'text-gradient-purple-blue';
    } else if (highestLevel <= 3) {
      rating = 'Delayed Cache (Below Average)';
    }

    container.innerHTML = `
      <div class="screen-wrapper">
        <h3 class="screen-title text-gradient-purple-blue">SYNAPTIC CACHE METRICS</h3>
        <p class="screen-intro-text">
          Geometric pattern sequence terminated. Your working memory limits have been recorded.
        </p>

        <div class="results-grid-layout">
          <div class="metric-highlight-card primary-accent">
            <span class="metric-card-label">Highest Level Reached</span>
            <span class="metric-card-value">Level ${highestLevel}</span>
            <span class="metric-card-subtext">Prefrontal spatial threshold reached</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Working Capacity</span>
            <span class="metric-card-value ${ratingClass}" style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; white-space: normal;">${rating}</span>
            <span class="metric-card-subtext">Spatial sequence grouping classification</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Total Tile Matches</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-cyan);">${totalCorrectClicks}</span>
            <span class="metric-card-subtext">Correct spatial coordinates recalled</span>
          </div>
          <div class="metric-highlight-card">
            <span class="metric-card-label">Retrieval Accuracy</span>
            <span class="metric-card-value" style="font-size: 1.5rem; color: var(--color-purple);">${accuracy.toFixed(0)}%</span>
            <span class="metric-card-subtext">Correct index selections of total clicks</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-workspace-back" id="btn-results-exit" style="padding: 0.75rem 1.5rem;">Acknowledge &amp; Return</button>
          <button class="btn-primary" id="btn-results-restart" style="padding: 0.75rem 1.5rem;">Recalibrate</button>
        </div>
      </div>
    `;

    // Record score: level achieved is primary, total correct matches is secondary
    window.PULSE.recordScore('memory', highestLevel, `Level ${highestLevel}`, totalCorrectClicks);
    window.PULSE.renderLeaderboard('memory');

    document.getElementById('btn-results-exit').addEventListener('click', () => {
      if (onComplete) onComplete();
    });

    document.getElementById('btn-results-restart').addEventListener('click', () => {
      level = 1;
      lives = 3;
      totalCorrectClicks = 0;
      totalClicks = 0;
      configureLevel();
      startLevel();
    });
  }
}

window.PULSE.startMemoryTest = startMemoryTest;
