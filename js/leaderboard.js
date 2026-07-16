/**
 * PULSE - Performance Recording & Leaderboards Engine
 * Handles localStorage records, sorting, and UI population
 */

window.PULSE = window.PULSE || {};

(function () {
  const storage = window.PULSE.storage;

  const STORAGE_KEY = 'pulse_assessment_records_v1';

  function recordScore(assessmentId, scoreValue, scoreFormatted, secondaryValue = 0) {
    const name = storage.getItem('pulse_user_name');
    const age = parseInt(storage.getItem('pulse_user_age') || '0', 10);

    if (!name || !age) return;

    const records = getAllRecords();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const newRecord = {
      id: 'rec_' + Math.random().toString(36).substr(2, 9),
      name,
      age,
      assessment: assessmentId,
      score: scoreValue,
      scoreFormatted,
      secondary: secondaryValue,
      date: dateStr,
      timestamp: Date.now()
    };

    records.push(newRecord);
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
  window.PULSE.recordScore = recordScore;

  function getAllRecords() {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  window.PULSE.getAllRecords = getAllRecords;

  function getScores(assessmentId) {
    const all = getAllRecords();
    const filtered = all.filter(r => r.assessment === assessmentId);

    // Sorting Rules:
    if (assessmentId === 'visual') {
      // Reaction speed: lower score is better
      filtered.sort((a, b) => a.score - b.score);
    } else if (assessmentId === 'color' || assessmentId === 'direction') {
      // Accuracy (percentage): higher is better.
      // If accuracy is equal, lower response time (secondary) is better
      filtered.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.secondary - b.secondary;
      });
    } else if (assessmentId === 'memory') {
      // Level: higher is better
      filtered.sort((a, b) => b.score - a.score);
    }

    return filtered;
  }
  window.PULSE.getScores = getScores;

  function clearScores() {
    storage.removeItem(STORAGE_KEY);
  }
  window.PULSE.clearScores = clearScores;

  function renderLeaderboard(assessmentId) {
    const tbody = document.getElementById('leaderboard-tbody');
    const emptyState = document.getElementById('leaderboard-empty');
    const table = document.getElementById('leaderboard-table');

    if (!tbody || !emptyState || !table) return;

    const data = getScores(assessmentId);

    // Set active tab styling
    document.querySelectorAll('.leaderboard-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-leaderboard') === assessmentId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tbody.innerHTML = '';

    if (data.length === 0) {
      table.style.display = 'none';
      emptyState.style.display = 'flex';
    } else {
      table.style.display = 'table';
      emptyState.style.display = 'none';
 
      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.id = `lb-row-${row.id}`;
        
        // Rank formatting
        let rankText = `#${index + 1}`;
        let rankColorClass = '';
        if (index === 0) {
          rankText = '🥇';
        } else if (index === 1) {
          rankText = '🥈';
        } else if (index === 2) {
          rankText = '🥉';
        }

        tr.innerHTML = `
          <td style="font-weight: 700; padding-left: 1.5rem; text-align: left;">${rankText}</td>
          <td style="text-align: left; font-weight: 500; color: var(--color-text-primary);">${escapeHtml(row.name)}</td>
          <td style="text-align: center; font-family: var(--font-mono); font-size: 0.85rem;">${row.age}</td>
          <td style="text-align: right; font-family: var(--font-mono); font-weight: 600; color: var(--color-cyan);">${row.scoreFormatted}</td>
          <td style="text-align: right; font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-muted);">${row.date}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  window.PULSE.renderLeaderboard = renderLeaderboard;

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
})();
